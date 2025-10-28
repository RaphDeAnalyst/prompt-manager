import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth].js";
import { callHuggingFace, parsePromptGeneration } from "../../../lib/huggingface.js";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;

  try {
    const { task, context } = req.body;

    if (!task) {
      return res.status(400).json({ error: "Task description is required" });
    }

    // Check token limit
    const currentDate = new Date();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const monthlyUsage = await prisma.usage.aggregate({
      where: {
        user_id: userId,
        created_at: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: {
        total_tokens: true,
      },
    });

    const tokensUsedThisMonth = monthlyUsage._sum.total_tokens || 0;
    const FREE_LIMIT = 50000;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user.isPaid && tokensUsedThisMonth >= FREE_LIMIT) {
      return res.status(429).json({
        error: "You've reached your monthly free token limit",
        tokensUsed: tokensUsedThisMonth,
        limit: FREE_LIMIT,
      });
    }

    // Build system prompt with professional-grade standards
    const systemPrompt = `You are an expert Prompt Engineer and Creative Strategist. Your task is to generate clear, effective, and high-quality AI prompts based on a short user description or idea.

When generating a prompt, always include:
1. **Title** – A short, clear, and creative title summarizing the purpose of the prompt.
2. **Prompt Content** – A full, well-structured prompt that an AI can use directly to perform the requested task.
3. **Tags** – 8–12 concise keywords or hashtags that categorize the topic, domain, and focus area.

---

### Follow These Rules When Generating Prompts:
1. **Add Context & Role Definition** – If the task involves expertise (e.g., marketing, data analysis, design), specify the AI's role clearly (e.g., "You are a Web3 data analyst…").
2. **Clarify Goals & Output** – Clearly describe what the user expects the AI to deliver (e.g., "Generate a summary," "Create a business plan," "List actionable insights").
3. **Include Format or Constraints** – Define how the AI should present the result (e.g., "in bullet points," "under 150 words," "in JSON format," "use friendly tone").
4. **Be Specific & Practical** – Use realistic and relatable examples. Avoid vagueness.
5. **Adapt Placeholders Dynamically** – When the user's idea requires additional details (e.g., dataset name, company, URL), use descriptive placeholders in curly braces {} instead of guessing or fabricating information.
6. **Ensure Coherence** – Every generated prompt must be ready-to-use, understandable, and coherent even with placeholders present.
7. **Include Diversity of Focus** – If the topic allows, suggest a niche or angle to make the prompt more targeted (e.g., "Web3 analyst focusing on NFT liquidity trends").

---

### Placeholder Rules
Use placeholders to make prompts adaptive and reusable:
- For data tasks → {add_column_names}, {upload_dataset_name}
- For web tasks → {add_example_website}, {insert_target_audience}, {define_user_goal}
- For business prompts → {insert_company_name}, {insert_product_description}, {specify_industry}
- For technical code → {insert_function_name}, {add_API_endpoint}

**Never** invent fake data. Always use placeholders if the user didn't supply details.

---

### Output Format
Always respond in valid JSON format ONLY (no markdown, no code blocks, no explanations).

The JSON structure should be:
- "title": A short, specific, and relevant title for the prompt
- "prompt": A detailed, complete, production-ready prompt that spans multiple paragraphs. Include role definition, clear goals, structured sections, format/constraint specifications, placeholders where needed, and practical examples. The prompt should be 800-1500 characters and ready for direct use by an AI.
- "tags": Array of 8-12 tags like: Tag1, Tag2, Tag3, Tag4, Tag5, Tag6, Tag7, Tag8, Tag9, Tag10, Tag11, Tag12

CRITICAL RULES:
- Generate prompts that are 2-3x more detailed than the user's request
- Include 8-12 tags (not 3)
- Prompt content should be substantial (800-1500 chars minimum)
- Add role definitions, goals, structure, constraints, and examples
- Use placeholders for missing details (never invent fake data)
- Return ONLY valid JSON, no markdown code blocks, no backticks, no extra text
- Make the prompt production-ready and immediately usable`;

    const userPrompt = `Task: ${task}${context ? `\nContext: ${context}` : ""}`;

    // Call Ollama directly with optimized parameters
    let content = '';
    let usage = { input_tokens: 0, output_tokens: 0, total_tokens: 0 };

    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-oss:120b-cloud",
          prompt: `${systemPrompt}\n\nTask: ${task}${context ? `\nContext: ${context}` : ""}\n\nReturn ONLY valid JSON:`,
          stream: false,
          options: {
            temperature: 0.3, // Lower for more consistent JSON output
            top_p: 0.7,
            num_predict: 800, // More tokens for better JSON generation with powerful model
            repeat_penalty: 1.1,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      content = data.response || "";

      // Remove the input prompt from the output
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      if (content.startsWith(fullPrompt)) {
        content = content.substring(fullPrompt.length).trim();
      }

      // Estimate token count
      const estimatedInputTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 4);
      const estimatedOutputTokens = Math.ceil(content.length / 4);

      usage = {
        input_tokens: estimatedInputTokens,
        output_tokens: estimatedOutputTokens,
        total_tokens: estimatedInputTokens + estimatedOutputTokens,
      };
    } catch (error) {
      console.error("Ollama error:", error);
      throw new Error("Failed to generate prompt. Make sure Ollama is running: ollama serve");
    }

    // Parse the JSON response more robustly
    let parsed = {
      title: "Generated Prompt",
      prompt: "No prompt generated",
      tags: [],
    };

    try {
      // Clean content - extract JSON from markdown code blocks
      let cleanContent = content.trim();

      // Remove any leading/trailing text before JSON
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }

      // Try to parse the JSON
      if (cleanContent.startsWith('{')) {
        parsed = JSON.parse(cleanContent);

        // Handle both "prompt" and "content" field names for backward compatibility
        if (!parsed.prompt && parsed.content) {
          parsed.prompt = parsed.content;
          delete parsed.content;
        }

        // Validate and clean parsed data
        if (!parsed.title || typeof parsed.title !== "string" || parsed.title.trim().length === 0) {
          parsed.title = `Professional Prompt: ${task.substring(0, 50)}`;
        } else {
          parsed.title = parsed.title.trim().substring(0, 100);
        }

        if (!parsed.prompt || typeof parsed.prompt !== "string" || parsed.prompt.trim().length === 0) {
          // Generate a quality fallback prompt
          parsed.prompt = generateQualityPrompt(task, context);
        } else {
          // Clean up escaped newlines and other escape sequences in prompt
          parsed.prompt = parsed.prompt
            .replace(/\\n/g, "\n")
            .replace(/\\t/g, "\t")
            .replace(/\\\//g, "/")
            .replace(/\\"/g, '"')
            .trim();
        }

        if (!Array.isArray(parsed.tags) || parsed.tags.length === 0) {
          // Extract tags from task or title
          parsed.tags = generateSmartTags(parsed.title || task);
        } else {
          parsed.tags = parsed.tags.map(t => String(t).trim()).filter(t => t.length > 0).slice(0, 12);
        }
      } else {
        // If JSON parsing completely fails, generate quality defaults
        parsed = {
          title: `Professional Prompt: ${task.substring(0, 50)}`,
          prompt: generateQualityPrompt(task, context),
          tags: generateSmartTags(task),
        };
      }
    } catch (parseError) {
      console.error("Error parsing generated prompt:", parseError, "content:", content);
      // Generate quality fallback when JSON parsing fails
      parsed = {
        title: `Professional Prompt: ${task.substring(0, 50)}`,
        prompt: generateQualityPrompt(task, context),
        tags: generateSmartTags(task),
      };
    }

    // Helper function to generate a quality prompt when AI fails
    function generateQualityPrompt(userTask, userContext) {
      const role = inferRole(userTask);
      const goal = userTask.substring(0, 100);
      const constraints = inferConstraints(userTask);

      return `You are a ${role}.

Goal: ${goal}

Your task:
${userTask}${userContext ? `\n\nContext: ${userContext}` : ''}

Your response should include:
1. A clear understanding of the objective
2. Structured, step-by-step approach
3. Actionable recommendations or deliverables
4. Examples where relevant

Format: Professional, clear, and concise.
${constraints}`;
    }

    // Helper function to infer role from task
    function inferRole(task) {
      const taskLower = task.toLowerCase();
      if (taskLower.includes('email')) return 'email marketing specialist';
      if (taskLower.includes('blog') || taskLower.includes('write')) return 'professional content writer';
      if (taskLower.includes('code') || taskLower.includes('develop')) return 'senior software engineer';
      if (taskLower.includes('data') || taskLower.includes('analyz')) return 'data analyst';
      if (taskLower.includes('business') || taskLower.includes('strateg')) return 'business strategist';
      if (taskLower.includes('creat') || taskLower.includes('design')) return 'creative director';
      return 'expert professional in your field';
    }

    // Helper function to infer constraints from task
    function inferConstraints(task) {
      const taskLower = task.toLowerCase();
      if (taskLower.includes('email')) return 'Max length: 500 characters. Tone: professional and persuasive.';
      if (taskLower.includes('blog')) return 'Max length: 2000 words. Format: well-structured with headers. Tone: engaging and informative.';
      if (taskLower.includes('code')) return 'Use best practices. Include comments. Ensure code is production-ready.';
      return 'Tone: professional and clear. Be concise and actionable.';
    }

    // Helper function to generate smart tags
    function generateSmartTags(text) {
      const stopWords = new Set(['the', 'a', 'an', 'for', 'to', 'and', 'or', 'is', 'are', 'be', 'been', 'of', 'in', 'on', 'at', 'by', 'as', 'it']);
      const words = text.toLowerCase().split(/\s+/);
      const tags = words
        .filter(w => w.length > 3 && !stopWords.has(w))
        .slice(0, 3);
      return tags.length > 0 ? tags : ['prompt', 'generated', 'professional'];
    }

    // Log usage
    const usageRecord = await prisma.usage.create({
      data: {
        user_id: userId,
        prompt_id: null,
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        total_tokens: usage.total_tokens,
      },
    });

    // Create prompt in database
    const newPrompt = await prisma.prompt.create({
      data: {
        user_id: userId,
        title: parsed.title,
        content: parsed.prompt,
        tags: parsed.tags || [],
        source: "AI",
        summary: `Generated from task: ${task}`,
      },
    });

    // Update user usage
    const newTotalUsage = tokensUsedThisMonth + usage.total_tokens;
    await prisma.user.update({
      where: { id: userId },
      data: {
        usage_tokens: newTotalUsage,
      },
    });

    return res.status(201).json({
      success: true,
      prompt: newPrompt,
      tokens_used: usage.total_tokens,
      usage_remaining: Math.max(0, FREE_LIMIT - newTotalUsage),
      message: "Prompt successfully generated by AI",
    });
  } catch (error) {
    console.error("Generate prompt error:", error);
    return res.status(500).json({
      error: "Failed to generate prompt",
      message: error.message,
    });
  }
}

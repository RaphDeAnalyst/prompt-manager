import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth].js";
import { callHuggingFace } from "../../../lib/huggingface.js";

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
    const { promptContent, promptId } = req.body;

    if (!promptContent && !promptId) {
      return res.status(400).json({
        error: "Either promptContent or promptId is required",
      });
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

    // Get prompt content if ID is provided
    let contentToOptimize = promptContent;
    if (promptId && !promptContent) {
      const prompt = await prisma.prompt.findUnique({
        where: { id: promptId },
      });

      if (!prompt || prompt.user_id !== userId) {
        return res.status(404).json({ error: "Prompt not found" });
      }

      contentToOptimize = prompt.content;
    }

    // Call Ollama to optimize with professional-grade standards
    const systemPrompt = `CRITICAL INSTRUCTION: Your role is PROMPT OPTIMIZATION, NOT PROMPT EXECUTION.

You are NOT supposed to execute, run, or fulfill the prompt given to you.
You ARE supposed to REWRITE and IMPROVE the prompt itself.

IMPORTANT DISTINCTION:
- ❌ WRONG: If given "Write a blog post about AI", you should NOT write a blog post
- ✅ CORRECT: If given "Write a blog post about AI", you should REWRITE IT as: "You are an experienced tech journalist with 10+ years of experience. Create a comprehensive blog post about the impact of AI on business, targeting {target_audience}. The post should be 1500-2000 words and structured as: Introduction, 3-4 Key Trends, Real-world Examples, Future Outlook, and Conclusion. Use an authoritative yet accessible tone..."

---

OPTIMIZATION STRATEGIES TO APPLY (Pick 3-5 most relevant):

1. **Define Expert Role**: Add a specific, authoritative persona (e.g., "seasoned," "experienced," "expert with X years of experience")
2. **Add Target Audience**: Specify WHO this prompt is for (e.g., "for {target_audience}", "for business leaders", "for beginners")
3. **Structure the Task**: Break down vague tasks into clear sections, steps, or components
4. **Set Precise Constraints**: Add word counts, format requirements, tone specifications (e.g., "800-1000 words", "professional tone", "bullet points")
5. **Specify Deliverable Format**: Be explicit about the output format (e.g., "JSON", "step-by-step guide", "list with explanations")
6. **Add Examples/Context**: Include what success looks like or example scenarios
7. **Use Placeholders**: Replace customizable details with {descriptive_placeholders} for reusability

PLACEHOLDER EXAMPLES:
- {target_audience} - who should read this
- {specific_topic} - what to focus on
- {word_count} - length requirement
- {company_name} - customizable company name
- {specific_scenario} - concrete situation

---

OUTPUT FORMAT:
Provide EXACTLY this format (plain text, no JSON, no code blocks):

OPTIMIZED PROMPT:
[Your completely rewritten, enhanced prompt as natural flowing paragraphs. Make it 2-3x more detailed than the input. Use placeholders for customizable details. NO section headers like "Objective" or "Role" - just natural prose with visual breaks.]

KEY IMPROVEMENTS:
- [Specific improvement made and why it matters]
- [Specific improvement made and why it matters]
- [Specific improvement made and why it matters]

EXAMPLE OUTPUT for "Write a blog post about AI":

OPTIMIZED PROMPT:

You are an experienced technology journalist with 12+ years of reporting on emerging technologies and industry trends. Your task is to create a compelling blog post about the impact of artificial intelligence on modern business, targeting {target_audience}.

The post should be approximately 1500-2000 words and follow this structure:

- **Introduction (150-200 words)**: Hook the reader with a compelling statistic or scenario about AI's current impact
- **Section 1: Key AI Trends (400-500 words)**: Cover {specific_trends} with examples and current data
- **Section 2: Real-world Case Studies (400-500 words)**: Provide 2-3 concrete examples of companies using AI effectively
- **Section 3: Future Outlook (300-400 words)**: Discuss {future_aspects} and implications
- **Conclusion (150-200 words)**: Synthesize key points and call to action

Maintain an authoritative yet accessible tone - explain technical concepts clearly without oversimplifying. Include current statistics and credible sources. Format with clear headings, varied paragraph lengths, and 1-2 sentence summaries at the end of each major section.

KEY IMPROVEMENTS:
- Added expert role: "experienced journalist with 12+ years experience" establishes credibility and shapes writing style
- Specified audience and context: {target_audience} makes the output more targeted and relevant
- Added structure: Detailed sections with word counts ensure organized, comprehensive coverage
- Added format guidelines: Tone, sources, formatting requirements ensure consistent quality
- Used placeholders: {specific_trends} and {future_aspects} allow reuse with different topics

---

Remember: You are REWRITING the prompt to be better, not executing it. Transform vague instructions into detailed, professional-grade prompts.`;

    const userPrompt = `Optimize this prompt:\n\n${contentToOptimize}`;

    // Create custom request with optimized parameters for faster response
    let content = '';
    let usage = { input_tokens: 0, output_tokens: 0, total_tokens: 0 };

    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-oss:120b-cloud",
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          stream: false,
          options: {
            temperature: 0.5,
            top_p: 0.8,
            num_predict: 500, // Increased for better quality with powerful model
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
      throw new Error("Failed to optimize prompt. Make sure Ollama is running: ollama serve");
    }

    // Parse response - extract optimized prompt and improvements
    let improved_prompt = content;
    let improvements = [];

    // Try to extract "OPTIMIZED PROMPT:" section (case insensitive, flexible spacing)
    const optimizedMatch = content.match(/OPTIMIZED\s+PROMPT:\s*\n([\s\S]+?)(?=\n\s*(?:KEY\s+IMPROVEMENTS|📝|$))/i);
    if (optimizedMatch) {
      improved_prompt = optimizedMatch[1].trim();
    }

    // Extract improvements from "KEY IMPROVEMENTS:" section
    // Handle both numbered (1. 2. 3.) and dashed (- ) formats
    const improvementsMatch = content.match(/(?:KEY\s+IMPROVEMENTS|📝.*?IMPROVEMENTS)\s*\n([\s\S]+?)$/i);
    if (improvementsMatch) {
      const improvementsText = improvementsMatch[1];

      // Try to extract numbered items first (1. 2. 3.)
      const numberedMatches = improvementsText.match(/^\d+\.\s+(.+?)$/gm);
      if (numberedMatches && numberedMatches.length > 0) {
        improvements = numberedMatches.map(line => {
          return line.replace(/^\d+\.\s+/, '').trim();
        }).filter(line => line.length > 5);
      }

      // If no numbered items, try dashed items (- )
      if (improvements.length === 0) {
        const dashedMatches = improvementsText.match(/^-\s+(.+?)$/gm);
        if (dashedMatches && dashedMatches.length > 0) {
          improvements = dashedMatches.map(line => {
            return line.replace(/^-\s+/, '').trim();
          }).filter(line => line.length > 5);
        }
      }
    }

    // Fallback: Extract any numbered or dashed list items after "IMPROVEMENTS"
    if (improvements.length === 0) {
      const lines = content.split('\n');
      let inImprovementsSection = false;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/IMPROVEMENTS|📝/i)) {
          inImprovementsSection = true;
          continue;
        }
        if (inImprovementsSection) {
          const line = lines[i].trim();
          // Match both numbered (1. 2. 3.) and dashed (- ) formats
          if (line.match(/^(\d+\.|-)/) && line.length > 5) {
            const cleanLine = line.replace(/^(\d+\.\s*|-\s*)/, '').trim();
            if (cleanLine.length > 5) {
              improvements.push(cleanLine);
            }
          }
        }
      }
    }

    // Default improvements if parsing didn't work
    if (improvements.length === 0) {
      improvements = [
        "Added specific context and role definition",
        "Improved clarity with structured format",
        "Enhanced specificity for better AI understanding"
      ];
    }

    const result = { improved_prompt, improvements };

    // Log usage
    await prisma.usage.create({
      data: {
        user_id: userId,
        prompt_id: promptId || null,
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        total_tokens: usage.total_tokens,
      },
    });

    // Create version record if promptId exists
    if (promptId) {
      const prompt = await prisma.prompt.findUnique({
        where: { id: promptId },
      });

      if (prompt) {
        await prisma.promptVersion.create({
          data: {
            prompt_id: promptId,
            content: result.improved_prompt,
            version: (await prisma.promptVersion.count({
              where: { prompt_id: promptId },
            })) + 1,
          },
        });
      }
    }

    // Update user usage
    const newTotalUsage = tokensUsedThisMonth + usage.total_tokens;
    await prisma.user.update({
      where: { id: userId },
      data: {
        usage_tokens: newTotalUsage,
      },
    });

    return res.status(200).json({
      success: true,
      improved_prompt: result.improved_prompt,
      improvement_notes: result.improvements,
      tokens_used: usage.total_tokens,
      usage_remaining: Math.max(0, FREE_LIMIT - newTotalUsage),
    });
  } catch (error) {
    console.error("Optimize prompt error:", error);
    return res.status(500).json({
      error: "Failed to optimize prompt",
      message: error.message,
    });
  }
}

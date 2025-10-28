import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Call OpenAI GPT-4o-mini
 */
export async function callOpenAI(systemPrompt, userPrompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    const usage = {
      input_tokens: response.usage.prompt_tokens,
      output_tokens: response.usage.completion_tokens,
      total_tokens: response.usage.total_tokens,
    };

    return {
      content,
      usage,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Extract structured data from AI response (title, content, tags)
 */
export function parsePromptGeneration(content) {
  try {
    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback: extract title, content, tags from plain text
    const titleMatch = content.match(/title[:\s]*["']?([^"\n]+)["']?/i);
    const contentMatch = content.match(/content[:\s]*["']?([\s\S]+?)["']?(?=tags|$)/i);
    const tagsMatch = content.match(/tags[:\s]*\[?([^\]]+)\]?/i);

    return {
      title: titleMatch ? titleMatch[1].trim() : "Generated Prompt",
      content: contentMatch ? contentMatch[1].trim() : content,
      tags: tagsMatch
        ? tagsMatch[1]
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };
  } catch (error) {
    console.error("Error parsing prompt generation:", error);
    return {
      title: "Generated Prompt",
      content: content,
      tags: [],
    };
  }
}

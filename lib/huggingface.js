/**
 * Call Ollama local API for text generation
 * Using gpt-oss:120b-cloud model running locally on localhost:11434
 * Powerful open-source 120B parameter model for high-quality outputs
 */
export async function callHuggingFace(systemPrompt, userPrompt) {
  try {
    // Combine system and user prompts into a single prompt
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // Call local Ollama server instead of cloud API
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-oss:120b-cloud",
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 800,
        },
      }),
    });

    // Check if request was successful
    if (!response.ok) {
      throw new Error(
        `Ollama API error: ${response.status} ${response.statusText}`
      );
    }

    // Get the response data
    const data = await response.json();
    let content = data.response || "";

    // Remove the input prompt from the output (Ollama returns full text)
    if (content.startsWith(fullPrompt)) {
      content = content.substring(fullPrompt.length).trim();
    }

    // Estimate token count (rough approximation)
    // Ollama doesn't return detailed token counts in standard API response
    const estimatedInputTokens = Math.ceil(
      (systemPrompt.length + userPrompt.length) / 4
    );
    const estimatedOutputTokens = Math.ceil(content.length / 4);
    const estimatedTotalTokens = estimatedInputTokens + estimatedOutputTokens;

    const usage = {
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      total_tokens: estimatedTotalTokens,
    };

    return {
      content,
      usage,
    };
  } catch (error) {
    console.error("Ollama error:", error);

    // Provide helpful error messages for common Ollama issues
    if (
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("localhost")
    ) {
      throw new Error(
        "Ollama server is not running. Please start Ollama and try again.\n\nTo start Ollama:\n1. Open Command Prompt\n2. Run: ollama serve"
      );
    }

    if (error.message.includes("404")) {
      throw new Error(
        "gpt-oss:120b-cloud model not found. Please pull the model first:\nollama pull gpt-oss:120b-cloud"
      );
    }

    throw new Error(`Ollama error: ${error.message}`);
  }
}

/**
 * Extract structured data from AI response (title, content, tags)
 * Same as OpenAI version for compatibility
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
    const contentMatch = content.match(
      /content[:\s]*["']?([\s\S]+?)["']?(?=tags|$)/i
    );
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

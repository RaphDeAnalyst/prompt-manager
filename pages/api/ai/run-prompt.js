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
    const { promptId, promptContent } = req.body;

    if (!promptId && !promptContent) {
      return res
        .status(400)
        .json({ error: "Either promptId or promptContent is required" });
    }

    // Get user's current monthly usage
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

    // Check if user exceeded free limit
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

    // Get prompt content
    let contentToRun = promptContent;
    if (promptId && !promptContent) {
      const prompt = await prisma.prompt.findUnique({
        where: { id: promptId },
      });

      if (!prompt || prompt.user_id !== userId) {
        return res.status(404).json({ error: "Prompt not found" });
      }

      contentToRun = prompt.content;
    }

    // Call HuggingFace
    if (!contentToRun) {
      return res.status(400).json({
        error: "Invalid prompt content",
        message: "Prompt content is empty or undefined",
      });
    }

    const { content, usage } = await callHuggingFace(
      "You are a helpful assistant.",
      contentToRun
    );

    // Log usage to database
    const usageRecord = await prisma.usage.create({
      data: {
        user_id: userId,
        prompt_id: promptId || null,
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        total_tokens: usage.total_tokens,
      },
    });

    // Update user's usage_tokens
    const newTotalUsage = tokensUsedThisMonth + usage.total_tokens;
    await prisma.user.update({
      where: { id: userId },
      data: {
        usage_tokens: newTotalUsage,
      },
    });

    return res.status(200).json({
      success: true,
      response: content,
      tokens_used: usage.total_tokens,
      usage_remaining: Math.max(0, FREE_LIMIT - newTotalUsage),
      monthly_limit: FREE_LIMIT,
      tokens_used_this_month: newTotalUsage,
      usageRecord,
    });
  } catch (error) {
    console.error("Run prompt error:", error);
    console.error("Error stack:", error.stack);

    // Return detailed error for debugging
    return res.status(500).json({
      error: "Failed to run prompt",
      message: error.message,
      details: {
        errorType: error.constructor.name,
        stack: error.stack,
      },
    });
  }
}

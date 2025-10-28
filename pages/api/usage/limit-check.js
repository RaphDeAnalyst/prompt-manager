import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;

  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // If user is paid, they have unlimited access
    if (user.isPaid) {
      return res.status(200).json({
        success: true,
        exceeded: false,
        isPaid: true,
        message: "Unlimited usage - paid account",
      });
    }

    // Get current month's usage for free users
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

    const FREE_LIMIT = 50000;
    const tokensUsed = monthlyUsage._sum.total_tokens || 0;
    const exceeded = tokensUsed >= FREE_LIMIT;

    return res.status(200).json({
      success: true,
      exceeded,
      isPaid: false,
      tokens_used: tokensUsed,
      limit: FREE_LIMIT,
      remaining: Math.max(0, FREE_LIMIT - tokensUsed),
      message: exceeded
        ? "Free usage limit reached"
        : `${Math.max(0, FREE_LIMIT - tokensUsed)} tokens remaining`,
    });
  } catch (error) {
    console.error("Limit check error:", error);
    return res.status(500).json({
      error: "Failed to check limit",
      message: error.message,
    });
  }
}

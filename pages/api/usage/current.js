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
    // Get current month's usage
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
        input_tokens: true,
        output_tokens: true,
      },
      _count: {
        id: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const FREE_LIMIT = 50000;
    const tokensUsed = monthlyUsage._sum.total_tokens || 0;

    return res.status(200).json({
      success: true,
      usage: {
        tokens_used_this_month: tokensUsed,
        monthly_limit: user.isPaid ? "unlimited" : FREE_LIMIT,
        tokens_remaining: user.isPaid ? "unlimited" : Math.max(0, FREE_LIMIT - tokensUsed),
        limit_exceeded: !user.isPaid && tokensUsed >= FREE_LIMIT,
        input_tokens: monthlyUsage._sum.input_tokens || 0,
        output_tokens: monthlyUsage._sum.output_tokens || 0,
        request_count: monthlyUsage._count.id,
        month_start: monthStart,
        month_end: monthEnd,
        isPaid: user.isPaid,
      },
    });
  } catch (error) {
    console.error("Usage API error:", error);
    return res.status(500).json({
      error: "Failed to fetch usage",
      message: error.message,
    });
  }
}

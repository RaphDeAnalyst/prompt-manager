import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Get session
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;

  try {
    // GET - Fetch all prompts for user, sorted by updated_at DESC
    if (req.method === "GET") {
      const { tag, sort } = req.query;

      let whereClause = { user_id: userId };

      // Filter by tag if provided
      if (tag) {
        whereClause.tags = {
          has: tag,
        };
      }

      const prompts = await prisma.prompt.findMany({
        where: whereClause,
        orderBy: {
          [sort === "created" ? "created_at" : "updated_at"]: "desc",
        },
        include: {
          usageRecords: {
            select: {
              total_tokens: true,
            },
          },
        },
      });

      return res.status(200).json({
        success: true,
        prompts: prompts.map((p) => ({
          ...p,
          totalTokensUsed: p.usageRecords.reduce(
            (sum, u) => sum + u.total_tokens,
            0
          ),
          usageRecords: undefined, // Remove from response
        })),
      });
    }

    // POST - Create new prompt
    if (req.method === "POST") {
      const { action, prompts: importedPrompts, title, content, category, tags } = req.body;

      // Handle bulk import
      if (action === "import") {
        if (!importedPrompts || !Array.isArray(importedPrompts)) {
          return res.status(400).json({ error: "Invalid import data" });
        }

        const created = await Promise.all(
          importedPrompts.map((p) =>
            prisma.prompt.create({
              data: {
                title: p.title,
                content: p.content,
                category: p.category,
                tags: p.tags || [],
                user_id: userId,
                source: "USER",
              },
            })
          )
        );

        return res.status(201).json({
          success: true,
          message: `Imported ${created.length} prompts`,
          prompts: created,
        });
      }

      // Handle create single prompt
      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
      }

      const prompt = await prisma.prompt.create({
        data: {
          title,
          content,
          category: category || null,
          tags: tags || [],
          user_id: userId,
          source: "USER",
        },
      });

      return res.status(201).json({
        success: true,
        prompt,
      });
    }

    // PUT - Update prompt
    if (req.method === "PUT") {
      const { id, title, content, category, tags } = req.body;

      if (!id || !title || !content) {
        return res.status(400).json({
          error: "ID, title, and content are required",
        });
      }

      // Verify ownership
      const existingPrompt = await prisma.prompt.findUnique({
        where: { id },
      });

      if (!existingPrompt || existingPrompt.user_id !== userId) {
        return res.status(404).json({ error: "Prompt not found" });
      }

      const prompt = await prisma.prompt.update({
        where: { id },
        data: {
          title,
          content,
          category: category || null,
          tags: tags || [],
          updated_at: new Date(),
        },
      });

      return res.status(200).json({
        success: true,
        prompt,
      });
    }

    // DELETE - Delete prompt
    if (req.method === "DELETE") {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Prompt ID is required" });
      }

      // Verify ownership
      const prompt = await prisma.prompt.findUnique({
        where: { id },
      });

      if (!prompt || prompt.user_id !== userId) {
        return res.status(404).json({ error: "Prompt not found" });
      }

      await prisma.prompt.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Prompt deleted successfully",
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Prompts API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

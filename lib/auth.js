import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

export async function getSession(req, res) {
  return await getServerSession(req, res, authOptions);
}

export async function requireAuth(req, res) {
  const session = await getSession(req, res);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return session;
}

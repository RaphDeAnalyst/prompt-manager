import { getPromptsByUserId, createPrompt, deletePrompt, updatePrompt, importPrompts } from '../lib/db.js';
import { verifyToken } from '../lib/jwt.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Verify token
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const userId = decoded.userId;

  try {
    // GET - Fetch all prompts for user
    if (req.method === 'GET') {
      const prompts = await getPromptsByUserId(userId);
      return res.status(200).json({
        success: true,
        prompts
      });
    }

    // POST - Create new prompt
    if (req.method === 'POST') {
      const { action, prompts: importedPrompts } = req.body;

      // Handle import action
      if (action === 'import') {
        if (!importedPrompts || !Array.isArray(importedPrompts)) {
          return res.status(400).json({ error: 'Invalid import data' });
        }
        const inserted = await importPrompts(userId, importedPrompts);
        return res.status(201).json({
          success: true,
          message: `Imported ${inserted.length} prompts`,
          prompts: inserted
        });
      }

      // Handle create action (default)
      const { title, category, tags, content } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const prompt = await createPrompt(userId, {
        title,
        category,
        tags,
        content
      });

      return res.status(201).json({
        success: true,
        prompt
      });
    }

    // PUT - Update prompt
    if (req.method === 'PUT') {
      const { id, title, category, tags, content } = req.body;

      if (!id || !title || !content) {
        return res.status(400).json({ error: 'ID, title, and content are required' });
      }

      const prompt = await updatePrompt(id, userId, {
        title,
        category,
        tags,
        content
      });

      if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }

      return res.status(200).json({
        success: true,
        prompt
      });
    }

    // DELETE - Delete prompt
    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Prompt ID is required' });
      }

      const deleted = await deletePrompt(id, userId);

      if (!deleted) {
        return res.status(404).json({ error: 'Prompt not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Prompt deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Prompts API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

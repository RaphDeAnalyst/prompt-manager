import { sql } from '@vercel/postgres';

/**
 * Initialize database schema on first run
 * Creates users and prompts tables if they don't exist
 */
export async function initializeDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create prompts table
    await sql`
      CREATE TABLE IF NOT EXISTS prompts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        tags TEXT,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
    `;

    console.log('Database initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email) {
  try {
    const result = await sql`
      SELECT id, email, password_hash, created_at, updated_at
      FROM users
      WHERE email = ${email}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  try {
    const result = await sql`
      SELECT id, email, created_at, updated_at
      FROM users
      WHERE id = ${userId}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

/**
 * Create new user
 */
export async function createUser(email, passwordHash) {
  try {
    const result = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email}, ${passwordHash})
      RETURNING id, email, created_at, updated_at
    `;
    return result.rows[0];
  } catch (error) {
    if (error.message.includes('duplicate key')) {
      throw new Error('Email already exists');
    }
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Get all prompts for a user
 */
export async function getPromptsByUserId(userId) {
  try {
    const result = await sql`
      SELECT id, user_id, title, category, tags, content, created_at, updated_at
      FROM prompts
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting prompts:', error);
    throw error;
  }
}

/**
 * Get single prompt by ID and verify ownership
 */
export async function getPromptById(promptId, userId) {
  try {
    const result = await sql`
      SELECT id, user_id, title, category, tags, content, created_at, updated_at
      FROM prompts
      WHERE id = ${promptId} AND user_id = ${userId}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting prompt:', error);
    throw error;
  }
}

/**
 * Create new prompt
 */
export async function createPrompt(userId, { title, category, tags, content }) {
  try {
    const result = await sql`
      INSERT INTO prompts (user_id, title, category, tags, content)
      VALUES (${userId}, ${title}, ${category || 'General'}, ${tags || ''}, ${content})
      RETURNING id, user_id, title, category, tags, content, created_at, updated_at
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating prompt:', error);
    throw error;
  }
}

/**
 * Update prompt
 */
export async function updatePrompt(promptId, userId, { title, category, tags, content }) {
  try {
    const result = await sql`
      UPDATE prompts
      SET title = ${title},
          category = ${category || 'General'},
          tags = ${tags || ''},
          content = ${content},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${promptId} AND user_id = ${userId}
      RETURNING id, user_id, title, category, tags, content, created_at, updated_at
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating prompt:', error);
    throw error;
  }
}

/**
 * Delete prompt
 */
export async function deletePrompt(promptId, userId) {
  try {
    const result = await sql`
      DELETE FROM prompts
      WHERE id = ${promptId} AND user_id = ${userId}
      RETURNING id
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting prompt:', error);
    throw error;
  }
}

/**
 * Bulk import prompts
 */
export async function importPrompts(userId, prompts) {
  try {
    const insertedPrompts = [];
    for (const prompt of prompts) {
      const result = await sql`
        INSERT INTO prompts (user_id, title, category, tags, content)
        VALUES (${userId}, ${prompt.title}, ${prompt.category || 'General'}, ${prompt.tags || ''}, ${prompt.content})
        RETURNING id, user_id, title, category, tags, content, created_at, updated_at
      `;
      insertedPrompts.push(result.rows[0]);
    }
    return insertedPrompts;
  } catch (error) {
    console.error('Error importing prompts:', error);
    throw error;
  }
}

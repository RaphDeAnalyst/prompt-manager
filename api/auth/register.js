import bcrypt from 'bcrypt';
import { createUser, getUserByEmail } from '../lib/db.js';
import { generateToken } from '../lib/jwt.js';

export default async function handler(req, res) {
  console.log('[REGISTER] Request method:', req.method);
  console.log('[REGISTER] Request body:', req.body);

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    console.log('[REGISTER] Email:', email, 'Password length:', password?.length);

    // Validate input
    if (!email || !password) {
      console.log('[REGISTER] Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      console.log('[REGISTER] Password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    console.log('[REGISTER] Checking if user exists...');
    const existingUser = await getUserByEmail(email);
    console.log('[REGISTER] Existing user:', existingUser);

    if (existingUser) {
      console.log('[REGISTER] User already exists');
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    console.log('[REGISTER] Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('[REGISTER] Password hashed');

    // Create user
    console.log('[REGISTER] Creating user...');
    const user = await createUser(email, passwordHash);
    console.log('[REGISTER] User created:', user);

    // Generate token
    console.log('[REGISTER] Generating token...');
    const token = generateToken(user.id, user.email);
    console.log('[REGISTER] Token generated');

    console.log('[REGISTER] Returning 201 success response');
    return res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('[REGISTER] Error occurred:', error.message);
    console.error('[REGISTER] Stack:', error.stack);
    return res.status(500).json({ error: 'Registration failed', details: error.message });
  }
}

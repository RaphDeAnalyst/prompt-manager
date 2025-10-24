import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createUser, getUserByEmail } from './api/lib/db.js';
import bcrypt from 'bcrypt';

async function test() {
  try {
    const email = 'raphandy007@gmail.com';
    const password = 'Testing123';
    
    console.log('Checking if user exists...');
    const existingUser = await getUserByEmail(email);
    console.log('Existing user:', existingUser);
    
    if (existingUser) {
      console.log('User already exists');
      return;
    }
    
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Password hashed');
    
    console.log('Creating user...');
    const user = await createUser(email, passwordHash);
    console.log('User created successfully:', user);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

test();

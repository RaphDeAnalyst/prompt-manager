import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createUser, getUserByEmail } from './api/lib/db.js';
import bcrypt from 'bcrypt';

async function test() {
  try {
    console.log('Testing user retrieval...');
    const existingUser = await getUserByEmail('test@example.com');
    console.log('Existing user:', existingUser);
    
    console.log('\nTesting password hash...');
    const passwordHash = await bcrypt.hash('Testing123', 10);
    console.log('Password hash generated:', passwordHash ? 'yes' : 'no');
    
    console.log('\nTesting user creation...');
    const user = await createUser('test@example.com', passwordHash);
    console.log('User created:', user);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();

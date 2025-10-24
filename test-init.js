import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { initializeDatabase } from './api/lib/db.js';

async function test() {
  try {
    console.log('Initializing database...');
    const result = await initializeDatabase();
    console.log('Database initialized:', result);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();

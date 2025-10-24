import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('POSTGRES_URL exists:', !!process.env.POSTGRES_URL);
console.log('URL starts with postgresql:', process.env.POSTGRES_URL?.startsWith('postgresql'));

import { sql } from '@vercel/postgres';

async function test() {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log('Database connection successful:', result);
  } catch (error) {
    console.log('Database connection error:', error.message);
  }
}

test();

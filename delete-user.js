import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { sql } from '@vercel/postgres';

async function deleteUser() {
  try {
    const result = await sql`DELETE FROM users WHERE email = 'raphandy007@gmail.com'`;
    console.log('User deleted:', result.rowCount, 'rows affected');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

deleteUser();

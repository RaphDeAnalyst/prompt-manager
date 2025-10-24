import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import registerHandler from './api/auth/register.js';

// Mock request and response
const mockReq = {
  method: 'POST',
  body: {
    email: 'newuser@example.com',
    password: 'Testing123'
  }
};

const mockRes = {
  statusCode: null,
  headers: {},
  data: null,
  
  status(code) {
    this.statusCode = code;
    return this;
  },
  
  setHeader(key, value) {
    this.headers[key] = value;
  },
  
  json(data) {
    this.data = data;
    console.log(`Response ${this.statusCode}:`, JSON.stringify(data, null, 2));
  },
  
  end() {
    console.log(`Response ${this.statusCode}: empty`);
  }
};

async function test() {
  console.log('Testing register handler with new user...');
  await registerHandler(mockReq, mockRes);
  console.log('Handler completed');
}

test().catch(err => console.error('Test error:', err));

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import registerHandler from './api/auth/register.js';

// Mock request and response
const mockReq = {
  method: 'POST',
  body: {
    email: 'raphandy007@gmail.com',
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
  console.log('Testing register handler with raphandy007@gmail.com...');
  try {
    await registerHandler(mockReq, mockRes);
    console.log('Handler completed successfully');
  } catch (error) {
    console.error('Handler threw error:', error.message);
  }
}

test();

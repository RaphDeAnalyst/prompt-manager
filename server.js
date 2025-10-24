import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create a log file
const logFile = fs.createWriteStream('server.log', { flags: 'a' });
const originalLog = console.log;
const originalError = console.error;

console.log = function(...args) {
  originalLog.apply(console, args);
  logFile.write(args.join(' ') + '\n');
};

console.error = function(...args) {
  originalError.apply(console, args);
  logFile.write('[ERROR] ' + args.join(' ') + '\n');
};

// Import API route handlers
import registerHandler from './api/auth/register.js';
import loginHandler from './api/auth/login.js';
import promptsHandler from './api/prompts/index.js';
import initHandler from './api/config/init.js';

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes - pass req and res directly to handlers
app.post('/api/auth/register', (req, res) => registerHandler(req, res));
app.post('/api/auth/login', (req, res) => loginHandler(req, res));

app.get('/api/prompts', (req, res) => promptsHandler(req, res));
app.post('/api/prompts', (req, res) => promptsHandler(req, res));
app.put('/api/prompts', (req, res) => promptsHandler(req, res));
app.delete('/api/prompts', (req, res) => promptsHandler(req, res));

app.post('/api/config/init', (req, res) => initHandler(req, res));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Development API server running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `${req.method} ${req.path} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n✅ Development API server running at http://localhost:${PORT}`);
  console.log(`📝 Endpoints available:`);
  console.log(`   POST   /api/auth/register`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/prompts`);
  console.log(`   POST   /api/prompts`);
  console.log(`   PUT    /api/prompts`);
  console.log(`   DELETE /api/prompts`);
  console.log(`   POST   /api/config/init`);
  console.log(`   GET    /health\n`);
});

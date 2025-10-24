# Prompt Manager - Full-Stack Implementation Guide

## Overview

This guide walks you through implementing the server-side persistence system for the Prompt Manager application using Vercel Postgres and Vercel API Routes.

## What's Been Implemented

### Backend (API Routes)
- ✅ Database utilities (`api/lib/db.js`)
  - User management (register, login)
  - Prompt CRUD operations
  - Bulk import functionality

- ✅ JWT Authentication (`api/lib/jwt.js`)
  - Token generation and verification
  - Secure token-based API access

- ✅ Authentication Endpoints
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login

- ✅ Prompts API (`/api/prompts`)
  - `GET /api/prompts` - Fetch all user prompts
  - `POST /api/prompts` - Create or import prompts
  - `PUT /api/prompts` - Update prompt
  - `DELETE /api/prompts` - Delete prompt

### Frontend (React)
- ✅ Auth Context (`src/context/AuthContext.jsx`)
  - User authentication state management
  - Login/register/logout functions
  - Token persistence

- ✅ Auth Pages
  - Login page with email/password
  - Registration page with validation
  - Styled with modern gradient UI

- ✅ API Service Layer (`src/services/api.js`)
  - Centralized API calls
  - Bearer token handling
  - Error handling

- ✅ Updated App.jsx
  - Replaced localStorage with API calls
  - Added error handling
  - Loading states
  - Error display

## Setup Instructions

### Step 1: Create Vercel Postgres Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database**
5. Choose **Postgres**
6. Copy the connection string (DATABASE_URL)

### Step 2: Configure Environment Variables

1. Create `.env.local` file in project root:

```bash
# Vercel Postgres Connection String
POSTGRES_URLSTATE=your_postgres_url_here

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Frontend API URL
VITE_API_URL=http://localhost:3000
```

2. For production (Vercel):
   - Add these same variables to Vercel project settings
   - Environment Variables section

### Step 3: Install Dependencies

Already installed:
- `@vercel/postgres` - Database client
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT tokens
- `cors` - Cross-origin requests
- `express` - API framework
- `dotenv` - Environment variables

### Step 4: Initialize Database (First Time Only)

Make a POST request to initialize the database schema:

```bash
curl -X POST http://localhost:3000/api/config/init
```

Or trigger it manually by visiting: `http://localhost:3000/api/config/init`

The database will automatically create:
- `users` table
- `prompts` table
- Index on user_id for fast queries

### Step 5: Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3004` with API at `http://localhost:3000`

## API Endpoints Reference

### Authentication

**Register**
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "createdAt": "2024-10-24T..."
  },
  "token": "eyJhbGc..."
}
```

**Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "user": {...},
  "token": "eyJhbGc..."
}
```

### Prompts

**Get All Prompts**
```
GET /api/prompts
Authorization: Bearer <token>

Response:
{
  "success": true,
  "prompts": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Test Prompt",
      "category": "Testing",
      "tags": "test,automation",
      "content": "Prompt content here...",
      "created_at": "2024-10-24T...",
      "updated_at": "2024-10-24T..."
    }
  ]
}
```

**Create Prompt**
```
POST /api/prompts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Prompt",
  "category": "Writing",
  "tags": "creative,writing",
  "content": "Your prompt content here..."
}

Response:
{
  "success": true,
  "prompt": { id, user_id, title, ... }
}
```

**Update Prompt**
```
PUT /api/prompts
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": 1,
  "title": "Updated Prompt",
  "category": "Writing",
  "tags": "creative",
  "content": "Updated content..."
}

Response:
{
  "success": true,
  "prompt": { ... }
}
```

**Delete Prompt**
```
DELETE /api/prompts
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": 1
}

Response:
{
  "success": true,
  "message": "Prompt deleted successfully"
}
```

**Import Prompts**
```
POST /api/prompts
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "import",
  "prompts": [
    {
      "title": "Imported Prompt 1",
      "category": "...",
      "tags": "...",
      "content": "..."
    }
  ]
}

Response:
{
  "success": true,
  "message": "Imported X prompts",
  "prompts": [...]
}
```

## User Flow

1. **Signup/Login**
   - User enters email and password
   - AuthContext handles registration/login
   - JWT token stored in localStorage
   - User redirected to app

2. **View Prompts**
   - App loads prompts from `/api/prompts`
   - All prompts are user-specific (filtered by user_id)
   - Errors show as banner

3. **Create Prompt**
   - User fills form and saves
   - POST to `/api/prompts`
   - New prompt added to list

4. **Edit Prompt**
   - User clicks edit
   - Form pre-fills with data
   - PUT to `/api/prompts`
   - List updates with new data

5. **Delete Prompt**
   - User confirms deletion
   - DELETE to `/api/prompts`
   - Prompt removed from list

6. **Import/Export**
   - Export downloads JSON of all user's prompts
   - Import parses JSON and bulk creates prompts

7. **Logout**
   - Token cleared from localStorage
   - Redirected to login page

## Security Features

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens for stateless authentication
- ✅ User isolation (can only access own prompts)
- ✅ CORS enabled for cross-origin requests
- ✅ Email uniqueness enforced in database
- ✅ Token expiry (7 days)

## Data Persistence

**Before (Local Storage)**
- Data stored in browser IndexedDB
- Deleted when cache cleared
- Single device only
- No backup

**After (Server Storage)**
- Data stored in Vercel Postgres
- Survives all cache clearing
- Multi-device accessible
- Automatic backups
- Scalable and reliable

## Troubleshooting

### "No token provided" error
- Make sure you're logged in
- Check localStorage has `auth_token`
- Token may have expired (7 day expiry)

### "Database connection failed"
- Verify POSTGRES_URLSTATE is set correctly
- Check Vercel Postgres status
- Run database init: `curl -X POST http://localhost:3000/api/config/init`

### API endpoints returning 404
- Make sure Vercel API routes are deployed
- Check function files are in `/api` directory
- Restart dev server

### CORS errors
- CORS is enabled by default on all endpoints
- Check browser console for details

## Next Steps

1. **Deploy to Vercel**
   - Push code to GitHub
   - Connect to Vercel
   - Set environment variables
   - Deploy

2. **Add Features**
   - Search functionality
   - Prompt categories/filtering
   - Sharing prompts with others
   - Prompt history/versions

3. **Enhance Security**
   - Email verification
   - Password reset flow
   - Two-factor authentication
   - Rate limiting

4. **Improve UX**
   - Offline support with service workers
   - Sync indicator
   - Auto-save drafts
   - Keyboard shortcuts

## File Structure

```
prompt-manager/
├── api/
│   ├── auth/
│   │   ├── register.js
│   │   └── login.js
│   ├── prompts/
│   │   └── index.js
│   ├── config/
│   │   └── init.js
│   └── lib/
│       ├── db.js
│       └── jwt.js
├── src/
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── AuthPages.css
│   ├── services/
│   │   └── api.js
│   ├── components/
│   │   └── ... (existing components)
│   ├── App.jsx (updated)
│   └── main.jsx (updated)
├── .env.example
├── package.json
└── vite.config.js
```

## Testing the Implementation

### Test Signup
1. Go to `http://localhost:3004`
2. Click "Sign up here"
3. Enter email and password
4. Click "Sign Up"
5. Should redirect to app

### Test Login
1. Logout from app
2. Go back to login page
3. Enter credentials
4. Click "Login"
5. Should load your prompts

### Test Prompt Creation
1. Click "+ New Prompt"
2. Fill in details
3. Click "Create"
4. Prompt should appear in list and database

### Test Persistence
1. Create a prompt
2. Refresh the page
3. Prompt should still be there
4. Clear browser cache
5. Refresh page
6. Prompt should STILL be there (on server)

### Test Multi-device
1. Create prompt on device A
2. Open app on device B with same account
3. Prompt should appear on device B too

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Blank page on load | Check console for errors, verify auth token in localStorage |
| Can't create prompts | Verify API_URL is correct, check token is valid |
| Prompts disappear after refresh | Database not initialized, run init endpoint |
| Auth endpoints return 401 | Check email/password are correct |
| Import not working | Verify JSON format matches export format |

## Support

For issues or questions, check:
1. Console for error messages
2. Network tab for API responses
3. Vercel Postgres status
4. Environment variables configuration


# Quick Start Guide - Vercel Postgres Implementation

## 5-Minute Setup

### Step 1: Get Vercel Postgres Connection String
1. Go to https://vercel.com/dashboard
2. Select your project
3. Storage → Create Database → Postgres
4. Copy the `POSTGRES_URLSTATE` value

### Step 2: Create `.env.local`
```bash
POSTGRES_URLSTATE=postgresql://...your-connection-string...
JWT_SECRET=super-secret-key-change-in-prod
VITE_API_URL=http://localhost:3000
```

### Step 3: Initialize Database
```bash
curl -X POST http://localhost:3000/api/config/init
```

Or in the browser:
```
http://localhost:3000/api/config/init
```

You should see: `{"success":true,"message":"Database initialized successfully"}`

### Step 4: Start the App
```bash
npm run dev
```

Visit: `http://localhost:3004`

### Step 5: Test It Out
1. Click "Sign up here"
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Click "Sign Up"
5. Create a prompt
6. Clear browser cache (Settings → Clear browsing data)
7. Refresh page
8. **Prompt should still be there!** ✅

## What's New

| Feature | Old System | New System |
|---------|-----------|-----------|
| Storage | Browser cache | Vercel Postgres |
| Persistence | Lost on cache clear | Survives everything |
| Multi-device | No | Yes! |
| Backup | Manual | Automatic |
| Authentication | None | JWT + Bcrypt |

## API Endpoints

All require `Authorization: Bearer <token>` header

```
POST   /api/auth/register          Register account
POST   /api/auth/login              Login & get token
GET    /api/prompts                 Get all prompts
POST   /api/prompts                 Create prompt
PUT    /api/prompts                 Update prompt
DELETE /api/prompts                 Delete prompt
```

## Troubleshooting

### "Cannot POST /api/auth/register"
- Make sure `npm run dev` is running
- Check that you're using correct localhost (3004 for app, 3000 for API)

### "POSTGRES_URLSTATE not found"
- Create `.env.local` file
- Add connection string from Vercel
- Restart dev server

### "Database initialization failed"
- Check connection string is correct
- Verify Postgres database is active in Vercel
- Check environment variables are loaded

### Prompts still disappear after clear
- Verify database was initialized (check `/api/config/init`)
- Look in browser DevTools Network tab for errors
- Check API response status codes

## Using the App

### Register
1. Click "Sign up here" on login page
2. Enter email and password (min 6 chars)
3. Click "Sign Up"

### Create Prompt
1. Click "+ New Prompt"
2. Fill in title, category, tags, content
3. Click "Create"

### Edit Prompt
1. Select a prompt
2. Click "✏️ Edit"
3. Modify fields
4. Click "Update"

### Delete Prompt
1. Select a prompt
2. Click "🗑️ Delete"
3. Confirm deletion

### Import/Export
1. **Export**: Click "📥 Export" to download JSON backup
2. **Import**: Click "📤 Import" to upload previously exported JSON

### Logout
1. Click "🚪 Logout"
2. Confirm logout
3. Redirected to login page

## Development vs Production

### Development
```
API Base: http://localhost:3000
App URL: http://localhost:3004
Auth Token: Stored in localStorage
```

### Production (Vercel)
```
API Base: https://your-vercel-domain.vercel.app
App URL: https://your-vercel-domain.vercel.app
Auth Token: Stored in localStorage (same)
```

## Environment Variables Needed

**Development** (`.env.local`):
```
POSTGRES_URLSTATE=your_postgres_connection_string
JWT_SECRET=dev-secret-key
VITE_API_URL=http://localhost:3000
```

**Production** (Vercel Project Settings):
```
POSTGRES_URLSTATE=your_postgres_connection_string
JWT_SECRET=strong-production-secret-key
VITE_API_URL=https://your-vercel-domain.vercel.app
```

## API Response Examples

### Successful Login
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "createdAt": "2024-10-24T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Create Prompt
```json
{
  "success": true,
  "prompt": {
    "id": 1,
    "user_id": 1,
    "title": "My Prompt",
    "category": "Writing",
    "tags": "creative",
    "content": "Prompt text...",
    "created_at": "2024-10-24T10:30:00Z",
    "updated_at": "2024-10-24T10:30:00Z"
  }
}
```

### Get All Prompts
```json
{
  "success": true,
  "prompts": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Prompt 1",
      ...
    }
  ]
}
```

## Verification Checklist

After setup, verify:
- [ ] `.env.local` file exists with correct values
- [ ] `npm run dev` starts without errors
- [ ] Login page loads at localhost:3004
- [ ] Can register new account
- [ ] Can create, edit, delete prompts
- [ ] Prompts appear in Postgres (check via Vercel dashboard)
- [ ] Prompts persist after page refresh
- [ ] Prompts persist after cache clear
- [ ] Console has no red errors

## Next: Deploy to Vercel

When ready to go live:

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel project settings:
   - POSTGRES_URLSTATE
   - JWT_SECRET
   - VITE_API_URL (set to your Vercel domain)
4. Deploy
5. Test at your live URL

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **PostgreSQL**: https://www.postgresql.org/docs/
- **JWT**: https://jwt.io/
- **React**: https://react.dev/

## File Locations

```
Backend:
- API routes: /api/auth/*, /api/prompts/*, /api/config/*
- Database code: /api/lib/db.js
- Auth code: /api/lib/jwt.js

Frontend:
- Auth system: /src/context/AuthContext.jsx
- Login/Register: /src/pages/*.jsx
- API calls: /src/services/api.js
- Main app: /src/App.jsx, /src/main.jsx

Config:
- Environment: .env.local
- Guides: IMPLEMENTATION_GUIDE.md, QUICK_START.md
```

---

**You're all set!** 🎉

Data is now persistent and synchronized across devices. Prompts survive cache clearing, browser restarts, and device changes when logged into the same account.


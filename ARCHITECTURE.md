# System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     React Application                         │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │           Authentication Flow                           │ │  │
│  │  │  ┌────────────────────────────────────────────────────┐ │ │  │
│  │  │  │  LoginPage/RegisterPage                            │ │ │  │
│  │  │  │  ↓                                                 │ │ │  │
│  │  │  │  AuthContext (useAuth hook)                        │ │ │  │
│  │  │  │  ↓                                                 │ │ │  │
│  │  │  │  localStorage: { auth_token: "jwt..." }            │ │ │  │
│  │  │  └────────────────────────────────────────────────────┘ │ │  │
│  │  │                                                          │ │  │
│  │  │  ┌────────────────────────────────────────────────────┐ │ │  │
│  │  │  │           Application Logic                        │ │ │  │
│  │  │  │  ┌────────────────────────────────────────────────┐ │ │  │
│  │  │  │  │  App.jsx                                       │ │ │  │
│  │  │  │  │  - Displays prompts                            │ │ │  │
│  │  │  │  │  - Handles CRUD UI                             │ │ │  │
│  │  │  │  └────────────────────────────────────────────────┘ │ │  │
│  │  │  │                                                      │ │  │
│  │  │  │  ┌────────────────────────────────────────────────┐ │ │  │
│  │  │  │  │  Components:                                   │ │ │  │
│  │  │  │  │  - PromptList                                  │ │ │  │
│  │  │  │  │  - PromptDetail                                │ │ │  │
│  │  │  │  │  - PromptForm                                  │ │ │  │
│  │  │  │  │  - SettingsBar                                 │ │ │  │
│  │  │  │  └────────────────────────────────────────────────┘ │ │  │
│  │  │  └────────────────────────────────────────────────────┘ │ │  │
│  │  │                                                          │ │  │
│  │  │  ┌────────────────────────────────────────────────────┐ │ │  │
│  │  │  │  API Service Layer (src/services/api.js)           │ │ │  │
│  │  │  │  - fetchPrompts()                                  │ │ │  │
│  │  │  │  - createPromptAPI(prompt)                         │ │ │  │
│  │  │  │  - updatePromptAPI(id, prompt)                     │ │ │  │
│  │  │  │  - deletePromptAPI(id)                             │ │ │  │
│  │  │  │  - importPromptsAPI(prompts)                       │ │ │  │
│  │  │  │                                                    │ │ │  │
│  │  │  │  All include Authorization header with JWT         │ │ │  │
│  │  │  └────────────────────────────────────────────────────┘ │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │                                                                 │  │
│  └──────────────────────────┬──────────────────────────────────────┘  │
└─────────────────────────────┼──────────────────────────────────────────┘
                              │
                    HTTPS Requests with JWT
                    Authorization: Bearer <token>
                              │
┌─────────────────────────────┼──────────────────────────────────────────┐
│                             ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │          VERCEL SERVERLESS FUNCTIONS (API Routes)              │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  /api/auth/register.js                                 │  │  │
│  │  │  ┌──────────────────────────────────────────────────┐  │  │  │
│  │  │  │ 1. Validate email & password                    │  │  │  │
│  │  │  │ 2. Hash password with bcrypt                    │  │  │  │
│  │  │  │ 3. Insert user into database                    │  │  │  │
│  │  │  │ 4. Generate JWT token                           │  │  │  │
│  │  │  │ 5. Return token                                 │  │  │  │
│  │  │  └──────────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  /api/auth/login.js                                     │  │  │
│  │  │ ┌──────────────────────────────────────────────────┐  │  │  │
│  │  │  │ 1. Find user by email                          │  │  │  │
│  │  │  │ 2. Verify password with bcrypt               │  │  │  │
│  │  │  │ 3. Generate JWT token                         │  │  │  │
│  │  │  │ 4. Return token                               │  │  │  │
│  │  │  └──────────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  /api/prompts/index.js                                  │  │  │
│  │  │ ┌──────────────────────────────────────────────────┐  │  │  │
│  │  │  │ GET:  Verify JWT → Query user's prompts        │  │  │  │
│  │  │  │ POST: Create new prompt OR bulk import         │  │  │  │
│  │  │  │ PUT:  Verify ownership → Update prompt         │  │  │  │
│  │  │  │ DELETE: Verify ownership → Delete prompt       │  │  │  │
│  │  │  └──────────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  /api/config/init.js                                    │  │  │
│  │  │ ┌──────────────────────────────────────────────────┐  │  │  │
│  │  │  │ 1. Create users table                          │  │  │  │
│  │  │  │ 2. Create prompts table                        │  │  │  │
│  │  │  │ 3. Create indexes                              │  │  │  │
│  │  │  └──────────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  /api/lib/jwt.js                                        │  │  │
│  │  │ ┌──────────────────────────────────────────────────┐  │  │  │
│  │  │  │ - generateToken(userId, email)                 │  │  │  │
│  │  │  │ - verifyToken(token)                           │  │  │  │
│  │  │  │ - verifyTokenMiddleware (Express)              │  │  │  │
│  │  │  │ Uses: HS256 algorithm, 7-day expiry            │  │  │  │
│  │  │  └──────────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  /api/lib/db.js                                         │  │  │
│  │  │ ┌──────────────────────────────────────────────────┐  │  │  │
│  │  │  │ Database Utilities:                            │  │  │  │
│  │  │  │ - initializeDatabase()                         │  │  │  │
│  │  │  │ - createUser(email, hash)                      │  │  │  │
│  │  │  │ - getUserByEmail(email)                        │  │  │  │
│  │  │  │ - createPrompt(userId, data)                   │  │  │  │
│  │  │  │ - getPromptsByUserId(userId)                   │  │  │  │
│  │  │  │ - updatePrompt(id, userId, data)               │  │  │  │
│  │  │  │ - deletePrompt(id, userId)                     │  │  │  │
│  │  │  │ - importPrompts(userId, prompts)               │  │  │  │
│  │  │  │ Uses: @vercel/postgres client                  │  │  │  │
│  │  │  └──────────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                                 │  │
│  └─────────────────────────────────┬──────────────────────────────┘  │
│                                     │                                 │
│                           SQL Queries via TCP                         │
│                                     │                                 │
└─────────────────────────────────────┼─────────────────────────────────┘
                                      │
┌─────────────────────────────────────┼──────────────────────────────────┐
│                                     ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              VERCEL POSTGRES DATABASE                           │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │  users TABLE                                              │ │  │
│  │  │  ┌──────────────────────────────────────────────────────┐ │ │  │
│  │  │  │ id (PK)        │ email              │ password_hash │ │ │  │
│  │  │  │ created_at     │ updated_at                         │ │ │  │
│  │  │  │                                                      │ │ │  │
│  │  │  │ 1 │ john@example.com │ $2b$10$... (bcrypt) │        │ │  │
│  │  │  │ 2 │ jane@example.com │ $2b$10$... (bcrypt) │        │ │  │
│  │  │  └──────────────────────────────────────────────────────┘ │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │  prompts TABLE                                             │ │  │
│  │  │  ┌──────────────────────────────────────────────────────┐ │ │  │
│  │  │  │ id (PK) │ user_id (FK) │ title │ content │ tags ...│ │ │  │
│  │  │  │ created_at │ updated_at                              │ │ │  │
│  │  │  │                                                      │ │ │  │
│  │  │  │ 1 │ 1 │ "My Prompt" │ "Content..." │ "tag1,tag2" │ │ │  │
│  │  │  │ 2 │ 1 │ "Another" │ "More content..." │ "test" │ │ │  │
│  │  │  │ 3 │ 2 │ "Jane's Prompt" │ "..." │ "" │ │ │  │
│  │  │  │                                                      │ │ │  │
│  │  │  │ INDEX: idx_prompts_user_id (for fast queries)       │ │ │  │
│  │  │  └──────────────────────────────────────────────────────┘ │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │                                                                  │  │
│  │  Backups: Automatic (Vercel manages)                           │  │
│  │  Redundancy: Multi-node replication                            │  │
│  │  Availability: 99.9% SLA                                       │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Registration Flow
```
User Input (email, password)
        ↓
[LoginPage.jsx - Form]
        ↓
AuthContext.register()
        ↓
fetch(POST /api/auth/register)
        ↓
[register.js API Route]
        ├─→ Validate input
        ├─→ Hash password (bcrypt)
        ├─→ createUser(email, hash)
        ├─→ generateToken(userId, email)
        └─→ Return { user, token }
        ↓
AuthContext saves token to localStorage
        ↓
User redirected to App
        ↓
App loads with authenticated state
```

### Create Prompt Flow
```
User Input (title, content, etc)
        ↓
[PromptForm.jsx - Modal]
        ↓
App.handleSavePrompt()
        ↓
createPromptAPI(promptData)
        ↓
fetch(POST /api/prompts, {
  Authorization: "Bearer <token>",
  body: promptData
})
        ↓
[prompts/index.js API Route]
        ├─→ Verify JWT token
        ├─→ Extract userId from token
        ├─→ createPrompt(userId, data)
        ├─→ INSERT INTO prompts TABLE
        └─→ Return { success, prompt }
        ↓
App state updates with new prompt
        ↓
UI reflects new prompt in list
```

### Load Prompts Flow
```
App mounts / User logs in
        ↓
App.useEffect(() => { ... })
        ↓
fetchPrompts()
        ↓
fetch(GET /api/prompts, {
  Authorization: "Bearer <token>"
})
        ↓
[prompts/index.js API Route]
        ├─→ Verify JWT token
        ├─→ Extract userId from token
        ├─→ getPromptsByUserId(userId)
        ├─→ SELECT * FROM prompts WHERE user_id = ?
        └─→ Return { success, prompts: [...] }
        ↓
App state updates with prompts
        ↓
PromptList renders all user's prompts
```

### Persistence Verification Flow
```
User Creates Prompt
        ↓
Data saved in database
        ↓
User Clears Browser Cache
        ↓
Refresh Page
        ↓
App loads, sends GET /api/prompts with token
        ↓
Database queries return the prompt
        ↓
Prompt appears in UI ✅
        ↓
User Opens App on Different Device
        ↓
Login with same email/password
        ↓
Receive JWT token
        ↓
Load prompts from database
        ↓
Prompts from first device appear ✅
```

## Token Lifecycle

```
Registration/Login
    ↓
generateToken(userId, email)
    ↓
jwt.sign({userId, email}, SECRET, {expiresIn: '7d'})
    ↓
Token sent to client
    ↓
Client stores in localStorage
    ↓
Client includes in Authorization header
    ↓
Server receives: "Authorization: Bearer eyJhbGc..."
    ↓
verifyToken(token)
    ↓
jwt.verify(token, SECRET)
    ↓
Extract userId and email
    ↓
Use userId for database queries
    ↓
After 7 days: Token expires
    ↓
Client API call fails with 401
    ↓
User redirected to login
```

## Security Layers

```
Layer 1: Input Validation
    ├─→ Email format check
    ├─→ Password length check
    └─→ Content type validation

Layer 2: Authentication
    ├─→ Bcrypt password hashing
    ├─→ JWT token generation
    └─→ Token verification on every request

Layer 3: Authorization
    ├─→ Extract userId from token
    ├─→ Verify ownership of resource
    └─→ Query only user's own data

Layer 4: Database
    ├─→ SQL parameterization (prevents injection)
    ├─→ Foreign key constraints
    ├─→ Unique email constraint
    └─→ Row-level user isolation

Layer 5: Transport
    ├─→ HTTPS encryption
    ├─→ CORS headers
    └─→ Bearer token scheme
```

## Scalability Considerations

```
Current (Single User Testing)
    ├─→ Can handle 1 user
    └─→ ~10 prompts

Small Scale (10 users)
    ├─→ 1 database connection pool
    ├─→ Serverless functions (cold start)
    └─→ No caching layer needed

Medium Scale (100-1000 users)
    ├─→ Implement Redis caching
    ├─→ Database connection pooling
    ├─→ API rate limiting
    └─→ Consider database indexes

Large Scale (10,000+ users)
    ├─→ Database replication
    ├─→ Load balancing
    ├─→ CDN for static assets
    ├─→ Message queue for async operations
    └─→ Search indexing (Elasticsearch)
```

## Deployment Architecture

```
┌─────────────────────────────────┐
│   Developer's Machine           │
│   - Code changes                │
│   - npm run dev (testing)       │
└────────────┬────────────────────┘
             │ git push
             ▼
┌─────────────────────────────────┐
│   GitHub Repository             │
│   - Version control             │
│   - Triggers deployment          │
└────────────┬────────────────────┘
             │ Webhook
             ▼
┌─────────────────────────────────┐
│   Vercel Build Pipeline         │
│   1. Install dependencies       │
│   2. Build React app (Vite)    │
│   3. Prepare API routes         │
│   4. Deploy serverless functions│
│   5. Deploy static assets       │
└────────────┬────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌────────────┐  ┌──────────────┐
│ CDN        │  │ API Functions│
│ (React)    │  │ (Serverless) │
└────────────┘  └──────┬───────┘
                       │
                       ▼
                ┌──────────────────┐
                │ Vercel Postgres  │
                │ (Database)       │
                └──────────────────┘
```

This architecture enables:
- ✅ Zero downtime deployments
- ✅ Automatic scaling
- ✅ Global CDN distribution
- ✅ High availability
- ✅ Automatic backups


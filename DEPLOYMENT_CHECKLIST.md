# Deployment Checklist - Prompt Manager with Vercel Postgres

## Pre-Deployment Checklist

### Environment Setup
- [ ] Vercel account created (https://vercel.com)
- [ ] GitHub account with repository
- [ ] Repository pushed to GitHub with all implementation files
- [ ] Local `.env.local` file created with test values

### Code Review
- [ ] All API routes in `/api` directory
- [ ] All React components in `/src` directory
- [ ] No API keys in version control
- [ ] .env.example file is up to date
- [ ] package.json includes all dependencies

### Database Preparation
- [ ] Vercel Postgres database created in Vercel dashboard
- [ ] POSTGRES_URLSTATE connection string copied
- [ ] Database initialization tested locally
- [ ] Test user created and verified
- [ ] Test prompts created and queried

### Frontend Testing
- [ ] npm install successful
- [ ] npm run dev starts without errors
- [ ] Can access http://localhost:3004
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can create/edit/delete prompts
- [ ] Can import/export prompts
- [ ] Can logout
- [ ] No console errors

### Backend Testing
- [ ] API routes accessible at localhost:3000
- [ ] Authentication endpoints return correct responses
- [ ] JWT tokens generated and verified
- [ ] Prompts API returns user-specific data
- [ ] Database queries execute correctly
- [ ] Error handling works for invalid inputs

## Vercel Deployment Steps

### Step 1: Connect Repository
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New Project"
- [ ] Connect GitHub account
- [ ] Select repository
- [ ] Click "Import"

### Step 2: Configure Environment Variables
- [ ] Vercel shows environment variable form
- [ ] Add: `POSTGRES_URLSTATE` = (your Vercel Postgres connection string)
- [ ] Add: `JWT_SECRET` = (strong random secret, at least 32 characters)
- [ ] Add: `VITE_API_URL` = (your Vercel domain, e.g., https://your-project.vercel.app)
- [ ] Click "Deploy"

### Step 3: Initial Deployment
- [ ] Vercel builds the project (takes 1-2 minutes)
- [ ] Deployment completes successfully
- [ ] No build errors in logs
- [ ] No runtime errors in logs

### Step 4: Post-Deployment Testing
- [ ] Visit your Vercel domain in browser
- [ ] Login page loads correctly
- [ ] API responses working (check Network tab)
- [ ] Can register new account
- [ ] Can create/edit/delete prompts
- [ ] Data persists after page refresh
- [ ] No CORS errors
- [ ] No 401/403 authentication errors

### Step 5: Database Initialization (First Deployment Only)
- [ ] Make POST request to `/api/config/init`:
  ```bash
  curl -X POST https://your-project.vercel.app/api/config/init
  ```
- [ ] Response: `{"success":true,"message":"Database initialized successfully"}`
- [ ] Check Vercel Postgres dashboard - tables created
- [ ] Verify users and prompts tables exist

## Post-Deployment Verification

### Functionality Tests
- [ ] Register new user on production
- [ ] Login with production user
- [ ] Create prompt on production
- [ ] Verify prompt in database (Vercel dashboard)
- [ ] Edit prompt
- [ ] Delete prompt
- [ ] Export/Import prompts
- [ ] Logout and re-login
- [ ] Load prompts on different browser/device

### Security Tests
- [ ] Invalid password rejected
- [ ] Invalid email format rejected
- [ ] Token expires properly (7 days)
- [ ] Can't access other users' prompts
- [ ] API returns 401 without token
- [ ] HTTPS enforced (no plain HTTP)

### Performance Tests
- [ ] Page loads in < 3 seconds
- [ ] API response time < 500ms
- [ ] No memory leaks in browser
- [ ] Database queries indexed properly

### Error Handling Tests
- [ ] Network error shows user-friendly message
- [ ] Invalid input shows validation error
- [ ] Database error logged appropriately
- [ ] 404 errors handled
- [ ] 500 errors logged and reported

## Production Hardening

### Security
- [ ] Change JWT_SECRET to strong random value
- [ ] Remove console.log() statements (or use logger)
- [ ] Enable HTTPS only
- [ ] Review CORS settings (restrict if needed)
- [ ] Consider rate limiting on auth endpoints
- [ ] Add email verification for new accounts

### Reliability
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Monitor database connection pool
- [ ] Set up alerts for failed API calls
- [ ] Document rollback procedure
- [ ] Keep backups of database

### Performance
- [ ] Enable caching headers for assets
- [ ] Compress API responses
- [ ] Optimize images
- [ ] Consider implementing Redis cache
- [ ] Monitor API response times

### Maintenance
- [ ] Set up automated database backups
- [ ] Document deployment procedures
- [ ] Create runbook for common issues
- [ ] Set up monitoring and alerts
- [ ] Plan for database schema updates

## Monitoring & Maintenance

### Daily Checks
- [ ] Application accessible
- [ ] No spike in error logs
- [ ] Database connection healthy
- [ ] Response times normal

### Weekly Checks
- [ ] Review error logs
- [ ] Check database size
- [ ] Monitor API usage
- [ ] Verify backups completed

### Monthly Checks
- [ ] Update dependencies (security patches)
- [ ] Review database performance
- [ ] Check SSL certificate renewal
- [ ] Test disaster recovery

### Quarterly Checks
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Capacity planning
- [ ] User feedback review

## Rollback Plan

If something goes wrong after deployment:

### Immediate (First 5 minutes)
1. Check error logs in Vercel dashboard
2. Verify database connectivity
3. Check environment variables are set correctly
4. Look for recent code changes that caused issue

### Short-term (5-30 minutes)
1. Redeploy from known-good commit:
   ```bash
   git revert <bad-commit>
   git push  # Auto-deploys to Vercel
   ```
2. Verify rollback successful
3. Check user-facing functionality
4. Monitor error logs

### Long-term
1. Debug issue locally with same commit
2. Fix the bug
3. Test thoroughly
4. Re-deploy with fix
5. Monitor for regressions

## Deployment Variations

### For Development Testing
```
VITE_API_URL=http://localhost:3000
JWT_SECRET=dev-secret-key-no-security
Environment: Development branch
```

### For Staging
```
VITE_API_URL=https://staging-project.vercel.app
JWT_SECRET=staging-secret-key-32-chars-min
Environment: staging branch
```

### For Production
```
VITE_API_URL=https://project.vercel.app
JWT_SECRET=production-secret-key-64-chars-min
Environment: main/master branch
```

## File Verification

Before deploying, verify these files exist:

```
✅ Backend Files
  api/auth/register.js
  api/auth/login.js
  api/prompts/index.js
  api/config/init.js
  api/lib/db.js
  api/lib/jwt.js

✅ Frontend Files
  src/context/AuthContext.jsx
  src/pages/LoginPage.jsx
  src/pages/RegisterPage.jsx
  src/pages/AuthPages.css
  src/services/api.js
  src/App.jsx (updated)
  src/main.jsx (updated)
  src/components/SettingsBar.jsx (updated)

✅ Configuration
  .env.example
  .gitignore (excludes .env.local)
  package.json
  vite.config.js

✅ Documentation
  IMPLEMENTATION_GUIDE.md
  QUICK_START.md
  IMPLEMENTATION_SUMMARY.md
  IMPLEMENTATION_COMPLETE.md
  ARCHITECTURE.md
  DEPLOYMENT_CHECKLIST.md (this file)
```

## Success Criteria

Deployment is successful when:

✅ Application loads at your Vercel domain
✅ Can register and login
✅ Can create, edit, delete prompts
✅ Prompts persist in database
✅ No console errors or warnings
✅ No 404 or 500 errors
✅ Response times acceptable
✅ Database queries working
✅ Token-based auth working
✅ User isolation working
✅ Export/Import working

## Contact & Support

### During Deployment
- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Docs: https://vercel.com/docs
- Postgres Docs: https://www.postgresql.org/docs/

### Troubleshooting
- Check Vercel Function Logs
- Check Browser DevTools Console
- Check Network tab for API responses
- Check Postgres Dashboard for query errors

### Getting Help
1. Read IMPLEMENTATION_GUIDE.md
2. Check error messages carefully
3. Look at API response bodies
4. Review git commit history
5. Check Vercel status page

---

**Ready to Deploy?** 🚀

1. Push to GitHub
2. Go to Vercel Dashboard
3. Follow steps 1-5 above
4. Run through post-deployment verification
5. Monitor and celebrate! 🎉


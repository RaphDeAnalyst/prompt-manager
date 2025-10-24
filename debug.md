Debug and fix registration failure on localhost

PROBLEM:
Registration is failing when attempting to sign up on the local application.

TASK:
Use Playwright MCP to iteratively debug and fix the registration issue until successful signup is achieved.

TEST CREDENTIALS:
- Email: raphandy007@gmail.com
- Password: Testing123

WORKFLOW:
1. Navigate to the localhost registration page using Playwright
2. Attempt to sign up with the provided credentials
3. Capture and analyze:
   - Browser console logs
   - Network requests/responses
   - Any error messages displayed in the UI
   - JavaScript errors or warnings
4. Identify the root cause of the registration failure
5. Implement a fix based on your findings
6. Re-test the registration flow with the same credentials
7. Repeat steps 2-6 until registration succeeds

SUCCESS CRITERIA:
Registration is complete when the user can successfully sign up with the provided credentials without errors.

IMPORTANT:
- Do not stop until registration works successfully
- Check both frontend and backend console logs
- Look for validation errors, API failures, database issues, or authentication problems
- Document each fix attempt and its outcome
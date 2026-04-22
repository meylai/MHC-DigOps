# Login.js Duplicate Declaration Fix - TODO

## Approved Plan Steps (Progress: ☐ Not started ☑ In progress ☑ Completed)

☑ 1. Create this TODO.md with steps

☑ 2. Edit mhc-digiops-frontend/js/login.js:
   - Remove duplicate `const userRole = data.role.toLowerCase();`
   - Keep `const userRole = (data.role || selectedRole).toLowerCase();`
   - Fix redirect logic: admin → dashboard.html, housing_manager/manager → housing-manager-dashboard.html, else → user-dashboard.html

☐ 3. Test:
   - Open mhc-digiops-frontend/login.html in browser
   - Submit with valid credentials, check console for no SyntaxError
   - Verify redirect based on role

Next: Update checkmarks after each step.


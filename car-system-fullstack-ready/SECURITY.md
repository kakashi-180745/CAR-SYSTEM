# Security hardening

This build keeps the existing application flow but removes credentials from source code and adds defensive controls.

## Required environment variables

Set `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET` before starting the backend. A strong random JWT secret is required.

Admin creation is now controlled by environment variables. Either configure `BOOTSTRAP_ADMIN_EMAIL` + `BOOTSTRAP_ADMIN_PASSWORD` for the initial administrator, or configure `ADMIN_SIGNUP_CODE` if the existing admin-signup screen is required.

## Important production steps

- Use a dedicated MySQL application account, not `root`.
- Use HTTPS in production.
- Rotate the JWT secret if it has ever been committed to a repository.
- Rotate the old demo admin password and admin signup code.
- Use Flyway/Liquibase migrations and keep `JPA_DDL_AUTO=validate`.
- Put the upload directory outside the application deployment directory where practical.
- Keep the frontend token handling under review; localStorage tokens remain exposed to XSS.

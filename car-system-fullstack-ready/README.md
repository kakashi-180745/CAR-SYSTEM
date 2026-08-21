# Car System — Ready-to-Run Full Stack

React + Vite frontend, Spring Boot + JWT backend, and MySQL database.

## 1. MySQL
1. Open MySQL Workbench / MySQL CLI.
2. Run `database/car_ecommerce_ready.sql` as a full reset/seed. It creates `car_ecommerce`, seeds the catalog and showrooms, and creates the new reports/profile schema.
3. Create a dedicated MySQL application user (do not use `root`) and set the backend environment variables shown in `.env.example`. Do not put credentials into source code.

For an existing database, use `database/upgrade_existing.sql` instead of the full reset script.

## 2. Backend
Requirements: JDK 17+ and Maven 3.9+.

```text
cd backend
mvn clean spring-boot:run
```
Backend: `http://localhost:8080`

Admin access is intentionally not hardcoded. For the initial administrator, set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD`. If the existing admin-registration screen is required, set `ADMIN_SIGNUP_CODE` to a strong rotated value.

## 3. Frontend
Requirements: Node.js 18+.

```text
cd frontend
npm install
npm run dev
```
Frontend: `http://localhost:5173`

## Included workflow
- Admin login + protected admin registration
- Admin car add/edit/delete + availability and price management
- Admin showroom add/edit/delete + location/contact management
- User signup requires phone number
- User profile edit + profile image URL + password change
- Car search with explicit not-available state
- Enquiry flow: user -> database -> admin dashboard -> status -> user
- Report/issue flow: user -> database -> admin dashboard -> response/status -> user
- Wishlist + cart
- 1,200 seeded cars and global showroom data

All dynamic data is API/database driven; do not hardcode inventory in React.

## Security

See `SECURITY.md` for the security hardening and required environment configuration. The application now validates uploaded profile images, rate-limits authentication attempts, adds security headers, and removes credentials from source/config defaults.

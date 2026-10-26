# Car System — Full-Stack Automotive Marketplace

Modern full-stack automotive inventory, showroom discovery, shortlist/cart, enquiry concierge, and admin management platform.

## Architecture
- **Frontend (`frontend/`)**: React 19 + Vite 7 + React Router 7 + Leaflet Maps + Axios
- **Primary Backend (`backend/`)**: Java 17 + Spring Boot 3.5.5 + Spring Security (JWT + BCrypt + Rate Limiter) + Spring Data JPA (MySQL or Embedded H2)
- **Portable Zero-Setup Backend (`backend-lite/`)**: Node.js 22 (`node:sqlite`) + Express 100% API-compatible server (auto-seeds from `database/car_ecommerce_ready.sql` with zero MySQL/JDK setup)
- **Database (`database/`)**: MySQL 8 schema & seed scripts (`1,200` vehicles across global markets + `67` global showroom locations)

---

## Option A — Run with Spring Boot + MySQL (or Embedded H2)

### 1. MySQL Database
1. Open MySQL Workbench or MySQL CLI.
2. Run `database/car_ecommerce_ready.sql` to create `car_ecommerce` and seed all 1,200 cars and 67 showrooms (or `database/upgrade_existing.sql` for an existing database).
3. Configure environment variables (see `.env.example`), or use local defaults (`DB_USERNAME=root`, `DB_PASSWORD=root`).

### 2. Start Spring Boot Backend
Requirements: JDK 17+ and Maven 3.9+.

```bash
cd backend
# With MySQL:
mvn clean spring-boot:run

# Or without MySQL (Embedded H2 file database — auto-seeds 1,200 cars & 67 showrooms):
mvn clean spring-boot:run -Dspring-boot.run.profiles=h2
```
Backend runs on `http://localhost:8080`.

### 3. Start Frontend
Requirements: Node.js 18+.

```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` (automatically proxies `/api` and `/uploads` to `http://localhost:8080`).

---

## Option B — Zero-Setup Portable Mode (Node.js 22+ & SQLite)

No Java, Maven, or MySQL installation required:

```bash
# Terminal 1 — API Server (auto-seeds 1,200 cars & 67 showrooms from SQL)
cd backend-lite
npm install
npm start

# Terminal 2 — React Frontend
cd frontend
npm install
npm run dev
```

Or on Windows, double-click `START_PORTABLE_WINDOWS.bat`.

---

## Included Features
- **Global Catalog (`1,200` vehicles)**: Multi-criteria search & filtering (brand, body type, fuel, transmission, market country, max price, availability), sorting, 48-card progressive loading, and side-by-side **3-car comparison modal**.
- **Vehicle Detail Experience**: Full trim & market reference pricing, interactive **EMI / Finance Estimator**, customizable **Showroom Enquiry Modal**, wishlist sync, and similar vehicles.
- **Interactive Global Showroom Network (`67` cities)**: Leaflet map with city/country filtering, auto-fitting map bounds, and direct map links.
- **Shortlist Cart & Wishlist**: Live navbar badge counters, quantity steppers, and 1-click multi-car shortlist enquiry submission.
- **User Account & Security**: Profile editor, file avatar upload (JPG/PNG/GIF/BMP) **or** external image URL, BCrypt password update, JWT stateless auth, and rate-limited auth endpoints.
- **Support & Issue Tracking**: User issue/car-request submission with showroom & vehicle linking, tracked through to admin resolution.
- **Admin Console (`/admin`)**: Unified sub-navigation, live metrics, searchable/paginated car management with 1-click availability toggle, showroom network CRUD, customer enquiry pipeline (`NEW` -> `CONTACTED` -> `TEST_DRIVE_SCHEDULED` -> `CLOSED`), support report responses, and user management.

## Default Development Accounts (Portable Mode / Windows Starter)
- **Admin**: `admin@carsystem.com` / `Admin@1234`
- **Customer**: `demo@carsystem.com` / `User@1234`
- **Admin Registration Code**: `CAR-ADMIN-2026` (override or clear `ADMIN_SIGNUP_CODE` in production)

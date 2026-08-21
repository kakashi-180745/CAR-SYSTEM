# Car System — Full Global Inventory Ready Build

## What's included
- Spring Boot backend
- React + Vite frontend
- 1,200 seeded car inventory records
- Global showroom seed (67 source entries; the backend inserts the first 60 because its existing guard is 60+)
- Market country, currency and reference market price on car records
- Existing authentication, wishlist, cart, enquiries and admin flow preserved
- Premium motion UI preserved
- `/cars` page now renders every car returned by the API; the previous 48-card client-side limit/load-more step has been removed.

## Database
Use `database/car_ecommerce_full_1200.sql` for a clean reset and full seed.
It starts with `DROP DATABASE IF EXISTS car_ecommerce;`, so it replaces the existing database.

## Backend
1. Open `backend` in a terminal.
2. Ensure MySQL is running and credentials in `backend/src/main/resources/application.properties` match your MySQL installation.
3. Run `mvn clean` then `mvn spring-boot:run`.

## Frontend
1. Open `frontend` in a terminal.
2. Run `npm install` if needed.
3. Run `npm start` (Vite).
4. Open http://localhost:5173

## Important
The seeded market values are project reference/demo values, not live dealer quotes. The frontend displays all records returned by the backend, but actual live market pricing would require a live automotive pricing/data provider.

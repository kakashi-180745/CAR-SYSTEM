# Car System — Global Catalog Upgrade

This version keeps the existing React + Spring Boot flow and adds a larger catalog layer.

## Included
- 1,200 seeded inventory records built from real-world automotive brand/model nameplates.
- 60+ showroom points across major automotive cities worldwide.
- Country + currency + reference-market value fields.
- Home page inventory counters and global collection messaging.
- Cars page loads 48 cards at a time so 1,200+ records do not freeze the browser.
- Premium hover/reveal animations are preserved and extended.
- `npm start` now works as an alias for Vite development mode.
- Existing JWT authentication, wishlist, cart, admin routes and API flow remain intact.

## Existing MySQL database
If your `car_ecommerce` database already exists, **do not drop it**.

Run:

`database/upgrade_existing.sql`

Then start the backend. Hibernate is configured with `ddl-auto=update`, and the initializer will add records until the database contains 1,200 cars and 60 showroom records.

## Fresh MySQL database
Run:

`database/car_ecommerce.sql`

Then start Spring Boot.

## Commands

Backend:

`cd backend`

`mvn clean`

`mvn spring-boot:run`

Frontend:

`cd frontend`

`npm install`

`npm start`

## Important data note
The catalog uses real-world model nameplates, while the large inventory and showroom records are **demo/reference seed data**. The prices are not live dealer quotes and should not be represented as real-time market prices without connecting a live pricing provider.

The USD/INR reference used for the seed layer was around ₹95.43 per USD in mid-August 2026. For production, replace the static market-price layer with a licensed/current pricing and FX API.

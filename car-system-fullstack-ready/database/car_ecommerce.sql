CREATE DATABASE IF NOT EXISTS car_ecommerce;
USE car_ecommerce;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    phone VARCHAR(20),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cars (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150),
    brand VARCHAR(80) NOT NULL,
    model VARCHAR(100) NOT NULL,
    price DECIMAL(14,2) NOT NULL,
    year INT,
    fuel_type VARCHAR(30),
    transmission VARCHAR(30),
    body_type VARCHAR(40),
    mileage DOUBLE,
    description VARCHAR(2000),
    image_url VARCHAR(1000),
    market_country VARCHAR(100),
    currency VARCHAR(10),
    market_price DECIMAL(16,2),
    available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS car_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    car_id BIGINT NOT NULL,
    image_url VARCHAR(1000) NOT NULL
);

CREATE TABLE IF NOT EXISTS showrooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(300) NOT NULL,
    city VARCHAR(80) NOT NULL,
    country VARCHAR(100),
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(160)
);

CREATE TABLE IF NOT EXISTS wishlist (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    car_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_wishlist_user_car (user_id, car_id)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    car_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    UNIQUE KEY uq_cart_user_car (user_id, car_id)
);

CREATE TABLE IF NOT EXISTS enquiries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    car_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    message VARCHAR(2000),
    status VARCHAR(30) NOT NULL DEFAULT 'NEW',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Existing installations: run these once if the old cars/showrooms tables came from the earlier script.
-- MySQL 8.0.29+ supports IF NOT EXISTS on ADD COLUMN.
ALTER TABLE cars ADD COLUMN IF NOT EXISTS name VARCHAR(150);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS market_country VARCHAR(100);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS currency VARCHAR(10);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS market_price DECIMAL(16,2);
ALTER TABLE showrooms ADD COLUMN IF NOT EXISTS country VARCHAR(100);
UPDATE cars SET name = CONCAT(brand, ' ', model) WHERE name IS NULL OR name = '';

-- The backend seeds 1,200+ car inventory rows and 60+ global showroom locations automatically.
-- Seed prices are reference/demo values, not live dealer quotes.

CREATE DATABASE IF NOT EXISTS car_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE car_ecommerce;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    phone VARCHAR(20),
    profile_image VARCHAR(1000),
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
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cars_brand (brand),
    INDEX idx_cars_fuel (fuel_type),
    INDEX idx_cars_price (price)
);

CREATE TABLE IF NOT EXISTS car_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    car_id BIGINT NOT NULL,
    image_url VARCHAR(1000) NOT NULL,
    INDEX idx_car_images_car (car_id)
);

CREATE TABLE IF NOT EXISTS showrooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(120),
    city VARCHAR(80) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100),
    address VARCHAR(300) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(160),
    website VARCHAR(300),
    image_url VARCHAR(1000),
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    INDEX idx_showrooms_country (country),
    INDEX idx_showrooms_city (city)
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
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_enquiries_user (user_id)
);

CREATE TABLE IF NOT EXISTS reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    car_id BIGINT NULL,
    showroom_id BIGINT NULL,
    issue_type VARCHAR(60) NOT NULL,
    subject VARCHAR(180) NOT NULL,
    description VARCHAR(3000) NOT NULL,
    image_url VARCHAR(1000),
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    admin_response VARCHAR(3000),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reports_user (user_id),
    INDEX idx_reports_status (status)
);

-- Upgrade statements for older databases (MySQL 8.0.29+):
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(1000);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS name VARCHAR(150);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS market_country VARCHAR(100);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS currency VARCHAR(10);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS market_price DECIMAL(16,2);
ALTER TABLE showrooms ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE showrooms ADD COLUMN IF NOT EXISTS brand VARCHAR(120);
ALTER TABLE showrooms ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE showrooms ADD COLUMN IF NOT EXISTS website VARCHAR(300);
ALTER TABLE showrooms ADD COLUMN IF NOT EXISTS image_url VARCHAR(1000);
UPDATE cars SET name = CONCAT(brand, ' ', model) WHERE name IS NULL OR name = '';

-- The backend seeds 1,200 car inventory rows and 67 global showroom locations automatically.

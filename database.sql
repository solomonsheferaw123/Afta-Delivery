CREATE DATABASE IF NOT EXISTS afta_delivery;
USE afta_delivery;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
  profile_image_url VARCHAR(255),
  user_type ENUM('customer', 'courier', 'restaurant', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services Table (Food, Mart, etc.)
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  icon_name VARCHAR(50),
  delivery_time VARCHAR(50),
  cta_text VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE
);

-- Partners Table (Restaurants, Shops)
CREATE TABLE IF NOT EXISTS partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50), -- e.g., 'Burger Joint', 'Grocery'
  rating DECIMAL(2, 1) DEFAULT 0.0,
  delivery_time_estimate VARCHAR(50),
  image_url VARCHAR(255),
  is_featured BOOLEAN DEFAULT FALSE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  partner_id INT,
  total_amount DECIMAL(10, 2),
  status ENUM('pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled') DEFAULT 'pending',
  delivery_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (partner_id) REFERENCES partners(id)
);

-- Seed Data (Initial Content)
INSERT INTO services (title, description, icon_name, delivery_time, cta_text) VALUES
('Afta Food', 'Hungry? Get meals from top Addis restaurants.', 'Utensils', '30-45 min', 'Order Food'),
('Afta Mart', 'Groceries, electronics, and essentials.', 'ShoppingBag', 'Same Day', 'Shop Mart'),
('Afta Express', 'Professional logistics for shipping.', 'Truck', 'Urgent', 'Send Package'),
('Afta Connect', 'Join the community and share reviews.', 'Users', 'Community', 'Join Now');

INSERT INTO partners (name, category, rating, delivery_time_estimate, image_url, is_featured) VALUES
('Sishu Burger', 'Top Burger Joint', 4.9, '30 min', 'https://picsum.photos/id/1060/300/200', TRUE),
('Lime Tree', 'International', 4.7, '35 min', 'https://picsum.photos/id/292/300/200', TRUE),
('Daily Supermarket', 'Grocery', 4.5, '60 min', 'https://picsum.photos/id/73/300/200', FALSE);

-- Test User (password: test123)
INSERT INTO users (username, email, full_name, phone_number, password_hash, wallet_balance, user_type) VALUES
('testuser', 'test@afta.et', 'Test User', '0911000000', '$2b$10$rKJ5qZ9X8vZ9X8vZ9X8vZOqZ9X8vZ9X8vZ9X8vZ9X8vZ9X8vZ9X8v', 1000.00, 'customer');

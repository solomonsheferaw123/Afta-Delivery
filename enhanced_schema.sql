USE afta_delivery;

-- Create Products table for Mart/Food
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  partner_id INT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  image_url VARCHAR(255),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES partners(id)
);

-- Create Express Requests table
CREATE TABLE IF NOT EXISTS express_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  package_type VARCHAR(50),
  vehicle_type VARCHAR(50),
  estimated_price DECIMAL(10, 2),
  status ENUM('pending', 'assigned', 'picked_up', 'delivered', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  partner_id INT,
  order_id INT,
  rating DECIMAL(2, 1),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (partner_id) REFERENCES partners(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Create Wallet Transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type ENUM('topup', 'payment', 'refund', 'cashback') NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed Products
INSERT INTO products (partner_id, name, description, price, category, image_url) VALUES
(1, 'Double Cheese Burger', 'Special sishu beef with double cheese', 380.00, 'FOOD', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop'),
(2, 'Special Shiro', 'Original Taitu recipe', 150.00, 'FOOD', 'https://media.istockphoto.com/id/482557087/photo/injera.jpg?s=612x612&w=0&k=20&c=FfO2q3p5p3p5p3p5'),
(3, 'Fresh Tomatoes (1kg)', 'Organic farm tomatoes', 85.00, 'GROCERY', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop'),
(3, 'Teff Flour (5kg)', 'Pre-cleaned white teff', 650.00, 'GROCERY', 'https://cdn.shopify.com/s/files/1/0554/7448/7399/files/Teff_Flour_480x480.jpg');

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS stylist_services;
DROP TABLE IF EXISTS stylists;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client',
  phone_number TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create services table
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  duration INTEGER NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create stylists table
CREATE TABLE stylists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  image TEXT,
  email TEXT,
  phone_number TEXT,
  rating DECIMAL DEFAULT 5.0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create stylist_services table (many-to-many relationship)
CREATE TABLE stylist_services (
  id SERIAL PRIMARY KEY,
  stylist_id INTEGER NOT NULL REFERENCES stylists(id),
  service_id INTEGER NOT NULL REFERENCES services(id)
);

-- Create bookings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_contact TEXT NOT NULL,
  client_location TEXT NOT NULL,
  client_id INTEGER REFERENCES users(id),
  stylist_id INTEGER NOT NULL REFERENCES stylists(id),
  service_id INTEGER NOT NULL REFERENCES services(id),
  date TIMESTAMP NOT NULL,
  time_start TEXT NOT NULL,
  time_end TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'cash',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_stylist ON bookings(stylist_id);
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_stylist_services_stylist ON stylist_services(stylist_id);
CREATE INDEX idx_stylist_services_service ON stylist_services(service_id);

-- Insert default admin user
INSERT INTO users (name, email, password, role, phone_number)
VALUES ('Admin', 'admin@afrogents.com', '$2a$10$1qAz2wSx3eDc4rFv5tGb5eUytwFNzU0mFyBXL0.uqfFgbGLpu7vCq', 'admin', '+1234567890');

-- Insert sample services
INSERT INTO services (name, description, price, duration, category, image, is_active)
VALUES 
  ('Haircut & Trim', 'Professional haircut and trimming service', 200, 45, 'Hair', '', TRUE),
  ('Shaving Service', 'Professional shaving service', 150, 30, 'Beard', '', TRUE),
  ('Hair Styling', 'Creative hair styling service', 250, 60, 'Hair', '', TRUE),
  ('Beard & Mustache Service', 'Beard and mustache trimming and styling', 180, 40, 'Beard', '', TRUE),
  ('Grooming Package', 'Complete grooming package including haircut, beard trim, and facial', 350, 90, 'Event', '', TRUE);

-- Insert sample stylists
INSERT INTO stylists (name, title, bio, image, email, phone_number, rating, is_active)
VALUES 
  ('Claude Njeam', 'Master Barber', 'Claude is a master barber with over 10 years of experience', '', 'claude@afrogents.com', '+1234567890', 4.8, TRUE),
  ('James Peterson', 'Afro Specialist', 'James specializes in all types of afro hairstyles', '', 'james@afrogents.com', '+0987654321', 4.7, TRUE);

-- Associate stylists with services
INSERT INTO stylist_services (stylist_id, service_id)
VALUES 
  (1, 1), -- Claude with Haircut & Trim
  (1, 2), -- Claude with Shaving Service
  (1, 4), -- Claude with Beard & Mustache Service
  (2, 1), -- James with Haircut & Trim
  (2, 3), -- James with Hair Styling
  (2, 5); -- James with Grooming Package

-- Insert sample bookings
INSERT INTO bookings (client_name, client_contact, client_location, client_id, stylist_id, service_id, date, time_start, time_end, status, payment_method, payment_status, notes)
VALUES 
  ('Michael Johnson', '+971 50 123 4567', 'Dubai, UAE', NULL, 1, 1, '2025-04-08 10:00:00', '10:00 AM', '10:45 AM', 'confirmed', 'cash', 'pending', ''),
  ('David Williams', '+971 50 765 4321', 'Dubai, UAE', NULL, 2, 3, '2025-04-08 13:30:00', '1:30 PM', '2:30 PM', 'pending', 'cash', 'pending', ''),
  ('Robert Brown', '+971 55 987 6543', 'Dubai, UAE', NULL, 1, 5, '2025-04-09 11:15:00', '11:15 AM', '12:45 PM', 'confirmed', 'cash', 'pending', ''),
  ('James Davis', '+971 56 222 3333', 'Dubai, UAE', NULL, 2, 5, '2025-04-10 16:00:00', '4:00 PM', '5:30 PM', 'pending', 'cash', 'pending', ''),
  ('Thomas Miller', '+971 54 111 2222', 'Dubai, UAE', NULL, 1, 1, '2025-04-12 14:45:00', '2:45 PM', '3:30 PM', 'confirmed', 'cash', 'pending', '');
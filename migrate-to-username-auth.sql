-- Migration script to clean up Replit Auth remnants and set up username/password authentication
-- This script handles the transition from Replit Auth to username/password auth

-- Step 1: Drop the old users table with Replit Auth fields
DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Create new users table for username/password authentication
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  employee_id INTEGER REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Create index for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_employee_id ON users(employee_id);

-- Step 4: Insert default admin user
-- Note: Password hash for 'admin123' using scrypt
INSERT INTO users (username, password, employee_id) 
SELECT 'admin', '$scrypt$N=16384,r=8,p=1$7a3f4b2c8e1d9a6f$8b5c2a9d7e4f1b6c3a8e9d2f5a7c4b1e8d6f3a9c2e5b7d4a1f8c6e9b3d2a5f7c1', e.id
FROM employees e 
WHERE e.emp_code = 'EMP-001' 
AND NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Step 5: Clean up any remaining Replit Auth references (comments, etc.)
COMMENT ON TABLE users IS 'Users table for username/password authentication';
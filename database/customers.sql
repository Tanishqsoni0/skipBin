USE skipbins;

CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100),
    address TEXT,
    loyalty_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_notes(
    note_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(customer_id)
    REFERENCES customers(customer_id)
);

-- Add password hash column (required for login)
ALTER TABLE customers
    ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '' AFTER email;

-- Add first and last name columns (sign up form sends these separately)
ALTER TABLE customers
    ADD COLUMN first_name VARCHAR(60) NOT NULL DEFAULT '' AFTER full_name,
    ADD COLUMN last_name VARCHAR(60) NOT NULL DEFAULT '' AFTER first_name;

-- Add account type: 'customer' or 'business'
ALTER TABLE customers
    ADD COLUMN account_type ENUM('customer', 'business') NOT NULL DEFAULT 'customer' AFTER password_hash;

-- Add business name (only filled when account_type = 'business')
ALTER TABLE customers
    ADD COLUMN business_name VARCHAR(150) DEFAULT NULL AFTER account_type;

-- Add updated_at timestamp
ALTER TABLE customers
    ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Make email unique (needed for login by email)
-- Note: skip this if some existing rows have duplicate/null emails
ALTER TABLE customers
    MODIFY COLUMN email VARCHAR(100) NOT NULL,
    ADD UNIQUE INDEX idx_email (email);

ALTER TABLE customers
DROP COLUMN full_name;

DESCRIBE customers;
SHOW COLUMNS FROM customers;

ALTER TABLE customers
ADD COLUMN total_bins_hired INT DEFAULT 0;
USE skipbins;

CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    bin_id INT NOT NULL,
    waste_id INT NOT NULL,
    delivery_address TEXT,
    delivery_date DATE,
    collection_date DATE,
    hire_weeks INT DEFAULT 1,

    status ENUM(
        'NEW',
        'CONFIRMED',
        'ACTIVE',
        'COLLECTION_DUE',
        'COMPLETED'
    ) DEFAULT 'NEW',

    total_amount DECIMAL(10,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id),

    FOREIGN KEY (bin_id)
        REFERENCES bin_types(bin_id),

    FOREIGN KEY (waste_id)
        REFERENCES waste_types(waste_id)
);

ALTER TABLE bookings
ADD COLUMN delivery_charge DECIMAL(10,2) DEFAULT 0;

ALTER TABLE bookings
ADD COLUMN waste_charge DECIMAL(10,2) DEFAULT 0;

ALTER TABLE bookings
ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;
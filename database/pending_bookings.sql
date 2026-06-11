-- migrate_pending_bookings.sql
-- Stores booking details temporarily while customer completes PayPal payment.
-- Once payment is confirmed, data moves to the main bookings table and this row is deleted.

USE skipbins;

CREATE TABLE IF NOT EXISTS pending_bookings (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    paypal_order_id  VARCHAR(100) NOT NULL UNIQUE,
    booking_ref      VARCHAR(20)  NOT NULL,
    customer_id      INT NOT NULL,
    bin_id           INT NOT NULL,
    waste_id         INT NOT NULL,
    delivery_address TEXT,
    delivery_date    DATE,
    collection_date  DATE,
    hire_weeks       INT DEFAULT 1,
    bin_price        DECIMAL(10,2),
    waste_charge     DECIMAL(10,2),
    delivery_charge  DECIMAL(10,2),
    discount_amount  DECIMAL(10,2) DEFAULT 0,
    total_amount     DECIMAL(10,2),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (bin_id)      REFERENCES bin_types(bin_id),
    FOREIGN KEY (waste_id)    REFERENCES waste_types(waste_id)
);
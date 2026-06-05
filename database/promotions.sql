USE skipbins;

CREATE TABLE promotions (
    promo_id INT AUTO_INCREMENT PRIMARY KEY,
    promo_name VARCHAR(100),
    discount_type ENUM('PERCENTAGE','FIXED'),
    discount_value DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    active BOOLEAN DEFAULT TRUE
);
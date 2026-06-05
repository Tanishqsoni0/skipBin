USE skipbins;

CREATE TABLE waste_types (
    waste_id INT AUTO_INCREMENT PRIMARY KEY,
    waste_name VARCHAR(100) NOT NULL,
    extra_charge DECIMAL(10,2) DEFAULT 0
);
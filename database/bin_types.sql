USE skipbins;

CREATE TABLE bin_types (
    bin_id INT AUTO_INCREMENT PRIMARY KEY,
    size VARCHAR(20) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL
);
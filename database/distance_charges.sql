USE skipbins;

CREATE TABLE distance_charges (
    distance_id INT AUTO_INCREMENT PRIMARY KEY,
    min_km DECIMAL(5,2),
    max_km DECIMAL(5,2),
    charge DECIMAL(10,2)
);  

CREATE TABLE hire_pricing (
    id INT PRIMARY KEY AUTO_INCREMENT,
    extension_fee DECIMAL(10,2) NOT NULL
);

INSERT INTO hire_pricing(extension_fee)
VALUES(40.00);
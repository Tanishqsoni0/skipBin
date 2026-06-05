USE skipbins;

CREATE TABLE distance_charges (
    distance_id INT AUTO_INCREMENT PRIMARY KEY,
    min_km DECIMAL(5,2),
    max_km DECIMAL(5,2),
    charge DECIMAL(10,2)
);  
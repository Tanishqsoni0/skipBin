USE skipbins;

INSERT INTO bin_types(size, base_price)
VALUES
('2m3',100),
('3m3',150),
('4m3',200),
('6m3',250),
('8m3',300),
('10m3',400);

INSERT INTO waste_types(waste_name, extra_charge)
VALUES
('Wood',30),
('Green Waste',20),
('Soil',50);

INSERT INTO distance_charges(min_km,max_km,charge)
VALUES
(0,10,0),
(10,20,25),
(20,40,50),
(40,9999,100);

INSERT INTO customers(full_name,mobile,email,address)
VALUES(
'John Smith','9999999999','john@example.com','Sydney');

INSERT INTO bookings(customer_id,bin_id,waste_id,delivery_address,delivery_date,collection_date,hire_weeks,total_amount)
VALUES(
1,1,1,'123 Main Street','2026-06-10','2026-06-17',1,150);

INSERT INTO admin_users(username,password_hash,role)
VALUES(
'admin','admin123','SUPER_ADMIN');
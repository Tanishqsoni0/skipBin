USE skipbins;

CREATE TABLE loyalty_rewards (
    reward_id INT AUTO_INCREMENT PRIMARY KEY,

    customer_id INT NOT NULL,

    eligible BOOLEAN DEFAULT FALSE,
    approved BOOLEAN DEFAULT FALSE,

    reward_date DATE,

    FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
);
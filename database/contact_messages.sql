USE skipbins;
CREATE TABLE contact_messages(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE commercial_quotes (
    quote_id INT PRIMARY KEY AUTO_INCREMENT,

    company_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(150) NOT NULL,

    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30),

    project_location TEXT,
    waste_type VARCHAR(100),
    bin_size VARCHAR(50),

    requirements TEXT,

    status ENUM(
        'NEW',
        'CONTACTED',
        'QUOTED',
        'CLOSED'
    ) DEFAULT 'NEW',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
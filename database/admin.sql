USE skipbins;

CREATE TABLE IF NOT EXISTS admins (
    admin_id      INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('super_admin', 'staff') NOT NULL DEFAULT 'staff',
    is_active     TINYINT(1) NOT NULL DEFAULT 1,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO admins (name, username, password_hash, role)
VALUES (
    'Tanishq',
    'Tanishq01',
    '$2b$12$urZliLl7tSHGiNKN4IrieOBB.1j.oqr.ELzSZCT3OboLCgaSSrc0q',
    'super_admin'
);

SELECT admin_id, name, username, role, is_active, created_at FROM admins;
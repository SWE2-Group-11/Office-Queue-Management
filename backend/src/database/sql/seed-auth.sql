-- Office Queue Management

DELETE FROM employee;
DELETE FROM sqlite_sequence WHERE name = 'employee';

INSERT INTO employee (role, name, surname, username, password, salt) VALUES
    ('officer', 'Mario', 'Rossi',   'officer1', '98ab8721188c5666db59fec0c696d47d', 'f0e30d9b260e1389'),
    ('officer', 'Laura', 'Bianchi', 'officer2', '1076b4cd12959131b21e683ab74a567a', 'ea32c73ede99afbc'),
    ('officer', 'Luca',  'Verdi',   'officer3', '56e169c00f22b0523c8c306540b40f56', '08b92b8f65567411'),
    ('manager', 'Anna',  'Neri',    'manager1', '5b3689187e79b4a0156ceaae28aee85c', 'e23fedb4f0019d7f');

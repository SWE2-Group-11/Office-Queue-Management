-- Office Queue Management (SQLite)

DROP TABLE IF EXISTS employee;

-- Employee accounts schema
CREATE TABLE employee (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    role     TEXT NOT NULL CHECK (role IN ('officer', 'manager')),
    name     TEXT NOT NULL,
    surname  TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,   -- hash, never plain text
    salt     TEXT NOT NULL
);

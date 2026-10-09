-- Office Queue Management (SQLite)

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS ticket;
DROP TABLE IF EXISTS offers;
DROP TABLE IF EXISTS counter;
DROP TABLE IF EXISTS service;

-- Service
CREATE TABLE service (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    tag_name     TEXT    NOT NULL UNIQUE,
    service_time INTEGER NOT NULL CHECK (service_time > 0)
);

-- Counters
CREATE TABLE counter (
    id INTEGER PRIMARY KEY
);

-- Which services each counter can handle
CREATE TABLE offers (
    service_id INTEGER NOT NULL REFERENCES service(id),
    counter_id INTEGER NOT NULL REFERENCES counter(id),
    PRIMARY KEY (service_id, counter_id)
);

-- Tickets
CREATE TABLE ticket (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    date       TEXT    NOT NULL CHECK (date IS strftime('%Y-%m-%d', date)),
    service_id INTEGER NOT NULL REFERENCES service(id),
    counter_id INTEGER          REFERENCES counter(id),

    -- The serving counter must offer the ticket's service
    FOREIGN KEY (service_id, counter_id)
        REFERENCES offers(service_id, counter_id)
);

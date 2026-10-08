import Database from "better-sqlite3";
import { DB_FILE_PATH } from "../config/config.js";

function openDatabase(): Database.Database {
  try {
    const connection = new Database(DB_FILE_PATH);
    connection.pragma("journal_mode = WAL");
    
    // Explicitly enable foreign key support for this connection
    connection.pragma("foreign_keys = ON");
    
    console.log("Database connected successfully");
    return connection;
  } catch (err) {
    console.error("Error opening the database: ", (err as Error).message);
    throw err;
  }
}

export const db = openDatabase();

// Initialize the simplified database schema (Day table removed)
db.exec(`
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
`);

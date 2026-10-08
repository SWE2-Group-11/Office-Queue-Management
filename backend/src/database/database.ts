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
  -- Service Table
  CREATE TABLE IF NOT EXISTS Service (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tag_name TEXT NOT NULL UNIQUE,
      service_time REAL NOT NULL
  );

  -- Counter Table
  CREATE TABLE IF NOT EXISTS Counter (
      id INTEGER PRIMARY KEY AUTOINCREMENT
  );

  -- Offers Table (from witch we can know the services offered by a counter in a specific day)
  CREATE TABLE IF NOT EXISTS Offers (
      service_id INTEGER,
      counter_id INTEGER,
      day_date TEXT, -- Stored directly as YYYY-MM-DD
      PRIMARY KEY (service_id, counter_id, day_date),
      FOREIGN KEY (service_id) REFERENCES Service(id) ON DELETE CASCADE,
      FOREIGN KEY (counter_id) REFERENCES Counter(id) ON DELETE CASCADE
  );

  -- Ticket Table
  CREATE TABLE IF NOT EXISTS Ticket (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_date TEXT NOT NULL, -- Stored directly as YYYY-MM-DD
      service_id INTEGER NOT NULL,
      counter_id INTEGER, -- Nullable initially, set when called by an officer
      FOREIGN KEY (service_id) REFERENCES Service(id) ON DELETE RESTRICT,
      FOREIGN KEY (counter_id) REFERENCES Counter(id) ON DELETE SET NULL
  );
`);

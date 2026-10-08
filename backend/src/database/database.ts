import Database from "better-sqlite3";
import { DB_FILE_PATH } from "../config/config.js";

function openDatabase(): Database.Database {
  try {
    const connection = new Database(DB_FILE_PATH);
    connection.pragma("journal_mode = WAL");
    console.log("Database connected successfully");
    return connection;
  } catch (err) {
    console.error("Error opening the database: ", (err as Error).message);
    throw err;
  }
}

export const db = openDatabase();

db.exec(`CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY,
  text TEXT NOT NULL
)`);
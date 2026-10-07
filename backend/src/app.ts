import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

export const db = new Database(process.env.DB_PATH ?? "app.db");
db.pragma("journal_mode = WAL");
db.exec(`CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY,
  text TEXT NOT NULL
)`);

export const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/messages", (_req, res) => {
  res.json(db.prepare("SELECT * FROM messages").all());
});

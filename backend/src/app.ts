import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import { DB_FILE_PATH } from "./config/config.js";

export const db = new Database(DB_FILE_PATH);
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

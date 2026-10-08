import express from "express";
import cors from "cors";
import { db } from "./database/database.js";

export const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/messages", (_req, res) => {
  res.json(db.prepare("SELECT * FROM messages").all());
});

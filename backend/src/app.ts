import express from "express";
import cors from "cors";
import { db } from "./database/database.js";
import { ticketsRouter } from "./routes/tickets-route.js";

export const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api", ticketsRouter);

app.get("/messages", (_req, res) => {
  res.json(db.prepare("SELECT * FROM messages").all());
});

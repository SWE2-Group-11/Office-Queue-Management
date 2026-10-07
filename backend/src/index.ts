import { createServer } from "node:http";
import { Server } from "socket.io";
import { app, db } from "./app";

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173" },
});

io.on("connection", (socket) => {
  socket.on("message", (text: string) => {
    db.prepare("INSERT INTO messages (text) VALUES (?)").run(text);
    io.emit("message", text);
  });
});

httpServer.listen(3000, () => console.log("Listening on 3000"));

import express, { Request, Response } from "express";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

require("dotenv").config();

const PORT = process.env.PORT || 3000;

interface Message {
  username: string;
  message: string;
}

app.set("view engine", "ejs");

app.get("/", (req: Request, res: Response) => {
  const username = String(req.query.username || "Anonymous");
  const room = String(req.query.room || "public");
  res.render("index", { username, room });
});

io.on("connection", (socket: Socket) => {
  const username: string = String(
    socket.handshake.query.username || "Anonymous"
  );
  console.log(`${username} connected`);

  socket.on("join", (room: string) => {
    socket.join(room);
    console.log(`${username} joined ${room}'s room`);
  });

  socket.on("message", (data: Message) => {
    const room: string = String(socket.handshake.query.room || "public");
    io.to(room).emit("message", {
      username: data.username,
      message: data.message,
    });
  });
});

server.listen(PORT, () => {
  console.log(`listening on :${PORT}`);
});

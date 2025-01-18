import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { port, corsOrigin, nodeEnv } from "./config/config";
import SocketService from "./services/socket-service";
import WebRTCService from "./services/webrtc-service";

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(
  cors({
    origin: corsOrigin,
  })
);

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
  },
});

const socketService = new SocketService(io);
const webRTCService = new WebRTCService(io);

io.on("connection", (socket) => {
  socketService.handleConnection(socket);
  webRTCService.handleSignaling(socket);
});

server.listen(port, () => {
  console.log(`Server running in ${nodeEnv} mode on port ${port}`);
});

import { Server } from "socket.io";
import logger from "../utils/logger";

class SocketService {
  io: Server;
  rooms: Map<string, any>;

  constructor(io: Server) {
    this.io = io;
    this.rooms = new Map();
  }

  // Establishes a connection with the client
  handleConnection(socket: any) {
    logger.info(`Client connected: ${socket.id}`);
    socket.on("join", (roomId: string) => this.handleJoinRoom(socket, roomId));
    socket.on("drawing-data", (json: any) =>
      this.handleDrawingData(socket, json)
    );
    socket.on("disconnect", () => this.handleDisconnect(socket));
  }

  // Handles the join event
  handleJoinRoom(socket: any, roomId: string) {
    const room = this.io.sockets.adapter.rooms.get(roomId);
    const roomSize = room ? room.size : 0;

    if (roomSize === 0) {
      socket.join(roomId);
      this.rooms.set(roomId, new Set([socket.id]));
      socket.emit("room-created", roomId);
      logger.info(`Room created: ${roomId}`);
    } else if (roomSize < 10) {
      socket.join(roomId);
      this.rooms.get(roomId).add(socket.id);
      socket.emit("room-joined", roomId);
      logger.info(`Client joined room: ${roomId}`);
    } else {
      socket.emit("room-full", roomId);
      logger.info(`Room is full: ${roomId}`);
    }
  }

  // Handles the drawing-data event
  handleDrawingData(socket: any, { roomId, data }: any) {
    socket.to(roomId).emit("drawing-data", data);
    logger.info(`Drawing data sent to room: ${roomId}`);
  }

  // Handles the disconnect event
  handleDisconnect(socket: any) {
    logger.info(`Client disconnected: ${socket.id}`);
    this.rooms.forEach((room, roomId) => {
      if (room.has(socket.id)) {
        room.delete(socket.id);
        if (room.size === 0) {
          this.rooms.delete(roomId);
          logger.info(`Room deleted: ${roomId}`);
        }
        logger.info(`Client left room: ${roomId}`);
      }
    });
  }
}

export default SocketService;

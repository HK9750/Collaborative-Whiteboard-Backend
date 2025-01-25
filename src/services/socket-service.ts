import { Server } from "socket.io";
import logger from "../utils/logger";

interface DrawingData {
  x: number;
  y: number;
  color: string;
  size: number;
  mode: string;
}

class SocketService {
  io: Server;
  rooms: Map<string, Set<string>>;
  drawingHistories: Map<string, DrawingData[]>;

  constructor(io: Server) {
    this.io = io;
    this.rooms = new Map();
    this.drawingHistories = new Map();
  }

  handleConnection(socket: any) {
    logger.info(`Client connected: ${socket.id}`);
    socket.on("join", (roomId: string) => this.handleJoinRoom(socket, roomId));
    socket.on("drawing-data", (json: any) =>
      this.handleDrawingData(socket, json)
    );
    socket.on("request-history", ({ roomId }: any) =>
      this.handleRequestHistory(socket, roomId)
    );
    socket.on("disconnect", () => this.handleDisconnect(socket));
  }

  handleJoinRoom(socket: any, roomId: string) {
    const room = this.io.sockets.adapter.rooms.get(roomId);
    const roomSize = room ? room.size : 0;

    if (roomSize === 0) {
      socket.join(roomId);
      this.rooms.set(roomId, new Set([socket.id]));
      this.drawingHistories.set(roomId, []);
      socket.emit("room-created", roomId);
      logger.info(`Room created: ${roomId}`);
    } else if (roomSize < 10) {
      socket.join(roomId);
      const room = this.rooms.get(roomId);
      if (room) {
        room.add(socket.id);
      }
      socket.emit("room-joined", roomId);
      logger.info(`Client joined room: ${roomId}`);
    } else {
      socket.emit("room-full", roomId);
      logger.info(`Room is full: ${roomId}`);
    }
  }

  handleDrawingData(socket: any, { roomId, data }: any) {
    // Save drawing data in room's history
    const history = this.drawingHistories.get(roomId) || [];
    history.push(data);
    this.drawingHistories.set(roomId, history);

    socket.to(roomId).emit("drawing-data", data);
    logger.info(`Drawing data sent to room: ${roomId}`);
  }

  handleRequestHistory(socket: any, roomId: string) {
    const history = this.drawingHistories.get(roomId) || [];
    socket.emit("drawing-history", history);
    logger.info(`Sent drawing history to client in room: ${roomId}`);
  }

  handleDisconnect(socket: any) {
    logger.info(`Client disconnected: ${socket.id}`);
    this.rooms.forEach((room, roomId) => {
      if (room.has(socket.id)) {
        room.delete(socket.id);
        if (room.size === 0) {
          this.rooms.delete(roomId);
          this.drawingHistories.delete(roomId); // Clean up history for empty rooms
          logger.info(`Room deleted: ${roomId}`);
        }
        logger.info(`Client left room: ${roomId}`);
      }
    });
  }
}

export default SocketService;
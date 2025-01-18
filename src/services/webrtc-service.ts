import { Server, Socket } from "socket.io";
import logger from "../utils/logger";

class WebRTCService {
  io: Server;
  constructor(io: Server) {
    this.io = io;
  }

  handleSignaling(socket: Socket) {
    socket.on("offer", this.handleOffer.bind(this, socket));
    socket.on("answer", this.handleAnswer.bind(this, socket));
    socket.on("ice-candidate", this.handleIceCandidate.bind(this, socket));
  }

  handleOffer(
    socket: Socket,
    { roomId, offer }: { roomId: string; offer: any }
  ) {
    socket.to(roomId).emit("offer", offer);
    logger.info(`Offer sent in room ${roomId}`);
  }

  handleAnswer(
    socket: Socket,
    { roomId, answer }: { roomId: string; answer: any }
  ) {
    socket.to(roomId).emit("answer", answer);
    logger.info(`Answer sent in room ${roomId}`);
  }

  handleIceCandidate(
    socket: Socket,
    { roomId, candidate }: { roomId: string; candidate: any }
  ) {
    socket.to(roomId).emit("ice-candidate", candidate);
    logger.info(`ICE candidate sent in room ${roomId}`);
  }
}

export default WebRTCService;

import { Server } from 'socket.io';
let io = null;
const userSockets = new Map();
export const init = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });
  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);
    socket.on('register_user', (userId) => {
      userSockets.set(userId, socket.id);
      console.log(`User registered on socket: ${userId} -> ${socket.id}`);
    });
    socket.on('disconnect', () => {
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`User unregistered on socket: ${userId}`);
          break;
        }
      }
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });
  return io;
};
export const getIO = () => {
  return io;
};
export const getSocketIdByUserId = (userId) => {
  return userSockets.get(userId.toString());
};
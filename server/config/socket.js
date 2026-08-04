const { Server } = require('socket.io');

let io;
const onlineUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket Connected]: ${socket.id}`);

    socket.on('user_online', (userId) => {
      if (userId) {
        onlineUsers.set(userId.toString(), socket.id);
        io.emit('online_users_list', Array.from(onlineUsers.keys()));
      }
    });

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('send_message', (data) => {
      const recipientSocketId = onlineUsers.get(data.receiverId?.toString());
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receive_message', data);
      }
    });

    socket.on('typing_start', ({ senderId, receiverId }) => {
      const recipientSocketId = onlineUsers.get(receiverId?.toString());
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing_start', { senderId });
      }
    });

    socket.on('typing_stop', ({ senderId, receiverId }) => {
      const recipientSocketId = onlineUsers.get(receiverId?.toString());
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing_stop', { senderId });
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, sId] of onlineUsers.entries()) {
        if (sId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit('online_users_list', Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const sendNotificationToUser = (userId, notificationData) => {
  const socketId = onlineUsers.get(userId?.toString());
  if (socketId && io) {
    io.to(socketId).emit('new_notification', notificationData);
  }
};

module.exports = { initSocket, getIO, sendNotificationToUser, onlineUsers };

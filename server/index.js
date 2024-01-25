const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { addMember, initialUpdate, leaveRoom } = require("./utils/RoomHandler");

const port = 5000;

// const activeRooms = new Set(); // Set to store active rooms
const roomMembers = new Map(); // Map to store members of each room

const socketToRooms = new Map();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  initialUpdate(roomMembers, socketToRooms);

  socket.on("disconnect", () => {
    leaveRoom(socket, roomMembers, socketToRooms);
  });

  socket.on("join-room", (data) => {
    const { roomId, email } = data;
    socket.join(roomId);

    addMember({ roomId, email, socket }, roomMembers, socketToRooms);
  });

  socket.on("leave-room", (data) => {
    const { roomId } = data;

    // delete user from map of members
    leaveRoom(socket, roomMembers, socketToRooms);

    socket.leave(roomId);
  });

  socket.on("connection-init", (data) => {
    const { incomingSocketId } = data;

    const initData = { incomingSocketId: socket.id };
    socket.to(incomingSocketId).emit("connection-init", initData);
  });

  socket.on("connection-signal", (signalData) => {
    const { incomingSocketId, signal } = signalData;

    const serverSignalingData = { signal, incomingSocketId: socket.id };

    socket.to(incomingSocketId).emit("connection-signal", serverSignalingData);
  });

  socket.on("send_message", (msgData) => {
    const { roomId } = msgData;
    io.to(roomId).emit("send_message_to_room", msgData);
  });
});

httpServer.listen(port, () => {
  console.log(`App running on port ${port}`);
});

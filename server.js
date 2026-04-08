// server.js
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: "*" } // 允许所有来源连接
});

io.on('connection', (socket) => {
  console.log('玩家连接:', socket.id);

  // 创建房间
  socket.on('create-room', (roomId) => {
    socket.join(roomId);
    socket.emit('room-created', { roomId, playerColor: 'black' });
  });

  // 加入房间
  socket.on('join-room', (roomId) => {
    const clients = io.sockets.adapter.rooms.get(roomId);
    if (clients && clients.size === 1) {
      socket.join(roomId);
      socket.emit('player-color', 'white');
      io.to(roomId).emit('game-start', { 
        black: [...clients][0], 
        white: socket.id, 
        currentTurn: 'black' 
      });
    } else {
      socket.emit('error', '房间已满或不存在');
    }
  });

  // 转发落子坐标
  socket.on('make-move', (data) => {
    // data 包含: roomId, row, col, color
    socket.to(data.roomId).emit('opponent-move', data);
  });

  // 重新开始请求
  socket.on('request-restart', ({ roomId }) => {
    io.to(roomId).emit('restart-game');
  });

  socket.on('disconnect', () => {
    console.log('玩家断开');
  });
});

server.listen(3000, () => {
  console.log('五子棋后端已启动：http://localhost:3000');
});
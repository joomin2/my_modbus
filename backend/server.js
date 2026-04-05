const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const postsRouter = require('./routes/posts');
const chatSocket = require('./socket/chatSocket');
const startModbusClient = require('./modbus/modbusClient');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// 미들웨어
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// 라우터
app.use('/api/posts', postsRouter);

// 소켓
chatSocket(io);

// Modbus 클라이언트 시작 (2초 후 연결)
setTimeout(() => {
  startModbusClient(io);
}, 2000);

// 서버 시작
server.listen(4000, () => {
  console.log('서버 실행중 → http://localhost:4000');
});
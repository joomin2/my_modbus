const ModbusRTU = require('modbus-serial');

const client = new ModbusRTU();

const connectForWrite = async () => {
  try {
    if (!client.isOpen) {
      await client.connectTCP('127.0.0.1', { port: 502 });
      client.setID(1);
    }
  } catch (err) {
    console.error('Modbus 쓰기 연결 실패:', err.message);
  }
};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('클라이언트 접속:', socket.id);

    // 새 게시글 알림 수신 → 전체 브로드캐스트
    socket.on('newPost', (data) => {
      console.log('새 게시글 이벤트:', data);
      io.emit('postUpdated', data);
    });

    // 게시글 수정 알림
    socket.on('updatePost', (data) => {
      console.log('게시글 수정 이벤트:', data);
      io.emit('postUpdated', data);
    });

    // 게시글 삭제 알림
    socket.on('deletePost', (data) => {
      console.log('게시글 삭제 이벤트:', data);
      io.emit('postUpdated', data);
    });

    // PLC Coil ON/OFF 제어
    socket.on('controlCoil', async (data) => {
      const { machineId, value } = data;
      try {
        await connectForWrite();
        await client.writeCoil(machineId - 1, value);
        console.log(`기계 ${machineId}번 Coil → ${value ? 'ON' : 'OFF'}`);
        io.emit('coilControlled', { machineId, value });
      } catch (err) {
        console.error('Coil 제어 실패:', err.message);
      }
    });

    // 접속 해제
    socket.on('disconnect', () => {
      console.log('클라이언트 접속 해제:', socket.id);
    });
  });
};
const ModbusRTU = require('modbus-serial');

const client = new ModbusRTU();

const connectModbus = async () => {
  try {
    await client.connectTCP('127.0.0.1', { port: 502 });
    client.setID(1);
    console.log('Modbus 클라이언트 연결 성공!');
  } catch (err) {
    console.error('Modbus 연결 실패:', err.message);
    setTimeout(connectModbus, 3000); // 3초 후 재연결
  }
};

const readPlcData = async (io) => {
  try {
    const machineData = [];

    for (let i = 0; i < 9; i++) {
      // Coil (0x) - ON/OFF 상태
      const coil = await client.readCoils(i, 1);

      // Discrete Input (1x) - 리밋스위치
      const discrete = await client.readDiscreteInputs(i, 1);

      // Input Register (3x) - 센서값
      const temp     = await client.readInputRegisters(i, 1);      // 온도
      const pressure = await client.readInputRegisters(i + 9, 1);  // 압력
      const humidity = await client.readInputRegisters(i + 18, 1); // 습도
      const flowRate = await client.readInputRegisters(i + 27, 1); // 유량

      // Holding Register (4x) - 설정값
      const status      = await client.readHoldingRegisters(i, 1);      // 가동상태
      const targetTemp  = await client.readHoldingRegisters(i + 9, 1);  // 목표온도
      const targetPress = await client.readHoldingRegisters(i + 18, 1); // 목표압력
      const targetFlow  = await client.readHoldingRegisters(i + 27, 1); // 목표유량

      machineData.push({
        id: i + 1,
        coil: coil.data[0],
        discrete: discrete.data[0],
        temperature: temp.data[0],
        pressure: pressure.data[0],
        humidity: humidity.data[0],
        flowRate: flowRate.data[0],
        status: status.data[0],
        targetTemp: targetTemp.data[0],
        targetPressure: targetPress.data[0],
        targetFlow: targetFlow.data[0],
      });
    }

    // 소켓으로 전체 기계 데이터 전송
    io.emit('plcData', machineData);
    console.log('PLC 데이터 전송:', new Date().toLocaleTimeString());

  } catch (err) {
    console.error('PLC 읽기 에러:', err.message);
    await client.close();
    setTimeout(connectModbus, 3000);
  }
};

const startModbusClient = async (io) => {
  await connectModbus();
  // 2초마다 PLC 데이터 읽기
  setInterval(() => readPlcData(io), 2000);
};

module.exports = startModbusClient;
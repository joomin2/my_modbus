const { ServerTCP } = require('modbus-serial');

// 기계 포트 1~9번 상태 시뮬레이션
const machines = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  coil: i % 2 === 0,
  discrete: i % 3 !== 0,
  temperature: Math.floor(Math.random() * 40) + 60,
  pressure: Math.floor(Math.random() * 50) + 100,
  humidity: Math.floor(Math.random() * 100),
  flowRate: Math.floor(Math.random() * 300) + 200,
  targetTemp: 80,
  targetPressure: 120,
  targetFlow: 350,
  status: 1,
}));

// 1초마다 센서값 랜덤 업데이트
setInterval(() => {
  machines.forEach(m => {
    m.temperature = Math.floor(Math.random() * 40) + 60;
    m.pressure = Math.floor(Math.random() * 50) + 100;
    m.humidity = Math.floor(Math.random() * 100);
    m.flowRate = Math.floor(Math.random() * 300) + 200;
  });
}, 1000);

const vector = {
  getCoil: (addr, unitID) => {
    if (addr < 9) return machines[addr].coil;
    return false;
  },
  setCoil: (addr, value, unitID) => {
    if (addr < 9) {
      machines[addr].coil = value;
      console.log(`기계 ${addr + 1}번 Coil → ${value ? 'ON' : 'OFF'}`);
    }
  },
  getDiscreteInput: (addr, unitID) => {
    if (addr < 9) return machines[addr].discrete;
    return false;
  },
 getInputRegister: (addr, unitID) => {
    if (addr >= 0  && addr <= 8)  return machines[addr].coil ? machines[addr].temperature : 0;
    if (addr >= 9  && addr <= 17) return machines[addr - 9].coil ? machines[addr - 9].pressure : 0;
    if (addr >= 18 && addr <= 26) return machines[addr - 18].coil ? machines[addr - 18].humidity : 0;
    if (addr >= 27 && addr <= 35) return machines[addr - 27].coil ? machines[addr - 27].flowRate : 0;
    return 0;
  },
  getHoldingRegister: (addr, unitID) => {
    if (addr >= 0  && addr <= 8)  return machines[addr].status;
    if (addr >= 9  && addr <= 17) return machines[addr - 9].targetTemp;
    if (addr >= 18 && addr <= 26) return machines[addr - 18].targetPressure;
    if (addr >= 27 && addr <= 35) return machines[addr - 27].targetFlow;
    return 0;
  },
  setRegister: (addr, value, unitID) => {
    if (addr >= 0  && addr <= 8)  machines[addr].status = value;
    if (addr >= 9  && addr <= 17) machines[addr - 9].targetTemp = value;
    if (addr >= 18 && addr <= 26) machines[addr - 18].targetPressure = value;
    if (addr >= 27 && addr <= 35) machines[addr - 27].targetFlow = value;
    console.log(`HoldingRegister[${addr}] 설정 → ${value}`);
  },
};

const server = new ServerTCP(vector, {
  host: '0.0.0.0',
  port: 502,
  debug: true,
  unitID: 1,
});

server.on('initialized', () => {
  console.log('가상 PLC Modbus 서버 실행중 → port 502');
  console.log('기계 포트 1~9번 시뮬레이션 중...');
});

server.on('error', (err) => {
  console.error('Modbus 서버 에러:', err);
});
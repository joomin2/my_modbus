import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

export default function PlcPage() {
  const [machines, setMachines] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const frozenData = useRef({});

  useEffect(() => {
    socket.on('plcData', (data) => {
      setMachines(data.map(m => {
        if (!m.coil) {
          if (!frozenData.current[m.id]) {
            frozenData.current[m.id] = {
              temperature: m.temperature,
              pressure: m.pressure,
              humidity: m.humidity,
              flowRate: m.flowRate,
            };
          }
          return { ...m, ...frozenData.current[m.id] };
        } else {
          delete frozenData.current[m.id];
          return m;
        }
      }));
      setLastUpdate(new Date().toLocaleTimeString());
    });

    socket.on('coilControlled', ({ machineId, value }) => {
      setMachines(prev => prev.map(m =>
        m.id === machineId ? { ...m, coil: value } : m
      ));
      if (value) delete frozenData.current[machineId];
    });

    return () => {
      socket.off('plcData');
      socket.off('coilControlled');
    };
  }, []);

  const handleCoilToggle = (machineId, currentValue) => {
    // 즉시 UI 반영
    setMachines(prev => prev.map(m =>
      m.id === machineId ? { ...m, coil: !currentValue } : m
    ));
    socket.emit('controlCoil', { machineId, value: !currentValue });
  };

  const getStatusColor = (value) => value ? '#4CAF50' : '#f44336';
  const getTempColor = (temp) => {
    if (temp >= 90) return '#f44336';
    if (temp >= 75) return '#FF9800';
    return '#4CAF50';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🏭 PLC 실시간 모니터링</h2>
        <span style={{ color: '#888', fontSize: '14px' }}>
          마지막 업데이트: {lastUpdate || '대기중...'}
        </span>
      </div>

      {machines.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
          PLC 데이터 수신 대기중...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {machines.map((m) => (
            <div key={m.id} style={{
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '16px',
              background: m.coil ? '#f9fff9' : '#f5f5f5',
              borderLeft: `4px solid ${getStatusColor(m.coil)}`,
              opacity: m.coil ? 1 : 0.6,
              transition: 'all 0.3s ease'
            }}>
              {/* 기계 헤더 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: m.coil ? '#000' : '#999' }}>
                  기계 {m.id}번
                  {!m.coil && <span style={{ fontSize: '12px', marginLeft: '8px', color: '#999' }}>⏸ 정지</span>}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: getStatusColor(m.coil),
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {m.coil ? 'ON' : 'OFF'}
                  </span>
                  <button
                    onClick={() => handleCoilToggle(m.id, m.coil)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: m.coil ? '#f44336' : '#4CAF50',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    {m.coil ? 'OFF 전환' : 'ON 전환'}
                  </button>
                </div>
              </div>

              {/* 센서값 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div style={{ background: m.coil ? '#f5f5f5' : '#e0e0e0', padding: '8px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#888' }}>🌡️ 온도</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: m.coil ? getTempColor(m.temperature) : '#999' }}>
                    {m.coil ? `${m.temperature}°C` : '-- °C'}
                  </div>
                </div>
                <div style={{ background: m.coil ? '#f5f5f5' : '#e0e0e0', padding: '8px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#888' }}>⚡ 압력</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: m.coil ? '#2196F3' : '#999' }}>
                    {m.coil ? `${m.pressure}kPa` : '-- kPa'}
                  </div>
                </div>
                <div style={{ background: m.coil ? '#f5f5f5' : '#e0e0e0', padding: '8px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#888' }}>💧 습도</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: m.coil ? '#00BCD4' : '#999' }}>
                    {m.coil ? `${m.humidity}%` : '-- %'}
                  </div>
                </div>
                <div style={{ background: m.coil ? '#f5f5f5' : '#e0e0e0', padding: '8px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#888' }}>🔄 유량</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: m.coil ? '#9C27B0' : '#999' }}>
                    {m.coil ? `${m.flowRate}L/m` : '-- L/m'}
                  </div>
                </div>
              </div>

              {/* 리밋스위치 & 가동상태 */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '8px',
                  background: m.discrete ? '#E3F2FD' : '#FFEBEE',
                  color: m.discrete ? '#1976D2' : '#D32F2F',
                  fontSize: '12px'
                }}>
                  리밋스위치: {m.discrete ? 'ON' : 'OFF'}
                </span>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '8px',
                  background: m.status ? '#E8F5E9' : '#FFEBEE',
                  color: m.status ? '#388E3C' : '#D32F2F',
                  fontSize: '12px'
                }}>
                  가동: {m.status ? 'ON' : 'OFF'}
                </span>
              </div>

              {/* 목표값 */}
              <div style={{ borderTop: '1px solid #eee', paddingTop: '8px', fontSize: '12px', color: '#888' }}>
                <span>목표온도: {m.targetTemp}°C</span>
                <span style={{ margin: '0 8px' }}>|</span>
                <span>목표압력: {m.targetPressure}kPa</span>
                <span style={{ margin: '0 8px' }}>|</span>
                <span>목표유량: {m.targetFlow}L/m</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
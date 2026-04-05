import { useState } from 'react';
import BoardPage from './pages/BoardPage';
import HistoryPage from './pages/HistoryPage';
import PlcPage from './pages/PlcPage';

export default function App() {
  const [tab, setTab] = useState('board');

  return (
    <div>
      {/* 네비게이션 */}
      <div style={{ background: '#333', padding: '12px 20px', display: 'flex', gap: '16px' }}>
        <button
          onClick={() => setTab('board')}
          style={{
            padding: '8px 16px',
            background: tab === 'board' ? '#4CAF50' : 'transparent',
            color: '#fff',
            border: '1px solid #fff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📋 게시판
        </button>
        <button
          onClick={() => setTab('history')}
          style={{
            padding: '8px 16px',
            background: tab === 'history' ? '#4CAF50' : 'transparent',
            color: '#fff',
            border: '1px solid #fff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📜 이력 게시판
        </button>
        <button
          onClick={() => setTab('plc')}
          style={{
            padding: '8px 16px',
            background: tab === 'plc' ? '#4CAF50' : 'transparent',
            color: '#fff',
            border: '1px solid #fff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🏭 PLC 모니터링
        </button>
      </div>

      {/* 페이지 */}
      <div style={{ padding: '20px' }}>
        {tab === 'board' && <BoardPage />}
        {tab === 'history' && <HistoryPage />}
        {tab === 'plc' && <PlcPage />}
      </div>
    </div>
  );
}
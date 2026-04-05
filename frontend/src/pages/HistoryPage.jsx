import { useState, useEffect } from 'react';
import { getHistory } from '../api/posts';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchHistory = async () => {
    try {
      const res = await getHistory(page, limit);
      setHistory(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  const actionColor = (action) => {
    if (action === 'CREATE') return '#4CAF50';
    if (action === 'UPDATE') return '#2196F3';
    if (action === 'DELETE') return '#f44336';
    return '#000';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>📜 이력 게시판</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={th}>번호</th>
            <th style={th}>게시글 ID</th>
            <th style={th}>작업</th>
            <th style={th}>제목</th>
            <th style={th}>작성자</th>
            <th style={th}>처리일시</th>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>이력이 없습니다</td></tr>
          ) : (
            history.map((h) => (
              <tr key={h.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={td}>{h.id}</td>
                <td style={td}>{h.post_id}</td>
                <td style={td}>
                  <span style={{ color: actionColor(h.action), fontWeight: 'bold' }}>
                    {h.action}
                  </span>
                </td>
                <td style={td}>{h.title}</td>
                <td style={td}>{h.author}</td>
                <td style={td}>{new Date(h.acted_at).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 페이징 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} style={{ padding: '6px 12px', cursor: 'pointer' }}>이전</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => setPage(p)} style={{ padding: '6px 12px', background: p === page ? '#4CAF50' : '#fff', color: p === page ? '#fff' : '#000', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>{p}</button>
        ))}
        <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} style={{ padding: '6px 12px', cursor: 'pointer' }}>다음</button>
      </div>
    </div>
  );
}

const th = { padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' };
const td = { padding: '10px', textAlign: 'left' };
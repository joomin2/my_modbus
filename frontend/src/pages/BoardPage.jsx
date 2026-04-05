import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { getPosts, createPost, updatePost, deletePost } from '../api/posts';
import PostForm from '../components/PostForm';

const socket = io('http://localhost:4000');

export default function BoardPage() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [editData, setEditData] = useState(null);
  const limit = 10;

  const fetchPosts = async () => {
    try {
      const res = await getPosts(page, limit);
      setPosts(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  useEffect(() => {
    socket.on('postUpdated', (data) => {
      console.log('소켓 수신:', data);
      fetchPosts();
    });
    return () => socket.off('postUpdated');
  }, [page]);

  const handleSubmit = async (form) => {
    try {
      if (editData) {
        await updatePost(editData.id, form);
        socket.emit('updatePost', { message: '게시글 수정됨', ...form });
        setEditData(null);
      } else {
        await createPost(form);
        socket.emit('newPost', { message: '새 게시글 작성됨', ...form });
      }
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제할까요?')) return;
    try {
      await deletePost(id);
      socket.emit('deletePost', { message: '게시글 삭제됨', id });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>📋 스마트팩토리 게시판</h2>

      <PostForm
        onSubmit={handleSubmit}
        editData={editData}
        onCancel={() => setEditData(null)}
      />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={th}>번호</th>
            <th style={th}>제목</th>
            <th style={th}>작성자</th>
            <th style={th}>작성일</th>
            <th style={th}>관리</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>게시글이 없습니다</td></tr>
          ) : (
            posts.map((post) => (
              <tr key={post.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={td}>{post.id}</td>
                <td style={td}>{post.title}</td>
                <td style={td}>{post.author}</td>
                <td style={td}>{new Date(post.created_at).toLocaleDateString()}</td>
                <td style={td}>
                  <button onClick={() => setEditData(post)} style={{ marginRight: '4px', padding: '4px 8px', cursor: 'pointer' }}>수정</button>
                  <button onClick={() => handleDelete(post.id)} style={{ padding: '4px 8px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>삭제</button>
                </td>
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
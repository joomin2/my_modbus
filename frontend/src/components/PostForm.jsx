import { useState, useEffect } from 'react';

export default function PostForm({ onSubmit, editData, onCancel }) {
  const [form, setForm] = useState({ title: '', content: '', author: '' });

  useEffect(() => {
    if (editData) setForm(editData);
    else setForm({ title: '', content: '', author: '' });
  }, [editData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.content || !form.author) {
      alert('모든 항목을 입력해주세요!');
      return;
    }
    onSubmit(form);
    setForm({ title: '', content: '', author: '' });
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '16px', marginBottom: '20px', borderRadius: '8px' }}>
      <h3>{editData ? '게시글 수정' : '게시글 작성'}</h3>
      <div style={{ marginBottom: '8px' }}>
        <input
          name="title"
          placeholder="제목"
          value={form.title}
          onChange={handleChange}
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        <input
          name="author"
          placeholder="작성자"
          value={form.author}
          onChange={handleChange}
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        <textarea
          name="content"
          placeholder="내용"
          value={form.content}
          onChange={handleChange}
          rows={4}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      <button onClick={handleSubmit} style={{ marginRight: '8px', padding: '8px 16px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        {editData ? '수정 완료' : '작성 완료'}
      </button>
      {editData && (
        <button onClick={onCancel} style={{ padding: '8px 16px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          취소
        </button>
      )}
    </div>
  );
}
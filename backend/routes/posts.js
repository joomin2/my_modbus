const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 30 }); // 30초 캐시

// 게시글 전체 조회 (페이징 + 캐시)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const cacheKey = `posts_${page}_${limit}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('캐시에서 조회!');
    return res.json(cached);
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM posts');
    const result = { data: rows, total, page, limit };
    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 게시글 단건 조회
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: '게시글 없음' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 게시글 작성
router.post('/', async (req, res) => {
  const { title, content, author } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO posts (title, content, author) VALUES (?, ?, ?)',
      [title, content, author]
    );
    await db.query(
      'INSERT INTO post_history (post_id, action, title, author) VALUES (?, ?, ?, ?)',
      [result.insertId, 'CREATE', title, author]
    );
    cache.flushAll(); // 캐시 초기화
    res.json({ id: result.insertId, message: '작성 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 게시글 수정
router.put('/:id', async (req, res) => {
  const { title, content, author } = req.body;
  try {
    await db.query(
      'UPDATE posts SET title = ?, content = ?, author = ? WHERE id = ?',
      [title, content, author, req.params.id]
    );
    await db.query(
      'INSERT INTO post_history (post_id, action, title, author) VALUES (?, ?, ?, ?)',
      [req.params.id, 'UPDATE', title, author]
    );
    cache.flushAll();
    res.json({ message: '수정 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 게시글 삭제
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: '게시글 없음' });
    await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    await db.query(
      'INSERT INTO post_history (post_id, action, title, author) VALUES (?, ?, ?, ?)',
      [req.params.id, 'DELETE', rows[0].title, rows[0].author]
    );
    cache.flushAll();
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 이력 조회 (페이징)
router.get('/history/list', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const [rows] = await db.query(
      'SELECT * FROM post_history ORDER BY acted_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM post_history');
    res.json({ data: rows, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
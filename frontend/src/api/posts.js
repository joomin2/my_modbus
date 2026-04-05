import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/posts';

// 게시글 목록 조회 (페이징)
export const getPosts = (page = 1, limit = 10) =>
  axios.get(`${BASE_URL}?page=${page}&limit=${limit}`);

// 게시글 단건 조회
export const getPost = (id) =>
  axios.get(`${BASE_URL}/${id}`);

// 게시글 작성
export const createPost = (data) =>
  axios.post(BASE_URL, data);

// 게시글 수정
export const updatePost = (id, data) =>
  axios.put(`${BASE_URL}/${id}`, data);

// 게시글 삭제
export const deletePost = (id) =>
  axios.delete(`${BASE_URL}/${id}`);

// 이력 조회 (페이징)
export const getHistory = (page = 1, limit = 10) =>
  axios.get(`${BASE_URL}/history/list?page=${page}&limit=${limit}`);
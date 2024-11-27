import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchArticles = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/articles`);
    return response.data;
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
};

export const generateSummary = async (content) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-summary`, {
      content,
    });
    return response.data;
  } catch (error) {
    console.error('生成摘要失败:', error);
    throw error;
  }
};

export const generateTags = async (content) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-tags`, {
      content,
    });
    return response.data;
  } catch (error) {
    console.error('生成标签失败:', error);
    throw error;
  }
}; 
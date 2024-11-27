import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:3001';

export const fetchArticles = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/articles`);
    return response.data;
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
};

export const generateSummary = async (content: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/generate-summary`, {
      content
    });
    return response.data;
  } catch (error) {
    console.error('生成摘要失败:', error);
    throw error;
  }
};

export const generateTags = async (content: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/generate-tags`, {
      content
    });
    return response.data;
  } catch (error) {
    console.error('生成标签失败:', error);
    throw error;
  }
}; 
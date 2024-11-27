import express from 'express';
import { crawler } from '../services/feishuCrawler.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const articles = await crawler.crawlArticles();
    res.json(articles);
  } catch (error) {
    console.error('获取文章数据失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

export { router as feishuRouter }; 
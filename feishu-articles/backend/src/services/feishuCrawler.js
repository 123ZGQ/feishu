import { Client } from '@larksuiteoapi/node-sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = path.join(__dirname, '../data/articles.json');
const PROCESSED_FILE = path.join(__dirname, '../data/processed_articles.json');

class FeishuCrawler {
  constructor() {
    this.articles = [];
    this.processedArticles = new Map();
    this.client = null;
  }

  async init() {
    try {
      // 初始化飞书客户端
      this.client = new Client({
        appId: process.env.FEISHU_APP_ID,
        appSecret: process.env.FEISHU_APP_SECRET,
      });

      await this.loadFromCache();
      await this.loadProcessedArticles();
      
      console.log('Feishu client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Feishu client:', error);
      throw error;
    }
  }

  async crawlArticles() {
    try {
      console.log('Starting to fetch articles from Feishu...');
      
      // 获取飞书表格数据
      const response = await this.client.bitable.appTableRecord.list({
        path: {
          app_token: process.env.FEISHU_APP_TOKEN,
          table_id: process.env.FEISHU_TABLE_ID,
        },
        params: {
          page_size: 100 // 每页获取的记录数
        }
      });

      console.log('Received response from Feishu API');

      // 处理数据
      const articles = response.data.items.map(item => {
        const fields = item.fields;
        return {
          id: fields.序号 || item.record_id,
          title: fields.标题 || '',
          url: fields.链接 || '',
          category: fields.分类 || '',
          updateTime: fields.更新时间 || '',
          summary: fields.摘要 || '',
          tags: fields.标签 ? fields.标签.split(',').map(tag => tag.trim()) : []
        };
      }).filter(article => article.id && article.url);

      console.log('Processed articles:', articles.length);
      
      if (articles.length > 0) {
        this.articles = articles;
        await this.saveToCache();

        // 合并已处理的数据
        for (const article of articles) {
          if (this.processedArticles.has(article.id)) {
            const processedArticle = this.processedArticles.get(article.id);
            if (!article.summary) article.summary = processedArticle.summary;
            if (!article.tags || article.tags.length === 0) article.tags = processedArticle.tags;
          }
        }

        await this.saveProcessedArticles();
        return articles;
      } else {
        console.log('No articles found, returning cached data');
        return this.articles;
      }
    } catch (error) {
      console.error('Failed to fetch articles from Feishu:', error);
      return this.articles;
    }
  }

  async loadFromCache() {
    try {
      const data = await fs.readFile(CACHE_FILE, 'utf-8');
      this.articles = JSON.parse(data);
      console.log('Loaded from cache:', this.articles.length, 'articles');
    } catch (error) {
      console.log('Failed to load cache:', error.message);
      this.articles = [];
    }
  }

  async saveToCache() {
    try {
      await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
      await fs.writeFile(CACHE_FILE, JSON.stringify(this.articles, null, 2));
      console.log('Saved to cache:', this.articles.length, 'articles');
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  async loadProcessedArticles() {
    try {
      const data = await fs.readFile(PROCESSED_FILE, 'utf-8');
      const articles = JSON.parse(data);
      this.processedArticles = new Map(articles.map(article => [article.id, article]));
      console.log('Loaded processed articles:', this.processedArticles.size);
    } catch (error) {
      console.log('Failed to load processed articles:', error.message);
      this.processedArticles = new Map();
    }
  }

  async saveProcessedArticles() {
    try {
      await fs.mkdir(path.dirname(PROCESSED_FILE), { recursive: true });
      const articles = Array.from(this.processedArticles.values());
      await fs.writeFile(PROCESSED_FILE, JSON.stringify(articles, null, 2));
      console.log('Saved processed articles:', articles.length);
    } catch (error) {
      console.error('Failed to save processed articles:', error);
    }
  }

  async updateArticle(id, summary, tags) {
    try {
      // 更新飞书表格
      await this.client.bitable.appTableRecord.update({
        path: {
          app_token: process.env.FEISHU_APP_TOKEN,
          table_id: process.env.FEISHU_TABLE_ID,
          record_id: id
        },
        data: {
          fields: {
            摘要: summary,
            标签: tags.join(',')
          }
        }
      });

      // 更新本地缓存
      this.processedArticles.set(id, { id, summary, tags });
      await this.saveProcessedArticles();
      
      console.log('Updated article:', id);
    } catch (error) {
      console.error('Failed to update article:', error);
    }
  }

  getArticles() {
    return this.articles;
  }
}

const crawler = new FeishuCrawler();
export { crawler }; 
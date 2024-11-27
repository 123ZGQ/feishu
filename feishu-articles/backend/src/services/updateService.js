import axios from 'axios';
import { openai } from '../config/openai.js';
import { crawler } from './feishuCrawler.js';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HISTORY_FILE = path.join(__dirname, '../data/update_history.json');

async function generateSummary(content) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一个文章摘要生成助手，请生成一个简短的摘要，不超过100字。"
        },
        {
          role: "user",
          content: content
        }
      ],
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('生成摘要失败:', error);
    return '';
  }
}

async function generateTags(content) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一个关键词提取助手，请从文章中提取3-5个关键标签，用逗号分隔。"
        },
        {
          role: "user",
          content: content
        }
      ],
    });
    return completion.choices[0].message.content.split(',').map(tag => tag.trim());
  } catch (error) {
    console.error('生成标签失败:', error);
    return [];
  }
}

// 保存更新历史
async function saveUpdateHistory(article, summary, tags) {
  try {
    let history = [];
    try {
      const data = await fs.readFile(HISTORY_FILE, 'utf-8');
      history = JSON.parse(data);
    } catch (error) {
      console.log('No history file found, creating new one');
    }

    history.push({
      timestamp: new Date().toISOString(),
      articleId: article.id,
      articleUrl: article.url,
      updateLog: article.updateLog,
      originalSummary: article.summary,
      originalTags: article.tags,
      generatedSummary: summary,
      generatedTags: tags
    });

    await fs.mkdir(path.dirname(HISTORY_FILE), { recursive: true });
    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
    console.log('Update history saved for article:', article.id);
  } catch (error) {
    console.error('Failed to save update history:', error);
  }
}

async function updateArticleInfo(article) {
  try {
    // 如果已经有摘要和标签，就跳过处理
    if (article.summary && article.tags && article.tags.length > 0) {
      console.log(`Article ${article.id} already has summary and tags, skipping...`);
      return;
    }

    const response = await axios.get(article.url);
    const $ = cheerio.load(response.data);
    const content = $('article').text() || $('main').text() || $('body').text();
    
    // 只在需要时生成摘要
    let summary = article.summary;
    if (!summary) {
      summary = await generateSummary(content);
    }

    // 只在需要时生成标签
    let tags = article.tags;
    if (!tags || tags.length === 0) {
      tags = await generateTags(content);
    }
    
    // 保存更新历史
    await saveUpdateHistory(article, summary, tags);
    
    // 更新处理过的文章
    await crawler.updateArticle(article.id, summary, tags);
  } catch (error) {
    console.error('更新文章信息失败:', error);
  }
}

function startUpdateService() {
  setInterval(async () => {
    try {
      const articles = await crawler.crawlArticles();
      for (const article of articles) {
        if (!article.summary || !article.tags.length) {
          await updateArticleInfo(article);
        }
      }
    } catch (error) {
      console.error('自动更新服务失败:', error);
    }
  }, 30 * 60 * 1000);
}

export { startUpdateService }; 
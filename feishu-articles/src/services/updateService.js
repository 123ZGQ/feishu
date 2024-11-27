const { client } = require('../config/feishu');
const axios = require('axios');
const { openai } = require('../config/openai');

// 获取文章内容
async function fetchArticleContent(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('获取文章内容失败:', error);
    throw error;
  }
}

// 生成摘要
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
    throw error;
  }
}

// 生成标签
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
    throw error;
  }
}

// 更新飞书记录
async function updateFeishuRecord(recordId, fields) {
  try {
    await client.bitable.appTableRecord.update({
      path: {
        app_token: process.env.FEISHU_APP_TOKEN,
        table_id: process.env.FEISHU_TABLE_ID,
        record_id: recordId,
      },
      data: { fields },
    });
  } catch (error) {
    console.error('更新飞书记录失败:', error);
    throw error;
  }
}

// 获取所有文章
async function getAllArticles() {
  try {
    const response = await client.bitable.appTable.records.list({
      path: {
        app_token: process.env.FEISHU_APP_TOKEN,
        table_id: process.env.FEISHU_TABLE_ID,
      },
    });
    return response.data.items.map(item => ({
      id: item.record_id,
      url: item.fields.文章链接,
    }));
  } catch (error) {
    console.error('获取文章列表失败:', error);
    throw error;
  }
}

async function updateArticleInfo(article) {
  try {
    const content = await fetchArticleContent(article.url);
    const summary = await generateSummary(content);
    const tags = await generateTags(content);
    
    await updateFeishuRecord(article.id, {
      文章摘要: summary,
      标签: tags.join(',')
    });
  } catch (error) {
    console.error('更新文章信息失败:', error);
  }
}

function startUpdateService() {
  setInterval(async () => {
    try {
      const articles = await getAllArticles();
      for (const article of articles) {
        await updateArticleInfo(article);
      }
    } catch (error) {
      console.error('自动更新服务失败:', error);
    }
  }, 30 * 60 * 1000); // 每30分钟执行一次
}

module.exports = { 
  startUpdateService,
  updateArticleInfo,
  getAllArticles,
}; 
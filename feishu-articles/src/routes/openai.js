const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/generate-summary', async (req, res) => {
  try {
    const { content } = req.body;
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

    res.json({ summary: completion.choices[0].message.content });
  } catch (error) {
    console.error('生成摘要失败:', error);
    res.status(500).json({ error: '生成摘要失败' });
  }
});

router.post('/generate-tags', async (req, res) => {
  try {
    const { content } = req.body;
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

    const tags = completion.choices[0].message.content.split(',').map(tag => tag.trim());
    res.json({ tags });
  } catch (error) {
    console.error('生成标签失败:', error);
    res.status(500).json({ error: '生成标签失败' });
  }
});

module.exports = { openaiRouter: router }; 
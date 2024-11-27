const express = require('express');
const { Client } = require('@larksuiteoapi/node-sdk');
const router = express.Router();

const client = new Client({
  appId: process.env.FEISHU_APP_ID,
  appSecret: process.env.FEISHU_APP_SECRET,
});

router.get('/', async (req, res) => {
  try {
    // 获取飞书表格数据
    const response = await client.bitable.appTable.records.list({
      path: {
        app_token: process.env.FEISHU_APP_TOKEN,
        table_id: process.env.FEISHU_TABLE_ID,
      },
    });

    const articles = response.data.items.map(item => ({
      id: item.fields.编号,
      updateLog: item.fields.更新日志,
      url: item.fields.文章链接,
      summary: item.fields.文章摘要 || '',
      tags: item.fields.标签 ? item.fields.标签.split(',') : []
    }));

    res.json(articles);
  } catch (error) {
    console.error('获取飞书数据失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

module.exports = { feishuRouter: router }; 
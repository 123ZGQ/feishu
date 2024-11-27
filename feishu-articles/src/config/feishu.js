const { Client } = require('@larksuiteoapi/node-sdk');

const client = new Client({
  appId: process.env.FEISHU_APP_ID,
  appSecret: process.env.FEISHU_APP_SECRET,
});

module.exports = { client }; 
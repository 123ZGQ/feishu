const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { feishuRouter } = require('./routes/feishu');
const { openaiRouter } = require('./routes/openai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 路由
app.use('/api/articles', feishuRouter);
app.use('/api', openaiRouter);

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 
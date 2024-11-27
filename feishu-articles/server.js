import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { feishuRouter } from './src/routes/feishu.js';
import { openaiRouter } from './src/routes/openai.js';
import { startUpdateService } from './src/services/updateService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/articles', feishuRouter);
app.use('/api', openaiRouter);

app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
  startUpdateService();
}); 
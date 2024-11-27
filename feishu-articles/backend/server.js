import { ReadableStream } from 'web-streams-polyfill/dist/ponyfill.js';
global.ReadableStream = ReadableStream;

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { feishuRouter } from './src/routes/feishu.js';
import { openaiRouter } from './src/routes/openai.js';
import { startUpdateService } from './src/services/updateService.js';
import { crawler } from './src/services/feishuCrawler.js';

async function startServer() {
  try {
    console.log('Starting server initialization...');
    
    // 加载环境变量
    dotenv.config();
    console.log('Environment variables loaded');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // 创建必要的目录
    const dataDir = join(__dirname, 'src', 'data');
    try {
      await fs.mkdir(dataDir, { recursive: true });
      console.log('Data directory created:', dataDir);
    } catch (error) {
      console.error('Failed to create data directory:', error);
    }

    const app = express();
    const PORT = process.env.PORT || 3001;

    // 配置 CORS
    app.use(cors({
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    app.use(express.json());

    // 健康检查端点
    app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    // 初始化爬虫
    console.log('Initializing crawler...');
    try {
      await crawler.init();
      console.log('Crawler initialized successfully');
    } catch (error) {
      console.error('Crawler initialization failed:', error);
      throw error;
    }

    app.use('/api/articles', feishuRouter);
    app.use('/api', openaiRouter);

    // 错误处理中间件
    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(500).json({ error: 'Internal server error', message: err.message });
    });

    // 修改监听配置
    const server = app.listen(PORT, '127.0.0.1', () => {
      console.log(`后端服务运行在 http://127.0.0.1:${PORT}`);
      // 将 startUpdateService 包装在 Promise 中
      Promise.resolve().then(() => {
        return startUpdateService();
      }).catch(error => {
        console.error('Update service failed to start:', error);
      });
    });

    // 处理服务器错误
    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

    // 优雅退出
    process.on('SIGINT', async () => {
      console.log('正在关闭服务...');
      try {
        await crawler.close();
        server.close(() => {
          console.log('Server closed');
          process.exit(0);
        });
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('Server initialization failed:', error);
    console.error('Error details:', error.stack);
    process.exit(1);
  }
}

// 启动服务器
startServer().catch(error => {
  console.error('Fatal error:', error);
  console.error('Error details:', error.stack);
  process.exit(1);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Error details:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  console.error('Error details:', error.stack);
  process.exit(1);
}); 
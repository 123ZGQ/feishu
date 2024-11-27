const { exec, spawn } = require('child_process');
const path = require('path');
const http = require('http');

function waitForServer(url) {
  console.log(`Waiting for server at ${url}...`);
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 30;
    
    const interval = setInterval(() => {
      attempts++;
      console.log(`Attempt ${attempts} of ${maxAttempts}...`);
      
      http.get(url, (res) => {
        console.log(`Server responded with status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          clearInterval(interval);
          resolve();
        }
      }).on('error', (err) => {
        console.log(`Connection attempt failed: ${err.message}`);
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error(`Server start failed after ${maxAttempts} attempts: ${err.message}`));
        }
      });
    }, 1000);
  });
}

async function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('Starting backend server...');
    console.log('Current directory:', process.cwd());
    console.log('Backend directory:', path.join(process.cwd(), 'backend'));
    
    // 使用 npm run dev 命令
    const backend = spawn('npm.cmd', ['run', 'dev'], {
      cwd: path.join(process.cwd(), 'backend'),
      shell: true,
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: true }
    });

    let serverStarted = false;
    let errorOutput = '';

    backend.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Backend] ${output}`);
      if (output.includes('后端服务运行在') || 
          output.includes('server running') || 
          output.includes('listening on port')) {
        serverStarted = true;
        resolve(backend);
      }
    });

    backend.stderr.on('data', (data) => {
      const error = data.toString();
      errorOutput += error;
      console.error(`[Backend Error] ${error}`);
    });

    backend.on('error', (error) => {
      console.error(`Backend process error:`, error);
      reject(new Error(`Backend process error: ${error.message}\n${errorOutput}`));
    });

    backend.on('close', (code) => {
      if (code !== 0 && !serverStarted) {
        console.error(`Backend process exited with code ${code}`);
        console.error('Error output:', errorOutput);
        reject(new Error(`Backend process exited with code ${code}\n${errorOutput}`));
      }
    });

    // 设置启动超时
    setTimeout(() => {
      if (!serverStarted) {
        console.error('Backend startup timed out');
        console.error('Error output:', errorOutput);
        backend.kill();
        reject(new Error(`Backend start timeout - 60s\n${errorOutput}`));
      }
    }, 60000);
  });
}

async function startFrontend() {
  return new Promise((resolve, reject) => {
    console.log('Starting frontend server...');
    console.log('Frontend directory:', path.join(process.cwd(), 'frontend'));
    
    const frontend = spawn('npm.cmd', ['run', 'dev'], {
      cwd: path.join(process.cwd(), 'frontend'),
      shell: true,
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: true }
    });

    let errorOutput = '';

    frontend.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Frontend] ${output}`);
      if (output.includes('Local:') || output.includes('ready in')) {
        resolve(frontend);
      }
    });

    frontend.stderr.on('data', (data) => {
      const error = data.toString();
      errorOutput += error;
      console.error(`[Frontend Error] ${error}`);
    });

    frontend.on('error', (error) => {
      console.error(`Frontend process error:`, error);
      reject(new Error(`Frontend process error: ${error.message}\n${errorOutput}`));
    });

    frontend.on('close', (code) => {
      if (code !== 0) {
        console.error(`Frontend process exited with code ${code}`);
        console.error('Error output:', errorOutput);
        reject(new Error(`Frontend process exited with code ${code}\n${errorOutput}`));
      }
    });

    setTimeout(() => {
      console.error('Frontend startup timed out');
      console.error('Error output:', errorOutput);
      frontend.kill();
      reject(new Error(`Frontend start timeout - 60s\n${errorOutput}`));
    }, 60000);
  });
}

async function startServices() {
  try {
    console.log('Starting services...');
    console.log('Current directory:', process.cwd());
    
    // 启动后端
    console.log('Starting backend...');
    const backendProcess = await startBackend();
    console.log('Backend started successfully');

    // 等待健康检查通过
    console.log('Waiting for backend health check...');
    await waitForServer('http://127.0.0.1:3001/health');
    console.log('Backend health check passed');

    // 启动前端
    console.log('Starting frontend...');
    const frontendProcess = await startFrontend();
    console.log('Frontend started successfully');
    
    console.log('All services started successfully');

    // 处理进程退出
    process.on('SIGINT', () => {
      console.log('Shutting down services...');
      backendProcess && backendProcess.kill();
      frontendProcess && frontendProcess.kill();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start services:', error);
    process.exit(1);
  }
}

// 启动服务
startServices(); 
# 飞书文章采集系统 - 配置指南

## 1. 飞书配置

### 1.1 创建飞书多维表格
1. 访问飞书多维表格：https://www.feishu.cn/product/base
2. 创建新表格，添加以下字段：
   ```
   序号：数字类型（必填）
   标题：文本类型（必填）
   链接：链接类型（必填）
   分类：单选类型
   更新时间：日期类型
   摘要：多行文本类型
   标签：文本类型
   ```

### 1.2 获取表格信息
1. 获取 app_token：
   - 打开表格，从URL中复制
   - 例如：`https://iqzeljuzeco.feishu.cn/sheets/N5Wts8V9Wh3gXJtyxPvcDbMZnJc`
   - 其中 `N5Wts8V9Wh3gXJtyxPvcDbMZnJc` 就是 app_token

2. 获取 table_id：
   - 点击表格右上角"..."
   - 选择"复制表格 ID"

### 1.3 创建飞书应用
1. 访问开发者平台：https://open.feishu.cn/app
2. 点击"创建企业自建应用"
3. 填写基本信息：
   - 应用名称
   - 应用描述
   - 应用图标

### 1.4 配置应用权限
1. 在应用详情页面找到"权限管理"
2. 搜索并添加以下权限：
   ```
   bitable:app:view
   bitable:app:manage
   bitable:table:view
   bitable:table:edit
   ```

### 1.5 获取应用凭证
1. 在应用详情页面找到"凭证与基础信息"
2. 记录以下信息：
   - App ID
   - App Secret

## 2. OpenAI 配置

### 2.1 获取 API 密钥
1. 访问：https://platform.openai.com/
2. 登录账号
3. 点击右上角头像 -> API Keys
4. 点击"Create new secret key"
5. 保存生成的密钥

## 3. 项目配置

### 3.1 环境变量配置
1. 在 backend 目录下创建 `.env` 文件：
   ```plaintext
   PORT=3001
   FEISHU_APP_ID=cli_xxxx      # 从飞书应用凭证页面获取
   FEISHU_APP_SECRET=xxxx      # 从飞书应用凭证页面获取
   FEISHU_APP_TOKEN=N5Wts8V9Wh3gXJtyxPvcDbMZnJc  # 从飞书表格URL获取
   FEISHU_TABLE_ID=tblxxxx     # 从表格设置中获取
   OPENAI_API_KEY=sk-xxxx      # OpenAI API密钥
   ```

### 3.2 安装依赖
1. 安装项目依赖：
   ```bash
   # 在项目根目录下执行
   npm run install:all
   ```

### 3.3 启动服务
1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 访问服务：
   - 前端界面：http://localhost:5173
   - 后端服务：http://localhost:3001

## 4. 验证配置

### 4.1 检查飞书连接
1. 访问：http://localhost:3001/api/articles
2. 应该看到飞书表格数据的 JSON 响应
3. 检查数据字段是否完整

### 4.2 检查 OpenAI 连接
1. 在飞书表格添加测试文章
2. 等待系统自动生成摘要和标签
3. 检查生成的内容质量

### 4.3 检查自动更新
1. 在飞书表格中添加新文章
2. 等待约5分钟
3. 刷新前端页面，确认更新

## 5. 常见问题

### 5.1 飞书配置问题
1. 权限不足：
   - 检查应用权限是否已添加
   - 确认应用是否已发布
   - 验证环境变量是否正确

2. 表格访问失败：
   - 确认表格是否可访问
   - 检查字段名称是否匹配
   - 验证 token 是否有效

### 5.2 OpenAI 配置问题
1. API 调用失败：
   - 检查 API 密钥是否有效
   - 确认账户余额充足
   - 检查网络连接状态

### 5.3 系统问题
1. 服务启动失败：
   - 检查端口是否被占用
   - 确认依赖安装完整
   - 查看错误日志

2. 数据不更新：
   - 检查定时任务是否运行
   - 确认缓存机制正常
   - 验证数据同步流程

## 6. 安全建议

1. 环境变量保护：
   - 不要提交 .env 文件
   - 定期更换密钥
   - 使用环境变量管理工具

2. 访问控制：
   - 限制 API 访问范围
   - 实施请求频率限制
   - 监控异常访问

3. 数据安全：
   - 定期备份数据
   - 加密敏感信息
   - 实施日志审计
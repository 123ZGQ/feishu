import React from 'react';
import { Layout, Typography } from 'antd';
import ArticleList from './components/ArticleList';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout className="layout">
      <Header className="header">
        <Title level={3} style={{ color: 'white', margin: '16px 0' }}>
          文章列表
        </Title>
      </Header>
      <Content style={{ padding: '24px 50px' }}>
        <ArticleList />
      </Content>
    </Layout>
  );
}

export default App; 
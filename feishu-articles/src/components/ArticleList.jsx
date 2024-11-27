import React, { useState, useEffect } from 'react';
import { Table, Tag, Space } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: '编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '更新日志',
      dataIndex: 'updateLog',
      key: 'updateLog',
    },
    {
      title: '文章摘要',
      dataIndex: 'summary',
      key: 'summary',
      width: 300,
    },
    {
      title: '文章链接',
      dataIndex: 'url',
      key: 'url',
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          <LinkOutlined /> 查看文章
        </a>
      ),
    },
    {
      title: '标签',
      key: 'tags',
      dataIndex: 'tags',
      render: (tags) => (
        <>
          {tags.map((tag) => (
            <Tag color="blue" key={tag}>
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchArticles();
    // 设置定时轮询，每5分钟更新一次数据
    const interval = setInterval(fetchArticles, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/articles');
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('获取文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Table
      columns={columns}
      dataSource={articles}
      loading={loading}
      rowKey="id"
      pagination={{ pageSize: 10 }}
    />
  );
};

export default ArticleList; 
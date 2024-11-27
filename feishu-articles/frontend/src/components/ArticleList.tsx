import React, { useState, useEffect } from 'react';
import { Table, Tag } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { fetchArticles } from '../services/api';

interface Article {
  id: string;
  updateLog: string;
  summary: string;
  url: string;
  tags: string[];
}

const ArticleList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
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
      render: (text: string) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          <LinkOutlined /> 查看文章
        </a>
      ),
    },
    {
      title: '标签',
      key: 'tags',
      dataIndex: 'tags',
      render: (tags: string[]) => (
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

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await fetchArticles();
      setArticles(data);
    } catch (error) {
      console.error('获取文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
    const interval = setInterval(loadArticles, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
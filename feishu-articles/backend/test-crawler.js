import { crawler } from './src/services/feishuCrawler.js';

async function testCrawler() {
  try {
    console.log('开始测试爬虫...');
    
    // 初始化爬虫
    console.log('初始化爬虫...');
    await crawler.init();
    console.log('爬虫初始化成功');
    
    // 爬取文章
    console.log('开始爬取文章...');
    const articles = await crawler.crawlArticles();
    console.log('爬取完成，获取到文章数量:', articles.length);
    
    // 打印文章内容
    console.log('\n爬取到的文章内容:');
    articles.forEach((article, index) => {
      console.log(`\n文章 ${index + 1}:`);
      console.log('ID:', article.id);
      console.log('标题:', article.title);
      console.log('URL:', article.url);
      console.log('分类:', article.category);
      console.log('更新时间:', article.updateTime);
      console.log('摘要:', article.summary);
      console.log('标签:', article.tags.join(', '));
    });
    
    // 保存到文件
    console.log('\n保存爬取结果到文件...');
    await crawler.saveToCache();
    console.log('保存完成');
    
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    // 关闭浏览器
    await crawler.close();
    console.log('\n测试完成，浏览器已关闭');
  }
}

// 运行测试
testCrawler(); 
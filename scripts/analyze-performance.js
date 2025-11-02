#!/usr/bin/env node

/**
 * 性能分析脚本
 * 使用Lighthouse分析网站性能
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const config = {
  // 网站URL
  url: 'http://localhost:4321',
  // 输出目录
  outputDir: 'performance-reports',
  // Lighthouse配置
  lighthouseConfig: {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      },
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false
      },
      emulatedUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    }
  },
  // 需要分析的页面
  pages: [
    '/',
    '/about',
    '/blog',
    '/tags',
    '/search'
  ]
};

// 检查是否安装了Lighthouse
let lighthouse;
try {
  lighthouse = require('lighthouse');
} catch (e) {
  console.error('请先安装Lighthouse: npm install -g lighthouse');
  process.exit(1);
}

// 创建输出目录
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// 运行Lighthouse分析
async function runLighthouse(url, outputPath) {
  console.log(`分析页面: ${url}`);
  
  try {
    // 使用Chrome Launcher启动Chrome
    const chromeLauncher = require('chrome-launcher');
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
      ...config.lighthouseConfig
    };
    
    // 运行Lighthouse
    const runnerResult = await lighthouse(url, options);
    
    // 关闭Chrome
    await chrome.kill();
    
    // 保存结果
    fs.writeFileSync(outputPath, JSON.stringify(runnerResult.lhr, null, 2));
    
    // 生成HTML报告
    const reportHtml = require('lighthouse/report/generator/report.js');
    const html = reportHtml.generateReport(runnerResult.lhr);
    fs.writeFileSync(outputPath.replace('.json', '.html'), html);
    
    // 提取关键指标
    const { categories, audits } = runnerResult.lhr;
    const performance = categories.performance.score * 100;
    const accessibility = categories.accessibility.score * 100;
    const bestPractices = categories['best-practices'].score * 100;
    const seo = categories.seo.score * 100;
    
    const fcp = audits['first-contentful-paint'].displayValue;
    const lcp = audits['largest-contentful-paint'].displayValue;
    const tbt = audits['total-blocking-time'].displayValue;
    const cls = audits['cumulative-layout-shift'].displayValue;
    const si = audits['speed-index'].displayValue;
    
    console.log(`  性能: ${performance.toFixed(0)}`);
    console.log(`  可访问性: ${accessibility.toFixed(0)}`);
    console.log(`  最佳实践: ${bestPractices.toFixed(0)}`);
    console.log(`  SEO: ${seo.toFixed(0)}`);
    console.log(`  FCP: ${fcp}`);
    console.log(`  LCP: ${lcp}`);
    console.log(`  TBT: ${tbt}`);
    console.log(`  CLS: ${cls}`);
    console.log(`  SI: ${si}`);
    
    return {
      url,
      performance,
      accessibility,
      bestPractices,
      seo,
      fcp,
      lcp,
      tbt,
      cls,
      si
    };
  } catch (error) {
    console.error(`分析失败: ${url}`, error);
    return null;
  }
}

// 生成汇总报告
function generateSummaryReport(results) {
  const validResults = results.filter(r => r !== null);
  
  if (validResults.length === 0) {
    console.error('没有有效的分析结果');
    return;
  }
  
  // 计算平均值
  const avgPerformance = validResults.reduce((sum, r) => sum + r.performance, 0) / validResults.length;
  const avgAccessibility = validResults.reduce((sum, r) => sum + r.accessibility, 0) / validResults.length;
  const avgBestPractices = validResults.reduce((sum, r) => sum + r.bestPractices, 0) / validResults.length;
  const avgSeo = validResults.reduce((sum, r) => sum + r.seo, 0) / validResults.length;
  
  // 找出最佳和最差页面
  const bestPerformance = validResults.reduce((best, current) => 
    current.performance > best.performance ? current : best
  );
  const worstPerformance = validResults.reduce((worst, current) => 
    current.performance < worst.performance ? current : worst
  );
  
  // 生成报告
  const report = {
    timestamp: new Date().toISOString(),
    url: config.url,
    summary: {
      avgPerformance: avgPerformance.toFixed(0),
      avgAccessibility: avgAccessibility.toFixed(0),
      avgBestPractices: avgBestPractices.toFixed(0),
      avgSeo: avgSeo.toFixed(0),
      bestPerformance: {
        url: bestPerformance.url,
        score: bestPerformance.performance.toFixed(0)
      },
      worstPerformance: {
        url: worstPerformance.url,
        score: worstPerformance.performance.toFixed(0)
      }
    },
    pages: validResults
  };
  
  // 保存汇总报告
  const summaryPath = path.join(config.outputDir, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(report, null, 2));
  
  // 生成HTML汇总报告
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>性能分析报告</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2 {
      color: #2c3e50;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .metric-value {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .metric-label {
      color: #6c757d;
    }
    .pages {
      margin-top: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #dee2e6;
    }
    .score {
      font-weight: bold;
    }
    .good { color: #28a745; }
    .medium { color: #ffc107; }
    .poor { color: #dc3545; }
  </style>
</head>
<body>
  <h1>性能分析报告</h1>
  <p>生成时间: ${new Date().toLocaleString()}</p>
  <p>分析网站: <a href="${config.url}" target="_blank">${config.url}</a></p>
  
  <div class="summary">
    <div class="metric">
      <div class="metric-value ${avgPerformance >= 90 ? 'good' : avgPerformance >= 50 ? 'medium' : 'poor'}">${avgPerformance.toFixed(0)}</div>
      <div class="metric-label">平均性能分数</div>
    </div>
    <div class="metric">
      <div class="metric-value ${avgAccessibility >= 90 ? 'good' : avgAccessibility >= 50 ? 'medium' : 'poor'}">${avgAccessibility.toFixed(0)}</div>
      <div class="metric-label">平均可访问性分数</div>
    </div>
    <div class="metric">
      <div class="metric-value ${avgBestPractices >= 90 ? 'good' : avgBestPractices >= 50 ? 'medium' : 'poor'}">${avgBestPractices.toFixed(0)}</div>
      <div class="metric-label">平均最佳实践分数</div>
    </div>
    <div class="metric">
      <div class="metric-value ${avgSeo >= 90 ? 'good' : avgSeo >= 50 ? 'medium' : 'poor'}">${avgSeo.toFixed(0)}</div>
      <div class="metric-label">平均SEO分数</div>
    </div>
  </div>
  
  <div class="pages">
    <h2>页面详情</h2>
    <table>
      <thead>
        <tr>
          <th>页面</th>
          <th>性能</th>
          <th>可访问性</th>
          <th>最佳实践</th>
          <th>SEO</th>
          <th>FCP</th>
          <th>LCP</th>
          <th>TBT</th>
          <th>CLS</th>
        </tr>
      </thead>
      <tbody>
        ${validResults.map(page => `
          <tr>
            <td><a href="${page.url}" target="_blank">${page.url}</a></td>
            <td class="score ${page.performance >= 90 ? 'good' : page.performance >= 50 ? 'medium' : 'poor'}">${page.performance.toFixed(0)}</td>
            <td class="score ${page.accessibility >= 90 ? 'good' : page.accessibility >= 50 ? 'medium' : 'poor'}">${page.accessibility.toFixed(0)}</td>
            <td class="score ${page.bestPractices >= 90 ? 'good' : page.bestPractices >= 50 ? 'medium' : 'poor'}">${page.bestPractices.toFixed(0)}</td>
            <td class="score ${page.seo >= 90 ? 'good' : page.seo >= 50 ? 'medium' : 'poor'}">${page.seo.toFixed(0)}</td>
            <td>${page.fcp}</td>
            <td>${page.lcp}</td>
            <td>${page.tbt}</td>
            <td>${page.cls}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(config.outputDir, 'summary.html'), html);
  console.log(`汇总报告已生成: ${path.join(config.outputDir, 'summary.html')}`);
}

// 主函数
async function main() {
  console.log('开始性能分析...');
  
  // 创建输出目录
  ensureDir(config.outputDir);
  
  // 分析每个页面
  const results = [];
  for (const page of config.pages) {
    const url = `${config.url}${page}`;
    const fileName = page.replace(/\//g, '-').replace(/^-/, '') || 'index';
    const outputPath = path.join(config.outputDir, `${fileName}.json`);
    
    const result = await runLighthouse(url, outputPath);
    if (result) {
      results.push(result);
    }
    
    // 添加延迟，避免过于频繁的请求
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 生成汇总报告
  generateSummaryReport(results);
  
  console.log('性能分析完成!');
  console.log(`报告已保存到: ${config.outputDir}`);
}

// 运行脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runLighthouse, generateSummaryReport, config };
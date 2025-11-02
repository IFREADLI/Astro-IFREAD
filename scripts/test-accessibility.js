// 可访问性测试脚本
// 使用axe-core进行自动化可访问性测试

import { createRequire } from 'module';
import { JSDOM } from 'jsdom';
import axe from 'axe-core';
import fs from 'fs/promises';
import path from 'path';

const require = createRequire(import.meta.url);

// 配置
const config = {
  // 测试的页面
  pages: [
    '/',
    '/blog/',
    '/projects/',
    '/about/',
    '/contact/'
  ],
  // 输出目录
  outputDir: 'accessibility-reports',
  // 构建目录
  buildDir: 'dist'
};

// 确保目录存在
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// 读取HTML文件
async function readHtmlFile(filePath) {
  try {
    const html = await fs.readFile(filePath, 'utf8');
    return html;
  } catch (error) {
    console.error(`读取文件失败: ${filePath}`, error);
    return null;
  }
}

// 运行axe可访问性测试
async function runAccessibilityTest(html, pageUrl) {
  // 创建虚拟DOM
  const dom = new JSDOM(html);
  const { window } = dom;
  
  // 在全局作用域中设置axe
  global.window = window;
  global.document = window.document;
  global.navigator = window.navigator;
  
  // 注入axe脚本
  await new Promise((resolve) => {
    const script = window.document.createElement('script');
    script.textContent = axe.source;
    window.document.head.appendChild(script);
    script.onload = resolve;
  });
  
  // 运行axe测试
  try {
    const results = await axe.run();
    return results;
  } catch (error) {
    console.error(`页面 ${pageUrl} 测试失败:`, error);
    return null;
  }
}

// 生成HTML报告
function generateHtmlReport(results, pageUrl) {
  const { violations, passes, incomplete, inapplicable } = results;
  
  // 生成违规项HTML
  const violationsHtml = violations.map(violation => {
    const nodesHtml = violation.nodes.map(node => {
      const targetHtml = node.target.map(target => `<code>${target}</code>`).join(', ');
      const html = `<div class="node">
        <h4>目标元素:</h4>
        <p>${targetHtml}</p>
        <h4>HTML:</h4>
        <pre><code>${node.html}</code></pre>
        ${node.failureSummary ? `<h4>失败原因:</h4><p>${node.failureSummary}</p>` : ''}
      </div>`;
      
      return html;
    }).join('');
    
    return `
      <div class="violation">
        <h3>${violation.id}: ${violation.description}</h3>
        <p><strong>影响级别:</strong> ${violation.impact}</p>
        <p><strong>帮助:</strong> <a href="${violation.helpUrl}" target="_blank">${violation.help}</a></p>
        <div class="nodes">
          ${nodesHtml}
        </div>
      </div>
    `;
  }).join('');
  
  // 生成通过项HTML（仅摘要）
  const passesSummary = `<p>共通过 ${passes.length} 项检查</p>`;
  
  // 生成不完整项HTML
  const incompleteHtml = incomplete.map(item => {
    return `
      <div class="incomplete">
        <h3>${item.id}: ${item.description}</h3>
        <p><strong>帮助:</strong> <a href="${item.helpUrl}" target="_blank">${item.help}</a></p>
        <p>需要手动检查这些项目</p>
      </div>
    `;
  }).join('');
  
  // 生成完整报告HTML
  const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>可访问性报告 - ${pageUrl}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3, h4 {
          color: #2c3e50;
        }
        .summary {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .violation {
          border-left: 5px solid #e74c3c;
          padding: 15px;
          margin-bottom: 20px;
          background: #fdf2f2;
        }
        .incomplete {
          border-left: 5px solid #f39c12;
          padding: 15px;
          margin-bottom: 20px;
          background: #fef9e7;
        }
        .node {
          background: #fff;
          padding: 15px;
          border-radius: 5px;
          margin-top: 10px;
          border: 1px solid #eee;
        }
        pre {
          background: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
        }
        code {
          background: #f5f5f5;
          padding: 2px 4px;
          border-radius: 3px;
        }
        a {
          color: #3498db;
        }
      </style>
    </head>
    <body>
      <h1>可访问性报告</h1>
      <h2>页面: ${pageUrl}</h2>
      
      <div class="summary">
        <h3>测试摘要</h3>
        <p><strong>违规项:</strong> ${violations.length}</p>
        <p><strong>通过项:</strong> ${passes.length}</p>
        <p><strong>需要手动检查:</strong> ${incomplete.length}</p>
        <p><strong>不适用:</strong> ${inapplicable.length}</p>
      </div>
      
      ${violations.length > 0 ? `
        <h2>违规项 (${violations.length})</h2>
        ${violationsHtml}
      ` : '<h2>没有违规项！</h2>'}
      
      <h2>通过项</h2>
      ${passesSummary}
      
      ${incomplete.length > 0 ? `
        <h2>需要手动检查 (${incomplete.length})</h2>
        ${incompleteHtml}
      ` : ''}
    </body>
    </html>
  `;
  
  return html;
}

// 生成JSON报告
function generateJsonReport(results, pageUrl) {
  return {
    pageUrl,
    timestamp: new Date().toISOString(),
    results: {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      inapplicable: results.inapplicable
    }
  };
}

// 生成摘要报告
function generateSummaryReport(allResults) {
  const totalViolations = allResults.reduce((sum, result) => sum + result.violations.length, 0);
  const totalPasses = allResults.reduce((sum, result) => sum + result.passes.length, 0);
  const totalIncomplete = allResults.reduce((sum, result) => sum + result.incomplete.length, 0);
  
  // 收集所有违规类型
  const violationTypes = {};
  allResults.forEach(result => {
    result.violations.forEach(violation => {
      if (!violationTypes[violation.id]) {
        violationTypes[violation.id] = {
          id: violation.id,
          description: violation.description,
          impact: violation.impact,
          help: violation.help,
          helpUrl: violation.helpUrl,
          count: 0,
          pages: []
        };
      }
      violationTypes[violation.id].count++;
      violationTypes[violation.id].pages.push(result.pageUrl);
    });
  });
  
  // 生成HTML报告
  const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>可访问性摘要报告</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3, h4 {
          color: #2c3e50;
        }
        .summary {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .violation-type {
          border-left: 5px solid #e74c3c;
          padding: 15px;
          margin-bottom: 20px;
          background: #fdf2f2;
        }
        .pages {
          margin-top: 10px;
        }
        .page {
          display: inline-block;
          background: #e74c3c;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          margin-right: 5px;
          margin-bottom: 5px;
          font-size: 0.8em;
        }
        a {
          color: #3498db;
        }
      </style>
    </head>
    <body>
      <h1>可访问性摘要报告</h1>
      
      <div class="summary">
        <h2>总体摘要</h2>
        <p><strong>总违规项:</strong> ${totalViolations}</p>
        <p><strong>总通过项:</strong> ${totalPasses}</p>
        <p><strong>总需手动检查:</strong> ${totalIncomplete}</p>
        <p><strong>测试页面数:</strong> ${allResults.length}</p>
      </div>
      
      <h2>违规类型汇总</h2>
      ${Object.values(violationTypes).map(violation => `
        <div class="violation-type">
          <h3>${violation.id}: ${violation.description}</h3>
          <p><strong>影响级别:</strong> ${violation.impact}</p>
          <p><strong>出现次数:</strong> ${violation.count}</p>
          <p><strong>帮助:</strong> <a href="${violation.helpUrl}" target="_blank">${violation.help}</a></p>
          <div class="pages">
            <strong>受影响页面:</strong>
            ${violation.pages.map(page => `<span class="page">${page}</span>`).join('')}
          </div>
        </div>
      `).join('')}
      
      <h2>详细报告</h2>
      <ul>
        ${allResults.map(result => `
          <li><a href="${result.pageUrl.replace(/\//g, '_')}.html">${result.pageUrl}</a> (${result.violations.length} 违规项)</li>
        `).join('')}
      </ul>
    </body>
    </html>
  `;
  
  return html;
}

// 主函数
async function main() {
  console.log('开始可访问性测试...');
  
  // 确保输出目录存在
  await ensureDirectoryExists(config.outputDir);
  
  const allResults = [];
  
  // 测试每个页面
  for (const page of config.pages) {
    console.log(`测试页面: ${page}`);
    
    // 构建文件路径
    let filePath;
    if (page === '/') {
      filePath = path.join(config.buildDir, 'index.html');
    } else {
      filePath = path.join(config.buildDir, page.replace(/^\//, ''), 'index.html');
    }
    
    // 读取HTML文件
    const html = await readHtmlFile(filePath);
    if (!html) {
      console.error(`无法读取页面: ${page}`);
      continue;
    }
    
    // 运行可访问性测试
    const results = await runAccessibilityTest(html, page);
    if (!results) {
      console.error(`页面测试失败: ${page}`);
      continue;
    }
    
    // 生成HTML报告
    const htmlReport = generateHtmlReport(results, page);
    const htmlReportPath = path.join(config.outputDir, `${page.replace(/\//g, '_')}.html`);
    await fs.writeFile(htmlReportPath, htmlReport);
    
    // 生成JSON报告
    const jsonReport = generateJsonReport(results, page);
    const jsonReportPath = path.join(config.outputDir, `${page.replace(/\//g, '_')}.json`);
    await fs.writeFile(jsonReportPath, JSON.stringify(jsonReport, null, 2));
    
    // 添加到结果列表
    allResults.push({
      pageUrl: page,
      ...results
    });
    
    console.log(`页面 ${page} 测试完成，发现 ${results.violations.length} 个违规项`);
  }
  
  // 生成摘要报告
  const summaryReport = generateSummaryReport(allResults);
  const summaryReportPath = path.join(config.outputDir, 'summary.html');
  await fs.writeFile(summaryReportPath, summaryReport);
  
  console.log(`可访问性测试完成，报告已生成到 ${config.outputDir} 目录`);
  console.log(`摘要报告: ${summaryReportPath}`);
}

// 运行主函数
main().catch(console.error);
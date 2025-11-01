/**
 * HTML → Markdown 转换器
 * 基于 turndown 库的封装
 */

// turndown 在全局作用域暴露为 TurndownService
// 需要在 manifest.json 中先加载 turndown.js

/**
 * 将HTML转换为Markdown
 * @param {string} html - HTML字符串
 * @returns {string} Markdown字符串
 */
function htmlToMarkdown(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    // 检查 TurndownService 是否可用
    if (typeof TurndownService === 'undefined') {
      console.error('TurndownService 未加载，请检查 manifest.json');
      return html; // 降级：返回原HTML
    }

    // 创建转换器实例
    const turndownService = new TurndownService({
      // 使用围栏式代码块（```）而不是缩进式
      codeBlockStyle: 'fenced',
      // 使用 ATX 风格的标题（# 标题）而不是 setext
      headingStyle: 'atx',
      // 列表项前面加空格
      bulletListMarker: '-',
      // 使用 * 作为分隔线
      hr: '---',
      // 保留换行
      br: '\n'
    });

    // 自定义规则：处理代码块的语言标识
    turndownService.addRule('fencedCodeBlock', {
      filter: function (node) {
        return node.nodeName === 'PRE' && node.firstChild && node.firstChild.nodeName === 'CODE';
      },
      replacement: function (content, node) {
        const code = node.firstChild;
        let language = '';

        // 尝试从 class 属性提取语言
        if (code.className) {
          const match = code.className.match(/language-(\w+)/);
          if (match) {
            language = match[1];
          }
        }

        return '\n```' + language + '\n' + code.textContent + '\n```\n';
      }
    });

    // 转换
    const markdown = turndownService.turndown(html);

    return markdown;

  } catch (error) {
    console.error('HTML→Markdown 转换失败:', error);
    return html; // 降级：返回原HTML
  }
}

// 导出到全局（供其他模块调用）
if (typeof window !== 'undefined') {
  window.htmlToMarkdown = htmlToMarkdown;
}

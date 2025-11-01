/**
 * Gemini平台适配器
 * 封装Gemini平台特定的DOM查找和验证逻辑
 */

class GeminiAdapter extends PlatformAdapter {
  constructor() {
    super();
    this.platformName = 'gemini';
  }

  /**
   * 检测是否为Gemini平台
   * @returns {boolean}
   */
  detectPlatform() {
    return window.location.hostname === 'gemini.google.com';
  }

  /**
   * 查找AI回复容器元素
   * @returns {Element[]}
   */
  findResponseContainers() {
    // 基于真实DOM结构的精确选择器
    const markdownContainers = document.querySelectorAll('.markdown.markdown-main-panel');
    
    // 过滤出真正的AI回复容器
    const validContainers = Array.from(markdownContainers).filter(container => {
      const hasCorrectId = container.id && container.id.includes('model-response-message-content');
      const hasMessageContent = !!container.closest('message-content');
      const hasResponseContent = !!container.closest('.response-content');
      const hasModelResponse = !!container.closest('model-response');
      
      return hasCorrectId && hasMessageContent && hasResponseContent && hasModelResponse;
    });
    
    return validContainers;
  }

  /**
   * 查找复制按钮元素
   * @returns {Element[]}
   */
  findCopyButtons() {
    // 基于真实DOM结构：在message-actions中查找copy-button
    const copyButtons = document.querySelectorAll('copy-button button[data-test-id="copy-button"]');
    
    // 验证按钮是否在正确的AI回复结构中
    const validButtons = Array.from(copyButtons).filter(button => {
      // 检查按钮是否在message-actions中
      const isInMessageActions = button.closest('message-actions');
      
      // 检查是否在response-container-footer中
      const isInFooter = button.closest('.response-container-footer');
      
      // 检查是否关联到AI回复
      const isInModelResponse = button.closest('model-response');
      
      return isInMessageActions && isInFooter && isInModelResponse;
    });
    
    return validButtons;
  }

  /**
   * 验证容器是否为有效的AI回复容器
   * @param {Element} element
   * @returns {boolean}
   */
  isValidResponseContainer(element) {
    if (!element || !element.classList) {
      return false;
    }
    
    // 基于真实DOM结构的精确验证
    // 目标：验证是否为 .markdown.markdown-main-panel 且在正确的层次结构中
    const classList = element.classList;
    
    // 必须有markdown类
    const hasMarkdownClass = classList.contains('markdown') && 
                             classList.contains('markdown-main-panel');
    
    // 必须有正确的ID模式
    const elementId = element.id || '';
    const hasCorrectId = elementId.includes('model-response-message-content');
    
    // 必须在正确的父容器层次中
    const hasCorrectStructure = element.closest('message-content') && 
                                element.closest('.response-content') &&  // 使用class选择器
                                element.closest('model-response');
    
    return hasMarkdownClass && hasCorrectId && hasCorrectStructure;
  }

  /**
   * 获取复制按钮对应的消息容器
   * @param {Element} button - AI回复的复制按钮（已由findCopyButtons验证）
   * @returns {Element|null}
   *
   * 设计原则：
   * - findCopyButtons() 已经验证了按钮是AI回复的，这里不需要再验证
   * - 只需要找到包含 AI 回复内容的容器即可
   */
  getCopyButtonContainer(button) {
    if (!button) {
      return null;
    }

    // 策略：向上找到 model-response 元素，然后在其中找 markdown 容器
    const modelResponse = button.closest('model-response');

    if (!modelResponse) {
      return null;
    }

    // 在 model-response 中查找 markdown 容器
    const markdownContainer = modelResponse.querySelector('.markdown.markdown-main-panel');

    if (markdownContainer) {
      return markdownContainer;
    }

    // 如果没找到精确的 markdown 容器，退而求其次返回 model-response
    return modelResponse;
  }

  /**
   * 私有方法：判断是否为AI回复的复制按钮
   * @param {Element} button
   * @returns {boolean}
   * @private
   */
  _isAICopyButton(button) {
    const isAICopyButton = (
      button.getAttribute('data-test-id') === 'copy-button' ||
      button.closest('copy-button') ||
      (button.querySelector('mat-icon[fonticon="content_copy"]') &&
       this.getCopyButtonContainer(button))
    );

    return isAICopyButton;
  }

  /**
   * 🆕 查找用户消息容器
   * @returns {Element[]} 所有用户输入的消息容器，按DOM顺序排列
   */
  findUserMessages() {
    const userMessages = Array.from(document.querySelectorAll('user-query'));
    console.log(`GeminiAdapter: found ${userMessages.length} user messages`);
    return userMessages;
  }

  /**
   * 🆕 从容器提取内容
   * @param {Element} container - 消息容器元素
   * @returns {string} 清理后的纯文本内容
   */
  extractText(container) {
    if (!container) {
      return '';
    }

    // 判断是用户消息还是AI回复
    const tagName = container.tagName.toLowerCase();

    if (tagName === 'user-query') {
      // 用户消息：提取 .query-text 的文本
      const textElement = container.querySelector('.query-text');
      return textElement ? textElement.textContent.trim() : '';
    } else {
      // AI回复：查找 message-content 容器
      const messageContent = container.querySelector('message-content .markdown');
      if (messageContent) {
        // 克隆节点以便处理
        const cloned = messageContent.cloneNode(true);

        // 移除不需要的元素（引用按钮、图标等）
        const unwantedSelectors = [
          'source-footnote',
          'sources-carousel-inline',
          '.source-inline-chip',
          'mat-icon',
          'button'
        ];
        unwantedSelectors.forEach(selector => {
          cloned.querySelectorAll(selector).forEach(el => el.remove());
        });

        // 提取文本并清理引用标记
        const text = cloned.textContent || cloned.innerText || '';
        return this._cleanGeminiCitations(text);
      }

      // 降级：直接使用容器的textContent
      const textContent = container.textContent || container.innerText || '';
      return this._cleanGeminiCitations(textContent);
    }
  }

  /**
   * 🆕 获取平台显示名称
   * @returns {string} 平台名称
   */
  getPlatformDisplayName() {
    return 'Gemini';
  }

  /**
   * 私有方法：清理Gemini的引用标记
   * @param {string} text
   * @returns {string}
   * @private
   */
  _cleanGeminiCitations(text) {
    if (!text) return text;

    // 删除 [cite_start] 标记
    let cleaned = text.replace(/\[cite_start\]/g, '');

    // 删除 [cite: X] 或 [cite: X, Y, Z] 标记
    cleaned = cleaned.replace(/\[cite:\s*[\d,\s]+\]/g, '');

    // 只清理连续的空格（不包括换行符）
    cleaned = cleaned.replace(/ {2,}/g, ' ');

    return cleaned;
  }

  /**
   * 测试适配器方法并输出统计信息
   */
  testAdapterMethods() {
    const containers = this.findResponseContainers();
    const copyButtons = this.findCopyButtons();

    return {
      containers: containers.length,
      copyButtons: copyButtons.length
    };
  }
}

// 导出适配器
if (typeof window !== 'undefined') {
  window.GeminiAdapter = GeminiAdapter;
  
  // 智能延迟测试适配器（确保页面基础DOM加载完成）
  if (window.location.hostname === 'gemini.google.com') {
    const adapter = new GeminiAdapter();
    
    // 等待页面基础结构加载完成再测试（最多等待10秒）
    let attempts = 0;
    const maxAttempts = 5;
    
    function waitAndTest() {
      attempts++;
      
      // 检查页面基础结构是否加载（不管有没有AI回复）
      const hasBasicStructure = document.querySelector('main') || 
                               document.querySelector('[role="main"]') ||
                               document.querySelector('.chat-container') ||
                               document.body.children.length > 5;
      
      if (hasBasicStructure || attempts >= maxAttempts) {
        // 页面基础结构已加载，输出适配器测试结果
        adapter.testAdapterMethods();
      } else {
        // 页面还在加载基础结构，继续等待
        setTimeout(waitAndTest, 2000);
      }
    }
    
    // 初始延迟3秒后开始检测
    setTimeout(waitAndTest, 3000);
  }
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = GeminiAdapter;
}
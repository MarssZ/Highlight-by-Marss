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
    const allPossibleContainers = [];
    
    // 查找所有可能的候选容器
    const candidates = [
      ...document.querySelectorAll('.markdown.markdown-main-panel'),
      ...document.querySelectorAll('[id*="model-response-message-content"]'),
      ...document.querySelectorAll('.model-response, .response-content'),
      ...document.querySelectorAll('[class*="model-response"], [class*="response-content"]')
    ];
    
    // 使用严格的验证逻辑过滤候选容器
    const validContainers = candidates.filter(container => 
      this.isValidResponseContainer(container)
    );
    
    // 去重
    return [...new Set(validContainers)];
  }

  /**
   * 查找复制按钮元素
   * @returns {Element[]}
   */
  findCopyButtons() {
    const selectors = [
      'button[data-test-id="copy-button"]',
      'copy-button button',
      'button:has(mat-icon[fonticon="content_copy"])',
    ];
    
    let foundButtons = [];
    
    selectors.forEach(selector => {
      try {
        const buttons = document.querySelectorAll(selector);
        foundButtons.push(...buttons);
      } catch (error) {
        // 某些浏览器可能不支持:has选择器
        console.warn(`Selector ${selector} not supported:`, error.message);
      }
    });
    
    // 去重并过滤AI回复的复制按钮
    const uniqueButtons = [...new Set(foundButtons)];
    return uniqueButtons.filter(button => this._isAICopyButton(button));
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
    
    const classList = element.classList;
    
    // 检查class包含AI回复的标识
    const hasMarkdownClass = classList.contains('markdown') && 
                             classList.contains('markdown-main-panel');
    
    // 检查id是否符合AI回复消息的模式
    const elementId = element.id || '';
    const hasAIResponseId = elementId.includes('model-response-message-content');
    
    // 检查其他可能的AI回复容器标识
    const hasResponseClass = classList.contains('model-response') ||
                             classList.contains('response-content') ||
                             element.closest('[class*="model-response"]') ||
                             element.closest('[class*="response-content"]');
    
    return hasMarkdownClass || hasAIResponseId || hasResponseClass;
  }

  /**
   * 获取复制按钮对应的消息容器
   * @param {Element} button
   * @returns {Element|null}
   */
  getCopyButtonContainer(button) {
    if (!button) return null;
    
    // 向上查找消息容器
    let container = button.parentElement;
    while (container && container !== document.body) {
      if (this.isValidResponseContainer(container)) {
        return container;
      }
      container = container.parentElement;
    }
    
    return null;
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
   * 测试适配器方法并输出统计信息
   */
  testAdapterMethods() {
    const containers = this.findResponseContainers();
    const copyButtons = this.findCopyButtons();
    
    console.log(`GeminiAdapter loaded: detected ${window.location.hostname}`);
    console.log(`Found ${containers.length} valid AI response containers`);
    console.log(`Found ${copyButtons.length} copy buttons`);
    
    // 调试信息：显示找到的容器类型
    if (containers.length > 0) {
      containers.forEach((container, index) => {
        const classes = container.className || 'no-class';
        const id = container.id || 'no-id';
        console.log(`  Container ${index + 1}: classes="${classes}", id="${id}"`);
      });
    }
    
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
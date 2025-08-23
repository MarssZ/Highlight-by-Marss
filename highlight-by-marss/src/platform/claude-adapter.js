/**
 * Claude平台适配器
 * 封装Claude平台特定的DOM查找和验证逻辑
 */

class ClaudeAdapter extends PlatformAdapter {
  constructor() {
    super();
    this.platformName = 'claude';
  }

  /**
   * 检测是否为Claude平台
   * @returns {boolean}
   */
  detectPlatform() {
    return window.location.hostname === 'claude.ai';
  }

  /**
   * 查找AI回复容器元素
   * @returns {Element[]}
   */
  findResponseContainers() {
    // 基于真实DOM结构：.font-claude-response 是Claude AI回复的核心标识
    const claudeResponseContainers = document.querySelectorAll('.font-claude-response');
    
    // 过滤出有效的AI回复容器
    const validContainers = Array.from(claudeResponseContainers).filter(container => {
      // 检查是否在正确的group结构中
      const hasGroupParent = container.closest('.group.relative');
      
      // 检查是否包含实际内容
      const hasContent = container.querySelector('p, div[class*="grid"]') && 
                        container.textContent && 
                        container.textContent.trim().length > 0;
      
      return hasGroupParent && hasContent;
    });
    
    return validContainers;
  }

  /**
   * 查找复制按钮元素
   * @returns {Element[]}
   */
  findCopyButtons() {
    // 基于真实DOM结构：data-testid="action-bar-copy" 是最精确的复制按钮标识
    const copyButtons = document.querySelectorAll('button[data-testid="action-bar-copy"]');
    
    // 过滤出与AI回复相关的复制按钮
    const validButtons = Array.from(copyButtons).filter(button => {
      // 检查按钮是否在.group容器中（AI回复的父容器）
      const isInGroupContainer = button.closest('.group.relative');
      
      // 检查是否在操作栏中（opacity-0 group-hover:opacity-100）
      const isInActionBar = button.closest('.group-hover\\:opacity-100') || 
                           button.closest('[class*="group-hover:opacity-100"]');
      
      return isInGroupContainer && (isInActionBar || true); // 放宽限制，主要依靠group容器
    });
    
    return validButtons;
  }

  /**
   * 验证容器是否为有效的AI回复容器
   * @param {Element} element
   * @returns {boolean}
   */
  isValidResponseContainer(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }
    
    // 基于真实DOM结构验证
    // 检查是否为 .font-claude-response 容器
    const isClaudeResponseContainer = element.classList.contains('font-claude-response');
    
    // 检查是否在正确的group结构中
    const hasGroupParent = element.closest('.group.relative');
    
    // 检查是否包含实际内容
    const hasContent = element.textContent && element.textContent.trim().length > 0;
    
    // 检查内容结构（应该包含文本内容的网格布局）
    const hasContentStructure = element.querySelector('p, div[class*="grid"]');
    
    return isClaudeResponseContainer && hasGroupParent && hasContent && hasContentStructure;
  }

  /**
   * 获取复制按钮对应的消息容器
   * @param {Element} button
   * @returns {Element|null}
   */
  getCopyButtonContainer(button) {
    if (!button) return null;
    
    // 基于DOM结构：复制按钮在.group容器中，AI回复也在同一个.group容器中
    const groupContainer = button.closest('.group.relative');
    if (!groupContainer) return null;
    
    // 在group容器中查找 .font-claude-response
    const claudeResponseContainer = groupContainer.querySelector('.font-claude-response');
    
    if (claudeResponseContainer && this.isValidResponseContainer(claudeResponseContainer)) {
      return claudeResponseContainer;
    }
    
    return null;
  }

  /**
   * 测试适配器方法并输出统计信息
   */
  testAdapterMethods() {
    const containers = this.findResponseContainers();
    const copyButtons = this.findCopyButtons();
    
    console.log(`ClaudeAdapter loaded: detected ${window.location.hostname}`);
    console.log(`Found ${containers.length} AI response containers, ${copyButtons.length} copy buttons`);
    
    return {
      containers: containers.length,
      copyButtons: copyButtons.length
    };
  }
}

// 导出适配器
if (typeof window !== 'undefined') {
  window.ClaudeAdapter = ClaudeAdapter;
  
  // 智能延迟测试适配器（确保页面基础DOM加载完成）
  if (window.location.hostname === 'claude.ai') {
    const adapter = new ClaudeAdapter();
    
    // 等待页面基础结构加载完成再测试（最多等待10秒）
    let attempts = 0;
    const maxAttempts = 5;
    
    function waitAndTest() {
      attempts++;
      
      // 检查页面基础结构是否加载（不管有没有AI回复）
      const hasBasicStructure = document.querySelector('main') || 
                               document.querySelector('[role="main"]') ||
                               document.querySelector('.chat-container') ||
                               document.querySelector('[class*="conversation"]') ||
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
  module.exports = ClaudeAdapter;
}
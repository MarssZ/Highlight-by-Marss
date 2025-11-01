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
   * 清理克隆容器中的Gemini引用标记
   * @param {Element} clonedContainer 克隆的容器元素
   * @returns {void}
   *
   * 清理目标：
   * 1. <source-footnote> - 上标引用数字（如 35, 36）
   * 2. <sources-carousel-inline> - 末尾的引用链接芯片
   */
  cleanClonedContainer(clonedContainer) {
    if (!clonedContainer) {
      console.warn('🔴 [Gemini] cleanClonedContainer: 容器为空');
      return;
    }

    console.log('🔧 [Gemini] 开始清理克隆容器的引用标记...');

    // 删除所有上标引用标记
    const footnotes = clonedContainer.querySelectorAll('source-footnote');
    console.log(`📊 [Gemini] 找到 ${footnotes.length} 个 <source-footnote> 元素`);
    if (footnotes.length > 0) {
      footnotes.forEach((footnote, index) => {
        const text = footnote.textContent.trim();
        console.log(`  - footnote[${index}]: "${text}"`);
        footnote.remove();
      });
    }

    // 删除末尾的引用链接芯片
    const carousels = clonedContainer.querySelectorAll('sources-carousel-inline');
    console.log(`📊 [Gemini] 找到 ${carousels.length} 个 <sources-carousel-inline> 元素`);
    if (carousels.length > 0) {
      carousels.forEach(carousel => carousel.remove());
    }

    console.log('✅ [Gemini] 引用标记清理完成');
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
    console.log(`Found ${containers.length} AI response containers, ${copyButtons.length} copy buttons`);
    
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
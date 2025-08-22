// AI Highlight Assistant - Copy Enhancer
// 增强Gemini现有复制按钮功能

console.log('Copy Enhancer loaded');

// 复制按钮监听器
let copyButtonObserver = null;

// 初始化复制增强功能
function initCopyEnhancer() {
  console.log('Initializing copy enhancer');
  
  // 查找现有的复制按钮
  findAndSetupCopyButtons();
  
  // 监听页面动态变化，处理新出现的AI回复
  setupDynamicObserver();
}

// 查找并设置复制按钮
function findAndSetupCopyButtons() {
  // 精确选择器
  const selectors = [
    'button[data-test-id="copy-button"]',
    'copy-button button',
    'button:has(mat-icon[fonticon="content_copy"])',
  ];
  
  let foundButtons = [];
  
  // 查找所有复制按钮
  selectors.forEach(selector => {
    try {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => {
        if (!button.hasAttribute('data-ai-highlight-enhanced')) {
          foundButtons.push(button);
        }
      });
    } catch (error) {
      // 某些浏览器可能不支持:has选择器
    }
  });
  
  // 过滤AI回复的复制按钮
  const copyButtons = foundButtons.filter(button => {
    const isAICopyButton = (
      button.getAttribute('data-test-id') === 'copy-button' ||
      button.closest('copy-button') ||
      button.querySelector('mat-icon[fonticon="content_copy"]')
    );
    
    const isInButtonsContainer = button.closest('.buttons-container-v2');
    return isAICopyButton && isInButtonsContainer;
  });
  
  // 设置监听器
  if (copyButtons.length > 0) {
    console.log(`Found ${copyButtons.length} AI copy buttons, setting up listeners`);
    copyButtons.forEach(button => {
      setupCopyButtonListener(button);
    });
  }
  
  return copyButtons;
}

// 查找mat-icon的按钮父容器
function findButtonParent(icon) {
  let parent = icon.parentElement;
  
  // 向上查找，最多5层
  for (let i = 0; i < 5 && parent; i++) {
    if (parent.tagName.toLowerCase() === 'button' || 
        parent.getAttribute('role') === 'button' ||
        parent.classList.contains('button') ||
        parent.hasAttribute('ng-click') ||
        parent.hasAttribute('(click)')) {
      return parent;
    }
    parent = parent.parentElement;
  }
  
  return null;
}

// 验证是否是有效的复制按钮
function isValidCopyButton(button) {
  // 检查按钮是否在对话容器内
  const messageContainer = button.closest('[data-message-author-role], .message, .conversation-turn, [class*="message"], [class*="response"], [class*="turn"]');
  
  if (!messageContainer) {
    return false;
  }
  
  // 检查按钮文本或属性是否包含复制相关关键词
  const buttonText = button.textContent.toLowerCase();
  const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
  const title = (button.getAttribute('title') || '').toLowerCase();
  
  const copyKeywords = ['copy', 'копировать', '复制', 'コピー', 'copiar'];
  const hasCopyKeyword = copyKeywords.some(keyword => 
    buttonText.includes(keyword) || ariaLabel.includes(keyword) || title.includes(keyword)
  );
  
  return hasCopyKeyword;
}

// 为复制按钮设置监听器
function setupCopyButtonListener(button) {
  // 标记已处理
  button.setAttribute('data-ai-highlight-enhanced', 'true');
  
  // 监听点击事件
  button.addEventListener('click', function(event) {
    console.log('🔥 Copy button clicked');
    
    // 延迟处理，让原始复制操作先完成
    setTimeout(() => {
      handleCopyButtonClick(button, event);
    }, 50);
  }, true);
}

// 处理复制按钮点击
function handleCopyButtonClick(button, event) {
  try {
    // 查找对应的AI回复容器
    const messageContainer = findMessageContainer(button);
    
    if (!messageContainer) {
      console.log('No message container found');
      return;
    }
    
    console.log('Message container:', messageContainer);
    
    // 检查是否包含高亮内容
    const hasHighlights = checkForHighlights(messageContainer);
    
    if (hasHighlights) {
      console.log('Message contains highlights, will enhance copy');
      // TODO: 在步骤7中实现增强复制逻辑
    } else {
      console.log('Message has no highlights, using default copy');
    }
    
  } catch (error) {
    console.log('Error handling copy button click:', error);
  }
}

// 查找消息容器
function findMessageContainer(button) {
  // 尝试不同的容器选择器
  const containerSelectors = [
    '[data-message-author-role]',
    '.message',
    '.conversation-turn', 
    '[class*="message"]',
    '[class*="response"]',
    '[class*="turn"]',
    '[class*="chat"]'
  ];
  
  for (const selector of containerSelectors) {
    const container = button.closest(selector);
    if (container) {
      return container;
    }
  }
  
  // 如果没找到，尝试向上查找包含大量文本的父元素
  let parent = button.parentElement;
  while (parent && parent !== document.body) {
    if (parent.textContent.length > 50) { // 假设AI回复至少50个字符
      return parent;
    }
    parent = parent.parentElement;
  }
  
  return null;
}

// 检查容器是否包含高亮内容
function checkForHighlights(container) {
  // 检查CSS.highlights API的高亮
  if (window.highlights && window.highlights.size > 0) {
    // 检查高亮范围是否在当前容器内
    for (const [id, highlightData] of window.highlights) {
      if (isRangeInContainer(highlightData.range, container)) {
        return true;
      }
    }
  }
  
  // 检查传统DOM高亮
  const fallbackHighlights = container.querySelectorAll('.ai-highlight-fallback');
  return fallbackHighlights.length > 0;
}

// 检查范围是否在容器内
function isRangeInContainer(range, container) {
  try {
    return container.contains(range.commonAncestorContainer);
  } catch (error) {
    return false;
  }
}

// 设置动态观察器，监听新添加的内容
function setupDynamicObserver() {
  copyButtonObserver = new MutationObserver(function(mutations) {
    let shouldCheckButtons = false;
    
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // 检查是否有新的元素添加
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // 元素节点
            shouldCheckButtons = true;
          }
        });
      }
    });
    
    if (shouldCheckButtons) {
      // 延迟查找新的复制按钮
      setTimeout(findAndSetupCopyButtons, 500);
    }
  });
  
  // 开始观察
  copyButtonObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('Dynamic observer setup complete');
}

// 获取元素所有属性的辅助函数
function getElementAttributes(element) {
  const attrs = {};
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    attrs[attr.name] = attr.value;
  }
  return attrs;
}

// 导出函数供主脚本调用
window.copyEnhancer = {
  init: initCopyEnhancer,
  findButtons: findAndSetupCopyButtons
};
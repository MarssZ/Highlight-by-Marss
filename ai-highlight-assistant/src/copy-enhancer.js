// AI Highlight Assistant - Copy Enhancer
// 增强现有复制按钮功能，使用平台适配器


// 复制按钮监听器
let copyButtonObserver = null;
let platformAdapter = null;

// 初始化复制增强功能
function initCopyEnhancer() {
  // 初始化平台适配器
  if (!initPlatformAdapter()) {
    console.warn('⚠️ Platform adapter not available, using fallback logic');
  }
  
  // 查找现有的复制按钮
  findAndSetupCopyButtons();
  
  // 监听页面动态变化，处理新出现的AI回复
  setupDynamicObserver();
}

// 初始化平台适配器
function initPlatformAdapter() {
  if (window.GeminiAdapter) {
    try {
      platformAdapter = new window.GeminiAdapter();
      if (platformAdapter.detectPlatform()) {
        console.log('✅ Platform adapter initialized:', platformAdapter.getPlatformName());
        return true;
      }
    } catch (error) {
      console.warn('Error initializing platform adapter:', error);
    }
  }
  return false;
}

// 查找并设置复制按钮
function findAndSetupCopyButtons() {
  let copyButtons = [];
  
  if (platformAdapter) {
    // 使用平台适配器查找复制按钮
    try {
      copyButtons = platformAdapter.findCopyButtons().filter(button => 
        !button.hasAttribute('data-ai-highlight-enhanced')
      );
      // Platform adapter found copy buttons
    } catch (error) {
      console.warn('Error using platform adapter for copy buttons:', error);
      copyButtons = findCopyButtonsFallback();
    }
  } else {
    // 降级到原有逻辑
    copyButtons = findCopyButtonsFallback();
  }
  
  // 设置监听器
  if (copyButtons.length > 0) {
    copyButtons.forEach(button => {
      setupCopyButtonListener(button);
    });
  }
  
  return copyButtons;
}

// 降级方案：原有的复制按钮查找逻辑
function findCopyButtonsFallback() {
  // Using fallback copy button detection
  
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
    // Copy button clicked
    
    // 延迟处理，让原始复制操作先完成
    setTimeout(() => {
      handleCopyButtonClick(button, event);
    }, 200); // 增加延迟确保原始复制完成
  }, true);
}

// 处理复制按钮点击
function handleCopyButtonClick(button, event) {
  try {
    // 查找对应的AI回复容器
    const messageContainer = findMessageContainer(button);
    
    if (!messageContainer) {
      // No message container found
      return;
    }
    
    // 检查是否包含高亮内容
    const hasHighlights = checkForHighlights(messageContainer);
    
    if (hasHighlights) {
      // Message contains highlights, generating enhanced copy content
      
      // 🆕 生成带高亮和评论标签的内容
      const enhancedContent = generateHighlightedText(messageContainer);
      
      if (enhancedContent) {
        // Generated enhanced content
        
        // 覆写剪贴板内容
        copyToClipboard(enhancedContent);
        console.log('✅ Enhanced content copied with highlights and comments');
      } else {
        console.warn('⚠️ Failed to generate enhanced content');
      }
    } else {
      // Message has no highlights, using default copy
    }
    
  } catch (error) {
    console.log('Error handling copy button click:', error);
  }
}

// 查找消息容器
function findMessageContainer(button) {
  if (platformAdapter) {
    // 使用平台适配器查找消息容器
    try {
      const container = platformAdapter.getCopyButtonContainer(button);
      if (container) {
        // Platform adapter found message container
        return container;
      }
    } catch (error) {
      console.warn('Error using platform adapter for message container:', error);
    }
  }
  
  // 降级到原有逻辑
  return findMessageContainerFallback(button);
}

// 降级方案：原有的消息容器查找逻辑
function findMessageContainerFallback(button) {
  // Using fallback message container detection
  
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
  
  // Dynamic observer setup complete
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

// 🆕 生成带高亮和评论标签的文本内容
function generateHighlightedText(container) {
  try {
    // 克隆容器以避免修改原DOM
    const clonedContainer = container.cloneNode(true);
    
    // 处理DOM高亮 (.ai-highlight-fallback)
    const fallbackHighlights = clonedContainer.querySelectorAll('.ai-highlight-fallback');
    fallbackHighlights.forEach(highlight => {
      const text = highlight.textContent;
      const highlightTag = document.createElement('highlight-marker');
      highlightTag.textContent = text;
      highlight.parentNode.replaceChild(highlightTag, highlight);
    });
    
    // 提取纯文本并替换标记为<highlight>标签
    let textContent = clonedContainer.textContent || clonedContainer.innerText || '';
    textContent = textContent.replace(/\s+/g, ' ').trim(); // 清理空格
    
    // 🆕 处理CSS.highlights高亮，包含评论信息
    if (window.highlights && window.highlights.size > 0) {
      // Processing highlights with comments
      
      // 按文本长度排序，避免短文本替换影响长文本
      const sortedHighlights = Array.from(window.highlights.entries())
        .filter(([id, highlightData]) => isRangeInContainer(highlightData.range, container))
        .sort(([,a], [,b]) => b.text.length - a.text.length);
      
      for (const [id, highlightData] of sortedHighlights) {
        const highlightText = highlightData.text.trim();
        if (highlightText && textContent.includes(highlightText)) {
          // 🆕 获取关联的评论数据
          const commentData = window.highlightComments ? window.highlightComments.get(id) : null;
          const hasComment = commentData && commentData.hasComment && commentData.comment.trim();
          
          let replacementTag;
          if (hasComment) {
            // 有评论：生成带comment属性的标签
            const escapedComment = escapeXMLAttribute(commentData.comment.trim());
            replacementTag = `<highlight comment="${escapedComment}">${highlightText}</highlight>`;
            // Generated highlight with comment
          } else {
            // 无评论：生成普通标签
            replacementTag = `<highlight>${highlightText}</highlight>`;
            // Generated highlight without comment
          }
          
          // 替换文本（只替换第一个匹配项，避免重复）
          textContent = textContent.replace(
            new RegExp(escapeRegExp(highlightText)), 
            replacementTag
          );
        }
      }
    }
    
    // Final enhanced content generated
    return textContent;
    
  } catch (error) {
    console.log('Error generating highlighted text:', error);
    return null;
  }
}

// 在克隆容器中标记文本（用于CSS高亮）
function markTextInClonedContainer(container, text) {
  // 简化实现：直接在文本内容中查找并不做DOM操作
  // 实际的标记会在generateHighlightedText中进行
}

// 转义正则表达式特殊字符
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 🆕 转义XML属性中的特殊字符
function escapeXMLAttribute(string) {
  return string
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\t/g, ' ');
}

// 复制到剪贴板
function copyToClipboard(text) {
  try {
    // 优先使用 navigator.clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        // Text copied using navigator.clipboard
      }).catch(error => {
        console.warn('⚠️ Navigator.clipboard failed, trying fallback');
        fallbackCopyToClipboard(text);
      });
    } else {
      // 降级到传统方法
      fallbackCopyToClipboard(text);
    }
  } catch (error) {
    console.log('Error copying to clipboard:', error);
    fallbackCopyToClipboard(text);
  }
}

// 传统复制方法
function fallbackCopyToClipboard(text) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    // Text copied using fallback method
  } catch (error) {
    console.error('❌ All copy methods failed:', error);
  }
}

// 导出函数供主脚本调用
window.copyEnhancer = {
  init: initCopyEnhancer,
  findButtons: findAndSetupCopyButtons
};
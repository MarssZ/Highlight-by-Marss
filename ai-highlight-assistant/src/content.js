// AI Highlight Assistant - Content Script
console.log('AI Highlight Assistant loaded');

// 存储所有高亮范围
let highlights = new Map();
let highlightCounter = 0;

// 🆕 存储评论数据
let highlightComments = new Map();

// 🆕 防止误触评论的状态标记
let justHighlighted = false;

// 检查浏览器是否支持 CSS.highlights
const supportsHighlights = 'highlights' in CSS;
console.log('CSS.highlights support:', supportsHighlights);

// 初始化扩展
function initExtension() {
  console.log('AI Highlight Assistant initialized on Gemini page');
  
  // 确认页面是 Gemini
  if (window.location.hostname === 'gemini.google.com') {
    console.log('Gemini platform detected');
    
    // 设置文本选择监听
    setupTextSelection();
    
    // 初始化CSS高亮注册表
    if (supportsHighlights) {
      CSS.highlights.set('ai-highlights', new Highlight());
      console.log('CSS.highlights initialized');
      
      // 将highlights和评论数据暴露给copy-enhancer使用
      window.highlights = highlights;
      window.highlightComments = highlightComments;
    }
    
    // 初始化复制增强功能
    console.log('Checking window.copyEnhancer:', !!window.copyEnhancer);
    if (window.copyEnhancer) {
      console.log('copyEnhancer found, calling init in 1 second');
      setTimeout(() => {
        window.copyEnhancer.init();
      }, 1000); // 延迟1秒确保页面加载完成
    } else {
      console.log('copyEnhancer not found, will retry');
      // 如果没找到，继续重试
      setTimeout(() => {
        console.log('Retry: checking window.copyEnhancer:', !!window.copyEnhancer);
        if (window.copyEnhancer) {
          window.copyEnhancer.init();
        }
      }, 2000);
    }
    
    // 🆕 初始化评论指示器系统
    setTimeout(() => {
      if (window.commentManager && window.commentManager.init) {
        window.commentManager.init();
        console.log('Comment indicators initialized');
      }
    }, 2000);
  }
}

// 监听文本选择事件
function setupTextSelection() {
  console.log('Setting up text selection listener');
  
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('keyup', handleTextSelection); // 处理键盘选择
  
  // 添加点击事件监听器用于移除高亮和添加评论
  document.addEventListener('click', handleHighlightClick);
}

// 处理文本选择
function handleTextSelection(event) {
  const selection = window.getSelection();
  
  if (selection.rangeCount > 0 && selection.toString().trim().length > 0) {
    const selectedText = selection.toString().trim();
    
    // 检查选择是否在AI回复区域内
    if (!isSelectionInAIResponse(selection)) {
      console.log('Selection outside AI response area, ignoring');
      return;
    }
    
    console.log('Text selected in AI response:', selectedText);
    
    // 立即应用高亮效果
    if (supportsHighlights) {
      applyHighlightCSS(selection);
    } else {
      // 回退到传统方法
      applyHighlightFallback(selection);
    }
  }
}

// 检查选择是否在AI回复区域内
function isSelectionInAIResponse(selection) {
  try {
    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    
    // 从选择的公共祖先开始，向上查找AI回复容器
    let element = commonAncestor.nodeType === Node.TEXT_NODE ? 
                  commonAncestor.parentElement : commonAncestor;
    
    while (element && element !== document.body) {
      // 检查是否是AI回复的主要容器
      if (isAIResponseContainer(element)) {
        return true;
      }
      element = element.parentElement;
    }
    
    return false;
  } catch (error) {
    console.log('Error checking selection area:', error);
    return false;
  }
}

// 判断元素是否是AI回复容器
function isAIResponseContainer(element) {
  if (!element || !element.classList) {
    return false;
  }
  
  // 检查class包含AI回复的标识
  const classList = element.classList;
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

// 使用CSS.highlights API应用高亮
function applyHighlightCSS(selection) {
  try {
    const range = selection.getRangeAt(0).cloneRange();
    const highlightId = ++highlightCounter;
    
    // 存储范围信息
    highlights.set(highlightId, {
      range: range,
      text: range.toString(),
      timestamp: Date.now()
    });
    
    // 🆕 初始化评论数据
    highlightComments.set(highlightId, {
      text: range.toString(),
      comment: '',
      hasComment: false,
      timestamp: Date.now()
    });
    
    // 添加到CSS高亮注册表
    const highlight = CSS.highlights.get('ai-highlights');
    highlight.add(range);
    
    console.log('CSS Highlight applied:', highlightId);
    
    // 🆕 标记刚刚完成高亮，防止误触评论
    justHighlighted = true;
    setTimeout(() => {
      justHighlighted = false;
    }, 300); // 300ms内的点击不触发评论
    
    // 清除选择
    selection.removeAllRanges();
    
  } catch (error) {
    console.log('Could not apply CSS highlight:', error.message);
  }
}

// 回退方法：使用传统DOM包装（简化版，只处理简单情况）
function applyHighlightFallback(selection) {
  try {
    const range = selection.getRangeAt(0);
    
    // 只处理简单的文本选择，跳过复杂情况
    if (range.startContainer.nodeType !== 3 || range.endContainer.nodeType !== 3 || 
        range.startContainer !== range.endContainer) {
      console.log('Skipping complex selection for fallback method');
      selection.removeAllRanges();
      return;
    }
    
    // 创建高亮元素
    const highlightSpan = document.createElement('span');
    highlightSpan.className = 'ai-highlight-fallback';
    highlightSpan.setAttribute('data-highlight-id', Date.now().toString());
    
    // 添加点击事件监听器
    highlightSpan.addEventListener('click', function(e) {
      e.stopPropagation();
      removeHighlightFallback(this);
    });
    
    // 包装选中的内容
    range.surroundContents(highlightSpan);
    
    console.log('Fallback highlight applied');
    
    // 清除选择
    selection.removeAllRanges();
    
  } catch (error) {
    console.log('Could not apply fallback highlight:', error.message);
  }
}

// 🆕 处理高亮点击（添加评论或移除高亮）
function handleHighlightClick(event) {
  if (supportsHighlights && highlights.size > 0) {
    const clickPoint = { x: event.clientX, y: event.clientY };
    
    // 检查点击位置是否在高亮范围内
    const highlightId = findHighlightAtPoint(clickPoint);
    
    if (highlightId) {
      if (event.ctrlKey) {
        // Ctrl+点击：移除高亮
        removeHighlightById(highlightId);
        event.preventDefault();
        event.stopPropagation();
      } else {
        // 🆕 防止误触：刚完成高亮时不触发评论
        if (justHighlighted) {
          console.log('刚完成高亮，跳过评论触发');
          return;
        }
        
        // 普通点击：添加评论
        const clickPosition = { x: event.clientX, y: event.clientY };
        showCommentInput(highlightId, clickPosition);
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }
}

// 🆕 查找点击位置的高亮ID
function findHighlightAtPoint(clickPoint) {
  for (const [id, highlightData] of highlights) {
    if (isPointInRange(clickPoint, highlightData.range)) {
      return id;
    }
  }
  return null;
}

// 🆕 通过ID移除高亮
function removeHighlightById(highlightId) {
  const highlightData = highlights.get(highlightId);
  if (highlightData) {
    // 移除CSS高亮
    const highlight = CSS.highlights.get('ai-highlights');
    highlight.delete(highlightData.range);
    highlights.delete(highlightId);
    
    // 🆕 移除关联的评论数据和指示器
    highlightComments.delete(highlightId);
    
    // 🆕 移除评论指示器
    if (window.commentManager && window.commentManager.removeIndicator) {
      window.commentManager.removeIndicator(highlightId);
    }
    
    console.log('CSS Highlight, comment and indicator removed:', highlightId);
    return true;
  }
  return false;
}

// 🆕 显示评论输入框（专业UI版本）
function showCommentInput(highlightId, clickPosition = null) {
  const commentData = highlightComments.get(highlightId);
  if (!commentData) {
    console.error('Comment data not found for highlight:', highlightId);
    return;
  }
  
  // 检查comment manager是否可用
  if (window.commentManager && window.commentManager.showCommentInput) {
    // 使用专业UI对话框
    window.commentManager.showCommentInput(highlightId, clickPosition || { x: 0, y: 0 });
  } else {
    // 降级到prompt方案
    console.log('Comment manager not available, using fallback prompt');
    showCommentInputFallback(highlightId);
  }
}

// 降级方案：使用prompt输入框
function showCommentInputFallback(highlightId) {
  const commentData = highlightComments.get(highlightId);
  if (!commentData) return;
  
  const currentComment = commentData.comment || '';
  const newComment = prompt(`为高亮文本添加评论：\n"${commentData.text}"`, currentComment);
  
  if (newComment === null) {
    console.log('Comment input cancelled');
    return;
  }
  
  // 更新评论数据
  commentData.comment = newComment.trim();
  commentData.hasComment = newComment.trim().length > 0;
  commentData.timestamp = Date.now();
  
  console.log('评论已保存 (fallback):', {
    highlightId: highlightId,
    text: commentData.text,
    comment: commentData.comment,
    hasComment: commentData.hasComment
  });
}

// 移除CSS高亮（通过点击坐标）- 保留为兼容性
function removeHighlightAtPoint(clickPoint) {
  const highlightId = findHighlightAtPoint(clickPoint);
  if (highlightId) {
    return removeHighlightById(highlightId);
  }
  return false;
}

// 检查点击位置是否在范围内
function isPointInRange(clickPoint, range) {
  try {
    // 获取范围的所有矩形区域
    const rects = range.getClientRects();
    
    for (const rect of rects) {
      if (clickPoint.x >= rect.left && clickPoint.x <= rect.right &&
          clickPoint.y >= rect.top && clickPoint.y <= rect.bottom) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.log('Error checking point in range:', error);
    return false;
  }
}

// 移除回退方法的高亮
function removeHighlightFallback(highlightElement) {
  const parent = highlightElement.parentNode;
  const textContent = highlightElement.textContent;
  
  // 用文本节点替换高亮元素
  const textNode = document.createTextNode(textContent);
  parent.replaceChild(textNode, highlightElement);
  
  console.log('Fallback highlight removed');
}

// 快捷键支持 - Ctrl+Z 撤销最后一个高亮
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'z') {
    if (supportsHighlights && highlights.size > 0) {
      // 移除最后一个CSS高亮和评论
      const lastId = Math.max(...highlights.keys());
      removeHighlightById(lastId);
      
      console.log('CSS Highlight and comment removed by Ctrl+Z:', lastId);
      e.preventDefault();
    } else {
      // 回退方法
      const fallbackHighlights = document.querySelectorAll('.ai-highlight-fallback');
      if (fallbackHighlights.length > 0) {
        const lastHighlight = fallbackHighlights[fallbackHighlights.length - 1];
        removeHighlightFallback(lastHighlight);
        e.preventDefault();
      }
    }
  }
});

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtension);
} else {
  initExtension();
}
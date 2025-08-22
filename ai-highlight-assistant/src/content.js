// AI Highlight Assistant - Content Script
console.log('AI Highlight Assistant loaded');

// 存储所有高亮范围
let highlights = new Map();
let highlightCounter = 0;

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
    }
  }
}

// 监听文本选择事件
function setupTextSelection() {
  console.log('Setting up text selection listener');
  
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('keyup', handleTextSelection); // 处理键盘选择
  
  // 添加点击事件监听器用于移除高亮
  document.addEventListener('click', handleCtrlClickRemoval);
}

// 处理文本选择
function handleTextSelection(event) {
  const selection = window.getSelection();
  
  if (selection.rangeCount > 0 && selection.toString().trim().length > 0) {
    const selectedText = selection.toString().trim();
    console.log('Text selected:', selectedText);
    
    // 立即应用高亮效果
    if (supportsHighlights) {
      applyHighlightCSS(selection);
    } else {
      // 回退到传统方法
      applyHighlightFallback(selection);
    }
  }
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
    
    // 添加到CSS高亮注册表
    const highlight = CSS.highlights.get('ai-highlights');
    highlight.add(range);
    
    console.log('CSS Highlight applied:', highlightId);
    
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

// 处理Ctrl+点击移除高亮
function handleCtrlClickRemoval(event) {
  // 只有按住Ctrl键时才处理
  if (!event.ctrlKey) {
    return;
  }
  
  if (supportsHighlights && highlights.size > 0) {
    // 检查点击位置是否在高亮范围内
    const clickPoint = { x: event.clientX, y: event.clientY };
    const removed = removeHighlightAtPoint(clickPoint);
    
    if (removed) {
      // 阻止默认行为
      event.preventDefault();
      event.stopPropagation();
    }
  }
}

// 移除CSS高亮（通过点击坐标）
function removeHighlightAtPoint(clickPoint) {
  // 遍历所有高亮范围，检查点击位置是否在其中
  for (const [id, highlightData] of highlights) {
    if (isPointInRange(clickPoint, highlightData.range)) {
      // 移除这个高亮
      const highlight = CSS.highlights.get('ai-highlights');
      highlight.delete(highlightData.range);
      highlights.delete(id);
      
      console.log('CSS Highlight removed by Ctrl+click:', id);
      return true; // 返回true表示成功移除
    }
  }
  return false; // 返回false表示没有找到高亮
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
      // 移除最后一个CSS高亮
      const lastId = Math.max(...highlights.keys());
      const highlightData = highlights.get(lastId);
      
      const highlight = CSS.highlights.get('ai-highlights');
      highlight.delete(highlightData.range);
      highlights.delete(lastId);
      
      console.log('CSS Highlight removed:', lastId);
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
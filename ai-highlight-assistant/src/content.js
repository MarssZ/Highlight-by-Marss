// AI Highlight Assistant - Content Script
console.log('AI Highlight Assistant loaded');

// 初始化扩展
function initExtension() {
  console.log('AI Highlight Assistant initialized on Gemini page');
  
  // 确认页面是 Gemini
  if (window.location.hostname === 'gemini.google.com') {
    console.log('Gemini platform detected');
    
    // 设置文本选择监听
    setupTextSelection();
  }
}

// 监听文本选择事件
function setupTextSelection() {
  console.log('Setting up text selection listener');
  
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('keyup', handleTextSelection); // 处理键盘选择
}

// 处理文本选择
function handleTextSelection(event) {
  const selection = window.getSelection();
  
  if (selection.rangeCount > 0 && selection.toString().trim().length > 0) {
    const selectedText = selection.toString().trim();
    console.log('Text selected:', selectedText);
    
    // 立即应用高亮效果
    applyHighlight(selection);
  }
}

// 应用高亮效果
function applyHighlight(selection) {
  try {
    const range = selection.getRangeAt(0);
    
    // 创建高亮元素
    const highlightSpan = document.createElement('span');
    highlightSpan.className = 'ai-highlight';
    
    // 包装选中的内容
    range.surroundContents(highlightSpan);
    
    console.log('Highlight applied');
    
    // 清除选择
    selection.removeAllRanges();
    
  } catch (error) {
    console.log('Could not apply highlight:', error.message);
  }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtension);
} else {
  initExtension();
}
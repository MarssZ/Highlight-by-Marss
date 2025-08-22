// AI Highlight Assistant - Comment Manager
// 管理评论功能的专业UI界面

console.log('Comment Manager loaded');

// 评论UI状态
let currentCommentDialog = null;
let currentHighlightId = null;

// 文本截断函数
function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  
  // 找到最接近maxLength的空格位置，避免截断单词
  let truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.7) { // 如果空格位置合理
    truncated = truncated.substring(0, lastSpace);
  }
  
  return truncated + '...';
}

// 创建评论输入对话框
function createCommentDialog(highlightId, highlightText, currentComment, position) {
  // 移除已存在的对话框
  removeCommentDialog();
  
  // 创建对话框容器
  const dialog = document.createElement('div');
  dialog.className = 'ai-comment-dialog';
  dialog.setAttribute('data-highlight-id', highlightId);
  
  // 对话框HTML结构
  dialog.innerHTML = `
    <div class="ai-comment-header">
      <span class="ai-comment-icon">🔖</span>
      <span class="ai-comment-title">${truncateText(highlightText, 35)}</span>
    </div>
    <div class="ai-comment-input-container">
      <textarea 
        class="ai-comment-input" 
        placeholder="输入你的评论..." 
        maxlength="500"
        rows="3"
      >${currentComment || ''}</textarea>
      <div class="ai-comment-char-count">
        <span class="ai-char-current">${(currentComment || '').length}</span>/500
      </div>
    </div>
    <div class="ai-comment-actions">
      <button class="ai-comment-cancel" type="button">取消</button>
      <button class="ai-comment-save" type="button">保存</button>
    </div>
  `;
  
  // 设置位置
  positionDialog(dialog, position);
  
  // 添加到页面
  document.body.appendChild(dialog);
  
  // 设置事件监听器
  setupDialogEvents(dialog, highlightId);
  
  // 焦点到输入框并选中文本
  const textarea = dialog.querySelector('.ai-comment-input');
  setTimeout(() => {
    textarea.focus();
    if (currentComment) {
      textarea.select();
    }
  }, 100);
  
  // 保存引用
  currentCommentDialog = dialog;
  currentHighlightId = highlightId;
  
  console.log('Comment dialog created for highlight:', highlightId);
}

// 定位对话框位置
function positionDialog(dialog, clickPosition) {
  // 基础样式
  dialog.style.position = 'fixed';
  dialog.style.zIndex = '10000';
  
  // 临时添加到页面以计算尺寸
  dialog.style.visibility = 'hidden';
  document.body.appendChild(dialog);
  
  const rect = dialog.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // 计算最佳位置
  let left = clickPosition.x - rect.width / 2;
  let top = clickPosition.y + 20; // 在点击位置下方20px
  
  // 边界检查和调整
  if (left + rect.width > viewportWidth - 20) {
    left = viewportWidth - rect.width - 20;
  }
  if (left < 20) {
    left = 20;
  }
  
  if (top + rect.height > viewportHeight - 20) {
    top = clickPosition.y - rect.height - 10; // 移到点击位置上方
  }
  if (top < 20) {
    top = 20;
  }
  
  // 应用位置
  dialog.style.left = left + 'px';
  dialog.style.top = top + 'px';
  dialog.style.visibility = 'visible';
  
  // 从临时添加中移除
  document.body.removeChild(dialog);
}

// 设置对话框事件监听器
function setupDialogEvents(dialog, highlightId) {
  const textarea = dialog.querySelector('.ai-comment-input');
  const saveButton = dialog.querySelector('.ai-comment-save');
  const cancelButton = dialog.querySelector('.ai-comment-cancel');
  const charCurrent = dialog.querySelector('.ai-char-current');
  
  // 字符计数更新
  textarea.addEventListener('input', () => {
    charCurrent.textContent = textarea.value.length;
    
    // 根据内容调整保存按钮状态
    const hasContent = textarea.value.trim().length > 0;
    saveButton.textContent = hasContent ? '保存' : '删除评论';
  });
  
  // 保存按钮
  saveButton.addEventListener('click', () => {
    saveComment(highlightId, textarea.value.trim());
    removeCommentDialog();
  });
  
  // 取消按钮
  cancelButton.addEventListener('click', () => {
    removeCommentDialog();
  });
  
  // 键盘事件
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      // Ctrl+Enter 或 Cmd+Enter 保存
      e.preventDefault();
      saveComment(highlightId, textarea.value.trim());
      removeCommentDialog();
    } else if (e.key === 'Escape') {
      // Escape 取消
      e.preventDefault();
      removeCommentDialog();
    }
  });
  
  // 点击外部区域关闭
  setTimeout(() => {
    document.addEventListener('click', handleOutsideClick);
  }, 100);
}

// 处理点击外部区域
function handleOutsideClick(e) {
  if (currentCommentDialog && !currentCommentDialog.contains(e.target)) {
    removeCommentDialog();
  }
}

// 保存评论
function saveComment(highlightId, comment) {
  // 调用content.js中的评论保存逻辑
  if (window.highlightComments) {
    const commentData = window.highlightComments.get(highlightId);
    if (commentData) {
      commentData.comment = comment;
      commentData.hasComment = comment.length > 0;
      commentData.timestamp = Date.now();
      
      console.log('评论已保存 (UI):', {
        highlightId: highlightId,
        text: commentData.text,
        comment: commentData.comment,
        hasComment: commentData.hasComment
      });
      
      // 🆕 更新评论指示器
      updateCommentIndicator(highlightId);
      
      // 成功提示
      showSaveSuccess();
    } else {
      console.error('Comment data not found for highlight:', highlightId);
    }
  } else {
    console.error('highlightComments not available');
  }
}

// 显示保存成功提示
function showSaveSuccess() {
  // 创建临时提示
  const toast = document.createElement('div');
  toast.className = 'ai-comment-toast';
  toast.textContent = '✓ 评论已保存';
  
  // 定位到屏幕中央上方
  toast.style.position = 'fixed';
  toast.style.top = '100px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.zIndex = '10001';
  
  document.body.appendChild(toast);
  
  // 3秒后移除
  setTimeout(() => {
    if (toast && toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

// 移除评论对话框
function removeCommentDialog() {
  if (currentCommentDialog) {
    document.removeEventListener('click', handleOutsideClick);
    
    if (currentCommentDialog.parentNode) {
      currentCommentDialog.parentNode.removeChild(currentCommentDialog);
    }
    
    currentCommentDialog = null;
    currentHighlightId = null;
    
    console.log('Comment dialog removed');
  }
}

// 显示评论输入对话框的主函数
function showCommentInputDialog(highlightId, clickPosition) {
  if (!window.highlightComments) {
    console.error('highlightComments not available');
    return;
  }
  
  const commentData = window.highlightComments.get(highlightId);
  if (!commentData) {
    console.error('Comment data not found for highlight:', highlightId);
    return;
  }
  
  // 创建并显示对话框
  createCommentDialog(
    highlightId,
    commentData.text,
    commentData.comment || '',
    clickPosition
  );
}

// 🆕 创建评论指示器
function createCommentIndicator(highlightId) {
  const indicator = document.createElement('span');
  indicator.className = 'ai-comment-indicator';
  indicator.setAttribute('data-highlight-id', highlightId);
  indicator.innerHTML = '🔖';
  
  // 获取实际评论内容作为悬停提示
  const commentData = window.highlightComments?.get(highlightId);
  if (commentData && commentData.comment) {
    // 限制tooltip长度，避免过长
    const tooltipText = commentData.comment.length > 100 
      ? commentData.comment.substring(0, 100) + '...'
      : commentData.comment;
    indicator.title = `🔖 ${tooltipText}`;
  } else {
    indicator.title = '🔖 点击查看评论';
  }
  
  // 添加点击事件 - 点击指示器也能编辑评论
  indicator.addEventListener('click', (e) => {
    e.stopPropagation();
    const clickPosition = { x: e.clientX, y: e.clientY };
    showCommentInputDialog(highlightId, clickPosition);
  });
  
  return indicator;
}

// 🆕 更新指定高亮的评论指示器
function updateCommentIndicator(highlightId) {
  if (!window.highlightComments || !window.highlights) {
    return;
  }
  
  const commentData = window.highlightComments.get(highlightId);
  const highlightData = window.highlights.get(highlightId);
  
  if (!commentData || !highlightData) {
    return;
  }
  
  // 移除现有指示器
  removeCommentIndicator(highlightId);
  
  // 如果有评论，创建新指示器
  if (commentData.hasComment && commentData.comment.trim()) {
    const indicator = createCommentIndicator(highlightId);
    insertIndicatorInline(indicator, highlightData.range);
    
    console.log('Comment indicator added for highlight:', highlightId);
  } else {
    console.log('Comment indicator removed for highlight:', highlightId);
  }
}

// 🆕 将指示器插入到高亮范围后面（内联方式）
function insertIndicatorInline(indicator, range) {
  try {
    // 创建一个新的范围，定位到原范围的结束位置
    const endRange = range.cloneRange();
    endRange.collapse(false); // 折叠到结束位置
    
    // 在结束位置插入指示器
    endRange.insertNode(indicator);
    
    console.log('Comment indicator inserted inline');
    
  } catch (error) {
    console.error('Error inserting inline indicator:', error);
    
    // 降级方案：尝试在范围结束节点后插入
    try {
      const endContainer = range.endContainer;
      const endOffset = range.endOffset;
      
      if (endContainer.nodeType === Node.TEXT_NODE) {
        const parent = endContainer.parentNode;
        const nextSibling = endContainer.nextSibling;
        
        if (nextSibling) {
          parent.insertBefore(indicator, nextSibling);
        } else {
          parent.appendChild(indicator);
        }
      } else {
        endContainer.appendChild(indicator);
      }
      
      console.log('Comment indicator inserted using fallback method');
      
    } catch (fallbackError) {
      console.error('Fallback insertion also failed:', fallbackError);
    }
  }
}

// 🆕 移除指定高亮的评论指示器
function removeCommentIndicator(highlightId) {
  const existingIndicator = document.querySelector(`.ai-comment-indicator[data-highlight-id="${highlightId}"]`);
  if (existingIndicator && existingIndicator.parentNode) {
    existingIndicator.parentNode.removeChild(existingIndicator);
  }
}

// 🆕 更新所有评论指示器（只在必要时重建）
function updateAllCommentIndicators() {
  if (!window.highlightComments || !window.highlights) {
    return;
  }
  
  console.log('Rebuilding all comment indicators...');
  
  // 移除所有现有指示器
  const existingIndicators = document.querySelectorAll('.ai-comment-indicator');
  existingIndicators.forEach(indicator => {
    if (indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  });
  
  // 重新创建有评论的指示器
  for (const [highlightId, commentData] of window.highlightComments) {
    if (commentData.hasComment && commentData.comment.trim()) {
      const highlightData = window.highlights.get(highlightId);
      if (highlightData) {
        const indicator = createCommentIndicator(highlightId);
        insertIndicatorInline(indicator, highlightData.range);
      }
    }
  }
  
  console.log('All comment indicators rebuilt');
}

// 🆕 初始化评论指示器系统
function initCommentIndicators() {
  // 延迟初始化，确保其他系统都已准备好
  setTimeout(() => {
    updateAllCommentIndicators();
  }, 1000);
  
  console.log('Comment indicators system initialized');
}

// 导出函数供content.js调用
window.commentManager = {
  showCommentInput: showCommentInputDialog,
  removeDialog: removeCommentDialog,
  updateIndicator: updateCommentIndicator,
  updateAllIndicators: updateAllCommentIndicators,
  removeIndicator: removeCommentIndicator,
  init: initCommentIndicators
};
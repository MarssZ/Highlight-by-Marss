// Highlight by Marss - Background Service Worker
console.log('Highlight by Marss background script loaded');

// 安装时初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('Highlight by Marss installed');
});

// 监听扩展图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
  console.log('扩展图标被点击，tab ID:', tab.id);

  try {
    // 发送消息到content script
    console.log('正在发送消息到 content script...');
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'exportConversation'
    });

    console.log('收到响应:', response);

    // 处理成功响应
    if (response && response.success && response.markdown) {
      // 写入剪贴板（使用 offscreen document）
      try {
        await writeToClipboard(response.markdown);
        console.log('✅ 已写入剪贴板');

        // 显示成功通知
        await chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/icon48.png'),
          title: 'Highlight by Marss',
          message: `已复制 ${response.rounds} 轮对话`,
          priority: 1
        });
      } catch (clipboardError) {
        console.error('写入剪贴板失败:', clipboardError);
        // 显示失败通知
        await chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/icon48.png'),
          title: 'Highlight by Marss',
          message: '复制失败：无法访问剪贴板',
          priority: 2
        });
      }
    } else {
      console.log('显示失败通知');
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon48.png'),
        title: 'Highlight by Marss',
        message: response?.error || '复制失败',
        priority: 2
      });
    }
  } catch (error) {
    console.error('扩展图标点击处理失败:', error);

    // 显示错误通知
    console.log('显示错误通知');
    try {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon48.png'),
        title: 'Highlight by Marss',
        message: '当前页面不支持此功能',
        priority: 2
      });
      console.log('通知已创建');
    } catch (notificationError) {
      console.error('创建通知失败:', notificationError);
    }
  }
});

/**
 * 写入剪贴板
 * 使用注入脚本的方式在页面上下文中执行
 */
async function writeToClipboard(text) {
  // 使用 chrome.scripting.executeScript 在页面上下文中执行
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (textToWrite) => {
      // 创建临时 textarea
      const textarea = document.createElement('textarea');
      textarea.value = textToWrite;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();

      // 使用 execCommand (兼容性更好)
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (!success) {
        throw new Error('execCommand copy failed');
      }
    },
    args: [text]
  });
}
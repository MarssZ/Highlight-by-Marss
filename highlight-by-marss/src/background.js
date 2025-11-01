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

    // 显示结果通知
    if (response && response.success) {
      console.log('显示成功通知');
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon48.png'),
        title: 'Highlight by Marss',
        message: `已复制 ${response.rounds} 轮对话`,
        priority: 1
      });
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
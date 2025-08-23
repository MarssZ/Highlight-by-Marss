// Highlight by Marss - Background Service Worker
console.log('Highlight by Marss background script loaded');

// 安装时初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('Highlight by Marss installed');
});
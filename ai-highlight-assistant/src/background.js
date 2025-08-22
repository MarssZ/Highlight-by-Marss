// AI Highlight Assistant - Background Service Worker
console.log('AI Highlight Assistant background script loaded');

// 安装时初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Highlight Assistant installed');
});
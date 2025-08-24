class ChatGPTAdapter extends PlatformAdapter {
    detectPlatform() {
        return window.location.hostname === 'chat.openai.com' ||
               window.location.hostname === 'chatgpt.com';
    }
    
    findResponseContainers() {
        // 使用语义化属性直接找到AI回复容器
        const aiArticles = document.querySelectorAll('article[data-turn="assistant"]');
        return Array.from(aiArticles);
    }
    
    findCopyButtons() {
        // 只查找AI回复中的复制按钮
        const aiContainers = this.findResponseContainers();
        const copyButtons = [];
        
        aiContainers.forEach(container => {
            const button = container.querySelector('button[data-testid="copy-turn-action-button"]');
            if (button) {
                copyButtons.push(button);
            }
        });
        
        console.log(`[ChatGPT Adapter] Found ${aiContainers.length} AI containers, ${copyButtons.length} copy buttons`);
        return copyButtons;
    }
    
    isValidResponseContainer(element) {
        // 检查元素是否在AI回复容器内
        return element.closest('article[data-turn="assistant"]') !== null;
    }
    
    getCopyButtonContainer(button) {
        // 向上查找到AI回复的article容器
        return button.closest('article[data-turn="assistant"]');
    }
}

// 注册适配器
if (typeof window !== 'undefined') {
    window.ChatGPTAdapter = ChatGPTAdapter;
}
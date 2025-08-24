class DoubaoAdapter extends PlatformAdapter {
    constructor() {
        super();
        this.platformName = 'doubao';
    }

    detectPlatform() {
        const hostname = window.location.hostname;
        return hostname === 'doubao.com' || hostname === 'www.doubao.com';
    }
    
    findResponseContainers() {
        // 使用语义化属性直接找到AI回复容器
        const aiMessages = document.querySelectorAll('div[data-testid="receive_message"]');
        return Array.from(aiMessages);
    }
    
    findCopyButtons() {
        // 只查找AI回复中的复制按钮
        const aiContainers = this.findResponseContainers();
        const copyButtons = [];
        
        aiContainers.forEach(container => {
            const button = container.querySelector('button[data-testid="message_action_copy"]');
            if (button) {
                copyButtons.push(button);
            }
        });
        
        console.log(`[Doubao Adapter] Found ${aiContainers.length} AI containers, ${copyButtons.length} copy buttons`);
        return copyButtons;
    }
    
    isValidResponseContainer(element) {
        // 检查元素是否在AI回复容器内
        return element.closest('div[data-testid="receive_message"]') !== null;
    }
    
    getCopyButtonContainer(button) {
        // 向上查找到AI回复的容器
        return button.closest('div[data-testid="receive_message"]');
    }
}

// 注册适配器
if (typeof window !== 'undefined') {
    window.DoubaoAdapter = DoubaoAdapter;
}
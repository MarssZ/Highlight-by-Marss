/**
 * Grok平台适配器
 * 基于grok.com的DOM结构实现平台特定逻辑
 */
class GrokAdapter extends PlatformAdapter {
    constructor() {
        super();
        this.platformName = 'grok';
    }

    /**
     * 检测是否为目标平台
     * @returns {boolean} 如果是目标平台返回true
     */
    detectPlatform() {
        return window.location.hostname.includes('grok.com');
    }

    /**
     * 验证容器是否为有效的AI回复容器
     * @param {Element} element - 要检测的元素
     * @returns {boolean} 是否为AI回复容器
     */
    isValidResponseContainer(element) {
        if (!element || !element.nodeType) {
            return false;
        }
        
        // 从当前元素向上查找，直到找到包含AI回复的共同父容器
        let current = element.nodeType === Node.TEXT_NODE ? element.parentElement : element;
        
        while (current && current !== document.body) {
            // 检查当前容器是否包含message-bubble和action-buttons
            const messageBubble = current.querySelector('.message-bubble');
            const actionButtons = current.querySelector('.action-buttons');
            
            if (messageBubble && actionButtons) {
                // 进一步检查是否为AI回复（左对齐 + 全宽）
                const isAIResponse = current.classList.contains('items-start') && 
                                   messageBubble.classList.contains('w-full');
                if (isAIResponse) {
                    return true;
                }
            }
            
            current = current.parentElement;
        }
        
        return false;
    }

    /**
     * 查找AI回复容器元素
     * @returns {Element[]} AI回复容器数组
     */
    findResponseContainers() {
        // 重新分析：寻找包含.action-buttons的共同父容器
        const actionButtons = document.querySelectorAll('.action-buttons');
        
        const validContainers = [];
        
        // 为每个action-buttons找到对应的AI回复容器
        Array.from(actionButtons).forEach((actionArea) => {
            // 向上寻找包含message-bubble的共同父容器
            let parent = actionArea.parentElement;
            let foundContainer = null;
            
            while (parent && parent !== document.body) {
                // 检查这个父容器是否包含message-bubble
                const messageBubble = parent.querySelector('.message-bubble');
                if (messageBubble) {
                    // 关键过滤：检查是否为AI回复（左对齐 + 全宽）
                    const isAIResponse = parent.classList.contains('items-start') && 
                                        messageBubble.classList.contains('w-full');
                    
                    if (isAIResponse) {
                        foundContainer = parent;
                        break;
                    }
                }
                parent = parent.parentElement;
            }
            
            if (foundContainer && !validContainers.includes(foundContainer)) {
                validContainers.push(foundContainer);
            }
        });
        
        return validContainers;
    }

    /**
     * 查找复制按钮元素
     * @returns {Element[]} 复制按钮数组
     */
    findCopyButtons() {
        const copyButtons = document.querySelectorAll('button[aria-label="复制"]');
        
        // 过滤出AI回复的复制按钮（排除用户消息的复制按钮）
        const validButtons = Array.from(copyButtons).filter(button => {
            // 向上找到包含按钮的共同父容器
            const actionArea = button.closest('.action-buttons');
            if (!actionArea) {
                return false;
            }
            
            // 继续向上找message-bubble所在的父容器
            let parent = actionArea.parentElement;
            while (parent && parent !== document.body) {
                const messageBubble = parent.querySelector('.message-bubble');
                if (messageBubble) {
                    // 检查是否为AI回复（左对齐 + 全宽）
                    const isAIResponse = parent.classList.contains('items-start') && 
                                        messageBubble.classList.contains('w-full');
                    return isAIResponse;
                }
                parent = parent.parentElement;
            }
            
            return false;
        });
        
        return validButtons;
    }

    /**
     * 获取复制按钮对应的消息容器
     * @param {Element} button 复制按钮元素
     * @returns {Element|null} 对应的消息容器
     */
    getCopyButtonContainer(button) {
        if (!button) return null;
        
        // 先找到action-buttons容器
        const actionArea = button.closest('.action-buttons');
        if (!actionArea) return null;
        
        // 从action-buttons向上找包含message-bubble的共同父容器
        let parent = actionArea.parentElement;
        while (parent && parent !== document.body) {
            const messageBubble = parent.querySelector('.message-bubble');
            if (messageBubble) {
                // 检查是否为AI回复（左对齐 + 全宽）
                const isAIResponse = parent.classList.contains('items-start') && 
                                   messageBubble.classList.contains('w-full');
                if (isAIResponse) {
                    return parent; // 返回包含整个AI回复的父容器
                }
            }
            parent = parent.parentElement;
        }
        
        return null;
    }
    
    /**
     * 私有方法：判断是否为AI回复的复制按钮
     * @param {Element} button
     * @returns {boolean}
     * @private
     */
    _isAICopyButton(button) {
        const isAICopyButton = (
            button.getAttribute('aria-label') === '复制' &&
            button.closest('.action-buttons') &&
            this.getCopyButtonContainer(button)
        );
        
        return isAICopyButton;
    }

    /**
     * 获取AI回复的文本内容
     * @param {Element} container - AI回复容器
     * @returns {string} 文本内容
     */
    getResponseText(container) {
        const contentElement = container.querySelector('.response-content-markdown.markdown');
        return contentElement ? contentElement.innerText : container.innerText;
    }

    /**
     * 测试适配器方法并输出统计信息
     */
    testAdapterMethods() {
        const containers = this.findResponseContainers();
        const copyButtons = this.findCopyButtons();
        
        console.log(`GrokAdapter loaded: detected ${window.location.hostname}`);
        console.log(`Found ${containers.length} AI response containers, ${copyButtons.length} copy buttons`);
        
        return {
            containers: containers.length,
            copyButtons: copyButtons.length
        };
    }
}

// 导出适配器
if (typeof window !== 'undefined') {
    window.GrokAdapter = GrokAdapter;
    
    // 智能延迟测试适配器（确保页面基础DOM加载完成）
    if (window.location.hostname.includes('grok.com')) {
        const adapter = new GrokAdapter();
        
        // 等待页面基础结构加载完成再测试（最多等待10秒）
        let attempts = 0;
        const maxAttempts = 5;
        
        function waitAndTest() {
            attempts++;
            
            // 检查页面基础结构是否加载（不管有没有AI回复）
            const hasBasicStructure = document.querySelector('main') || 
                                     document.querySelector('[role="main"]') ||
                                     document.querySelector('.message-bubble') ||
                                     document.body.children.length > 5;
            
            if (hasBasicStructure || attempts >= maxAttempts) {
                // 页面基础结构已加载，输出适配器测试结果
                adapter.testAdapterMethods();
            } else {
                // 页面还在加载基础结构，继续等待
                setTimeout(waitAndTest, 2000);
            }
        }
        
        // 初始延迟3秒后开始检测
        setTimeout(waitAndTest, 3000);
    }
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = GrokAdapter;
}
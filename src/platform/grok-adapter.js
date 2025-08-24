/**
 * Grok平台适配器
 * 基于grok.com的DOM结构实现平台特定逻辑
 */
class GrokAdapter {
    constructor() {
        this.name = 'grok';
        this.domain = 'grok.com';
    }

    /**
     * 检测是否为AI回复容器
     * @param {Element} element - 要检测的元素
     * @returns {boolean} 是否为AI回复容器
     */
    isAIResponseContainer(element) {
        // Grok的AI回复有特定的class组合
        return element.matches('.message-bubble.rounded-3xl.text-primary') ||
               element.closest('.message-bubble.rounded-3xl.text-primary') !== null;
    }

    /**
     * 查找所有AI回复容器
     * @returns {NodeList} AI回复容器列表
     */
    findAIResponseContainers() {
        return document.querySelectorAll('.message-bubble.rounded-3xl.text-primary');
    }

    /**
     * 查找复制按钮
     * @param {Element} container - AI回复容器
     * @returns {Element|null} 复制按钮元素
     */
    findCopyButton(container) {
        // 在容器内查找复制按钮
        return container.querySelector('button[aria-label="复制"]');
    }

    /**
     * 查找所有复制按钮
     * @returns {NodeList} 复制按钮列表
     */
    findAllCopyButtons() {
        return document.querySelectorAll('button[aria-label="复制"]');
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
     * 检测当前页面是否为目标平台
     * @returns {boolean} 是否为grok.com
     */
    isCurrentPlatform() {
        return window.location.hostname.includes('grok.com');
    }

    /**
     * 平台初始化
     */
    initialize() {
        if (!this.isCurrentPlatform()) {
            return;
        }
        
        console.log('[Grok Adapter] Grok平台适配器已初始化');
        
        // 验证DOM结构
        const containers = this.findAIResponseContainers();
        const copyButtons = this.findAllCopyButtons();
        
        console.log(`[Grok Adapter] 找到 ${containers.length} 个AI回复容器`);
        console.log(`[Grok Adapter] 找到 ${copyButtons.length} 个复制按钮`);
    }
}

// 导出适配器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GrokAdapter;
} else {
    window.GrokAdapter = GrokAdapter;
}
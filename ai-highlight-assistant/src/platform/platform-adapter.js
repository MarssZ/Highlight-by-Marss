/**
 * Platform Adapter Base Interface
 * 平台适配器基础接口
 * 
 * 设计哲学：消除特殊情况，让所有平台都通过统一接口工作
 * "Bad programmers worry about the code. Good programmers worry about data structures."
 */

class PlatformAdapter {
  /**
   * 检测是否为目标平台
   * @returns {boolean} 如果是目标平台返回true
   */
  detectPlatform() {
    throw new Error('detectPlatform() must be implemented');
  }

  /**
   * 查找AI回复容器元素
   * @returns {Element[]} AI回复容器数组
   */
  findResponseContainers() {
    throw new Error('findResponseContainers() must be implemented');
  }

  /**
   * 查找复制按钮元素
   * @returns {Element[]} 复制按钮数组
   */
  findCopyButtons() {
    throw new Error('findCopyButtons() must be implemented');
  }

  /**
   * 验证容器是否为有效的AI回复容器
   * @param {Element} element 要验证的元素
   * @returns {boolean} 如果是有效容器返回true
   */
  isValidResponseContainer(element) {
    throw new Error('isValidResponseContainer() must be implemented');
  }

  /**
   * 获取复制按钮对应的消息容器
   * @param {Element} button 复制按钮元素
   * @returns {Element|null} 对应的消息容器，如果没找到返回null
   */
  getCopyButtonContainer(button) {
    throw new Error('getCopyButtonContainer() must be implemented');
  }

  /**
   * 获取平台名称
   * @returns {string} 平台名称
   */
  getPlatformName() {
    return this.constructor.name.replace('Adapter', '').toLowerCase();
  }
}

/**
 * 适配器工厂
 * 动态检测和加载对应平台适配器
 */
class PlatformAdapterFactory {
  constructor() {
    this.adapters = [];
    this.currentAdapter = null;
  }

  /**
   * 注册适配器
   * @param {PlatformAdapter} adapter 适配器实例
   */
  register(adapter) {
    if (!(adapter instanceof PlatformAdapter)) {
      throw new Error('Adapter must be instance of PlatformAdapter');
    }
    this.adapters.push(adapter);
    // Adapter registered
  }

  /**
   * 检测当前平台并返回适配器
   * @returns {PlatformAdapter|null} 匹配的适配器，如果没有匹配返回null
   */
  detectAndLoad() {
    for (const adapter of this.adapters) {
      try {
        if (adapter.detectPlatform()) {
          this.currentAdapter = adapter;
          console.log(`Platform detected: ${window.location.hostname}, using ${adapter.getPlatformName()}`);
          return adapter;
        }
      } catch (error) {
        console.warn(`Error detecting platform with ${adapter.getPlatformName()}:`, error);
      }
    }
    
    console.warn('No platform adapter found for:', window.location.hostname);
    return null;
  }

  /**
   * 获取当前适配器
   * @returns {PlatformAdapter|null} 当前适配器
   */
  getCurrentAdapter() {
    return this.currentAdapter;
  }
}

// 导出 - 兼容浏览器和Node.js环境
if (typeof window !== 'undefined') {
  window.PlatformAdapter = PlatformAdapter;
  window.PlatformAdapterFactory = PlatformAdapterFactory;
  console.log('Platform adapter interface loaded');
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlatformAdapter, PlatformAdapterFactory };
} else {
  // 全局导出
  this.PlatformAdapter = PlatformAdapter;
  this.PlatformAdapterFactory = PlatformAdapterFactory;
}
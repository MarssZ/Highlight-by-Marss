/**
 * 对话导出模块
 * 负责提取对话内容并格式化为Markdown
 */

console.log('📝 conversation-exporter.js loaded');

/**
 * 对话导出器
 * 职责：提取对话 → 排序 → 配对 → Markdown格式化 → 剪贴板
 */
class ConversationExporter {
  constructor() {
    this.platformAdapter = window.platformAdapter;
  }

  /**
   * 导出对话到剪贴板
   * @returns {Promise<{success: boolean, rounds?: number, error?: string}>}
   */
  async export() {
    try {
      // 1. 检查平台适配器
      if (!this.platformAdapter) {
        console.warn('未检测到平台适配器');
        return { success: false, error: '未检测到平台适配器' };
      }

      // 2. 提取对话数据
      const messages = this._extractMessages();

      // 3. 检查是否有对话（任务12：空页面错误处理）
      if (messages.length === 0) {
        console.log('未检测到对话内容');
        return { success: false, error: '未检测到对话内容' };
      }

      // 4. 按DOM顺序排序（任务7）
      const sortedMessages = this._sortMessagesByDOM(messages);

      // 5. 配对消息（用户+AI = 一轮）
      const rounds = this._pairMessages(sortedMessages);

      // 6. 格式化为Markdown（任务8）
      const markdown = this._formatMarkdown(rounds);

      console.log(`✅ 已成功提取 ${rounds.length} 轮对话`);

      // 7. 返回 Markdown 文本（由 background.js 写入剪贴板）
      return { success: true, rounds: rounds.length, markdown };

    } catch (error) {
      console.error('❌ 导出对话失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 任务6：提取对话数据
   * @returns {Array<{type: 'user'|'ai', element: Element, text: string}>}
   * @private
   */
  _extractMessages() {
    const messages = [];
    let skipped = 0;

    // 提取用户消息
    try {
      const userElements = this.platformAdapter.findUserMessages();
      console.log(`📊 找到 ${userElements.length} 个用户消息容器`);

      for (const element of userElements) {
        try {
          const text = this.platformAdapter.extractText(element);
          if (text) {
            messages.push({ type: 'user', element, text });
          }
        } catch (e) {
          skipped++;
          console.warn('⚠️ 跳过1条用户消息提取失败:', e.message);
        }
      }
    } catch (e) {
      console.error('❌ 提取用户消息失败:', e);
    }

    // 提取AI回复
    try {
      const aiElements = this.platformAdapter.findResponseContainers();
      console.log(`📊 找到 ${aiElements.length} 个AI回复容器`);

      for (const element of aiElements) {
        try {
          const text = this.platformAdapter.extractText(element);
          if (text) {
            messages.push({ type: 'ai', element, text });
          }
        } catch (e) {
          skipped++;
          console.warn('⚠️ 跳过1条AI回复提取失败:', e.message);
        }
      }
    } catch (e) {
      console.error('❌ 提取AI回复失败:', e);
    }

    // 任务14：单条消息提取失败处理
    if (skipped > 0) {
      console.log(`⚠️ 跳过${skipped}条提取失败的消息`);
    }

    const userCount = messages.filter(m => m.type === 'user').length;
    const aiCount = messages.filter(m => m.type === 'ai').length;
    console.log(`📊 提取到 ${userCount} 条用户消息`);
    console.log(`📊 提取到 ${aiCount} 条AI回复`);
    console.log(`📊 配对后共 ${messages.length} 条消息`);

    return messages;
  }

  /**
   * 任务7：按DOM顺序排序消息
   * @param {Array} messages
   * @returns {Array}
   * @private
   */
  _sortMessagesByDOM(messages) {
    return messages.sort((a, b) => {
      // 使用 compareDocumentPosition 判断元素在DOM中的相对位置
      const position = a.element.compareDocumentPosition(b.element);

      // DOCUMENT_POSITION_FOLLOWING (4) 表示 b 在 a 后面
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1; // a 在前
      }
      // DOCUMENT_POSITION_PRECEDING (2) 表示 b 在 a 前面
      if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        return 1; // b 在前
      }

      return 0; // 同一个元素
    });
  }

  /**
   * 配对消息（用户问题 + AI回答 = 一轮对话）
   * @param {Array} sortedMessages
   * @returns {Array<{user: string, ai?: string}>}
   * @private
   */
  _pairMessages(sortedMessages) {
    const rounds = [];
    let currentRound = null;

    for (const message of sortedMessages) {
      if (message.type === 'user') {
        // 保存上一轮（如果有）
        if (currentRound && currentRound.user) {
          rounds.push(currentRound);
        }
        // 开始新一轮
        currentRound = { user: message.text };
      } else if (message.type === 'ai') {
        // AI回复
        if (currentRound) {
          currentRound.ai = message.text;
        } else {
          // 没有配对的AI回复（页面刷新后只看到AI回复的情况）
          // 创建一个只有AI回复的轮次
          currentRound = { ai: message.text };
        }
      }
    }

    // 保存最后一轮
    if (currentRound) {
      rounds.push(currentRound);
    }

    console.log(`📊 配对后共 ${rounds.length} 轮对话`);
    return rounds;
  }

  /**
   * 任务8：格式化为Markdown
   * @param {Array} rounds
   * @returns {string}
   * @private
   */
  _formatMarkdown(rounds) {
    const platformName = this.platformAdapter.getPlatformDisplayName();
    const now = new Date();

    // 格式化时间戳：2025-01-15 14:30
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day} ${hours}:${minutes}`;

    // 构建Markdown
    let markdown = `## 对话记录 ${timestamp}\n\n`;
    markdown += `**平台：** ${platformName}\n\n`;
    markdown += `---\n\n`;

    rounds.forEach((round, index) => {
      markdown += `### 第${index + 1}轮\n\n`;

      // 用户消息
      if (round.user) {
        markdown += `**用户：**\n${round.user}\n\n`;
      }

      // AI回复
      if (round.ai) {
        markdown += `**${platformName}：**\n${round.ai}\n\n`;
      }
    });

    return markdown;
  }
}

// 导出到全局（供content.js调用）
if (typeof window !== 'undefined') {
  window.conversationExporter = new ConversationExporter();
  console.log('✅ ConversationExporter 已初始化');
}

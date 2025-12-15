/**
 * Telegram 平台实现
 */
import type { Platform, PlatformMeta, SendResult, TelegramConfig, PlatformConfig } from './types';

export class TelegramPlatform implements Platform {
  readonly meta: PlatformMeta = {
    id: 'telegram',
    name: 'Telegram',
    icon: '📨',
    description: '通过 Bot API 发送消息到 Telegram 频道或群组',
  };

  validateConfig(config: PlatformConfig): boolean {
    const tgConfig = config as TelegramConfig;
    return !!(tgConfig.botToken && tgConfig.channelId);
  }

  async sendMessage(text: string, config: PlatformConfig): Promise<SendResult> {
    const tgConfig = config as TelegramConfig;
    
    if (!this.validateConfig(tgConfig)) {
      return {
        success: false,
        error: '请先配置 Bot Token 和 Channel ID',
      };
    }

    const url = `https://api.telegram.org/bot${tgConfig.botToken}/sendMessage`;
    const data = {
      chat_id: tgConfig.channelId,
      text: text,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.ok) {
        return {
          success: true,
          message: '消息已发送到 Telegram',
        };
      } else {
        let errorMsg = '未知错误';
        if (result.description) {
          errorMsg = result.description;
        } else if (result.error_code) {
          errorMsg = `错误代码: ${result.error_code}`;
        }
        return {
          success: false,
          error: errorMsg,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '网络错误或无法连接到 Telegram API',
      };
    }
  }

  async testConnection(config: PlatformConfig): Promise<SendResult> {
    const tgConfig = config as TelegramConfig;
    
    if (!this.validateConfig(tgConfig)) {
      return {
        success: false,
        error: '请先填写 Bot Token 和 Channel ID',
      };
    }

    return this.sendMessage('🔗 连接测试成功!\n这是来自 Chrome 插件的测试消息。', tgConfig);
  }
}

// 导出单例
export const telegramPlatform = new TelegramPlatform();

/**
 * Notion 平台实现
 * 通过 Notion API 将内容插入到数据库
 */
import type { Platform, PlatformMeta, SendResult, NotionConfig, PlatformConfig } from './types';

export class NotionPlatform implements Platform {
  readonly meta: PlatformMeta = {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    description: '将内容保存到 Notion 数据库',
  };

  validateConfig(config: PlatformConfig): boolean {
    const notionConfig = config as NotionConfig;
    return !!(
      notionConfig.integrationToken?.trim() && 
      notionConfig.databaseId?.trim() &&
      this.isValidDatabaseId(notionConfig.databaseId)
    );
  }

  private isValidDatabaseId(databaseId: string): boolean {
    // Notion Database ID 格式: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    // 也支持 32 位无连字符格式
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const compactPattern = /^[0-9a-f]{32}$/i;
    return uuidPattern.test(databaseId) || compactPattern.test(databaseId);
  }

  private formatDatabaseId(databaseId: string): string {
    // 移除连字符，统一格式
    return databaseId.replace(/-/g, '');
  }

  private extractTitleAndContent(text: string): { title: string; content: string; source?: string } {
    const lines = text.split('\n').filter(line => line.trim());
    
    // 提取来源链接（通常在最后一行）
    let source: string | undefined;
    const lastLine = lines[lines.length - 1];
    if (lastLine && (lastLine.startsWith('http://') || lastLine.startsWith('https://') || lastLine.includes('来源:'))) {
      source = lastLine.replace('来源:', '').trim();
      lines.pop(); // 移除来源行
    }

    // 第一行作为标题，剩余作为内容
    const title = lines[0] || '未命名剪藏';
    const content = lines.slice(1).join('\n') || text;

    return { title, content, source };
  }

  async sendMessage(text: string, config: PlatformConfig): Promise<SendResult> {
    const notionConfig = config as NotionConfig;
    
    if (!this.validateConfig(notionConfig)) {
      return {
        success: false,
        error: '请先配置有效的 Integration Token 和 Database ID',
      };
    }

    const { title, content, source } = this.extractTitleAndContent(text);
    
    // 构建 Notion API 请求
    const url = 'https://api.notion.com/v1/pages';
    const databaseId = this.formatDatabaseId(notionConfig.databaseId);
    
    // 获取属性名称（使用配置或默认值）
    const titleProp = notionConfig.titleProperty || '标题';
    const contentProp = notionConfig.contentProperty || '内容';
    const sourceProp = notionConfig.sourceProperty || '来源';

    // 构建请求体
    const properties: any = {
      [titleProp]: {
        title: [
          {
            text: {
              content: title.substring(0, 2000), // Notion 标题限制
            },
          },
        ],
      },
    };

    // 添加内容（Rich Text 类型）
    if (content) {
      properties[contentProp] = {
        rich_text: this.splitLongText(content),
      };
    }

    // 添加来源链接（URL 类型）
    if (source && this.isValidUrl(source)) {
      properties[sourceProp] = {
        url: source,
      };
    }

    const payload = {
      parent: { 
        database_id: databaseId,
      },
      properties,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notionConfig.integrationToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMsg = `HTTP ${response.status}`;
        
        if (errorData.code === 'unauthorized') {
          errorMsg = 'Integration Token 无效或已过期';
        } else if (errorData.code === 'object_not_found') {
          errorMsg = 'Database ID 不存在或 Integration 未连接到该数据库';
        } else if (errorData.code === 'validation_error') {
          errorMsg = `数据验证失败: ${errorData.message || '请检查数据库属性配置'}`;
        } else if (errorData.message) {
          errorMsg = errorData.message;
        }

        return {
          success: false,
          error: errorMsg,
        };
      }

      return {
        success: true,
        message: '内容已保存到 Notion',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '网络错误或无法连接到 Notion API',
      };
    }
  }

  async testConnection(config: PlatformConfig): Promise<SendResult> {
    const notionConfig = config as NotionConfig;
    
    if (!this.validateConfig(notionConfig)) {
      return {
        success: false,
        error: '请先填写 Integration Token 和 Database ID',
      };
    }

    const testMessage = `🔗 连接测试成功!

这是来自 Clipper Hub 的测试消息

时间: ${new Date().toLocaleString('zh-CN')}`;
    return this.sendMessage(testMessage, notionConfig);
  }

  /**
   * 将长文本分割成多个 Rich Text 块（Notion 限制单个块 2000 字符）
   */
  private splitLongText(text: string): Array<{ text: { content: string } }> {
    const maxLength = 2000;
    const blocks: Array<{ text: { content: string } }> = [];
    
    if (text.length <= maxLength) {
      return [{ text: { content: text } }];
    }

    // 按 2000 字符分割
    for (let i = 0; i < text.length; i += maxLength) {
      blocks.push({
        text: {
          content: text.substring(i, i + maxLength),
        },
      });
    }

    return blocks;
  }

  /**
   * 验证 URL 格式
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// 导出单例
export const notionPlatform = new NotionPlatform();

/**
 * Discord 平台实现
 * 通过 Webhook 发送消息到 Discord 频道
 */
import type { Platform, PlatformMeta, SendResult, DiscordConfig, PlatformConfig } from './types';

export class DiscordPlatform implements Platform {
	readonly meta: PlatformMeta = {
		id: 'discord',
		name: 'Discord',
		icon: '💬',
		description: '通过 Webhook 发送消息到 Discord 频道',
	};

	validateConfig(config: PlatformConfig): boolean {
		const discordConfig = config as DiscordConfig;
		return !!(discordConfig.webhookUrl && this.isValidWebhookUrl(discordConfig.webhookUrl));
	}

	private isValidWebhookUrl(url: string): boolean {
		// Discord Webhook URL 格式: https://discord.com/api/webhooks/{id}/{token}
		// 或者 https://discordapp.com/api/webhooks/{id}/{token}
		const webhookPattern = /^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[\w-]+$/;
		return webhookPattern.test(url);
	}

	async sendMessage(text: string, config: PlatformConfig): Promise<SendResult> {
		const discordConfig = config as DiscordConfig;

		if (!this.validateConfig(discordConfig)) {
			return {
				success: false,
				error: '请先配置有效的 Discord Webhook URL',
			};
		}

		// Discord Webhook 消息体
		const payload: any = {
			content: text,
		};

		try {
			const response = await fetch(discordConfig.webhookUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			// Discord Webhook 成功时返回 204 No Content
			if (response.status === 204 || response.ok) {
				return {
					success: true,
					message: '消息已发送到 Discord',
				};
			} else {
				// 尝试解析错误信息
				let errorMsg = `HTTP ${response.status}`;
				try {
					const errorData = await response.json();
					if (errorData.message) {
						errorMsg = errorData.message;
					}
				} catch {
					// 忽略解析错误
				}
				return {
					success: false,
					error: errorMsg,
				};
			}
		} catch (error: any) {
			return {
				success: false,
				error: error.message || '网络错误或无法连接到 Discord',
			};
		}
	}

	async testConnection(config: PlatformConfig): Promise<SendResult> {
		const discordConfig = config as DiscordConfig;

		if (!this.validateConfig(discordConfig)) {
			return {
				success: false,
				error: '请先填写有效的 Discord Webhook URL',
			};
		}

		return this.sendMessage('🔗 连接测试成功!\n这是来自 Chrome 插件的测试消息。', discordConfig);
	}
}

// 导出单例
export const discordPlatform = new DiscordPlatform();

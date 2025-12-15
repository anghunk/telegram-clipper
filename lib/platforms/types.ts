/**
 * 平台接口定义
 * 所有第三方平台都需要实现这个接口
 */

// 发送消息的结果
export interface SendResult {
	success: boolean;
	message?: string;
	error?: string;
}

// 平台配置基类
export interface PlatformConfig {
	enabled: boolean;
}

// Telegram 平台配置
export interface TelegramConfig extends PlatformConfig {
	botToken: string;
	channelId: string;
}

// Discord 平台配置
export interface DiscordConfig extends PlatformConfig {
	webhookUrl: string;
}

// Notion 平台配置
export interface NotionConfig extends PlatformConfig {
	integrationToken: string;
	databaseId: string;
	titleProperty?: string; // 标题属性名称（默认：'Name'）
	contentProperty?: string; // 内容属性名称（默认：'Content'）
	sourceProperty?: string; // 来源属性名称（默认：'Source'）
}

// 所有平台配置的联合类型
export type AllPlatformConfigs = {
	telegram: TelegramConfig;
	discord: DiscordConfig;
	notion: NotionConfig;
};

// 平台类型
export type PlatformType = keyof AllPlatformConfigs;

// 平台元信息
export interface PlatformMeta {
	id: PlatformType;
	name: string;
	icon: string;
	description: string;
}

// 平台接口 - 所有平台必须实现
export interface Platform {
	// 平台元信息
	readonly meta: PlatformMeta;

	// 发送文本消息
	sendMessage(text: string, config: PlatformConfig): Promise<SendResult>;

	// 测试连接
	testConnection(config: PlatformConfig): Promise<SendResult>;

	// 验证配置是否完整
	validateConfig(config: PlatformConfig): boolean;
}

// 默认配置
export const defaultConfigs: AllPlatformConfigs = {
	telegram: {
		enabled: false,
		botToken: '',
		channelId: '',
	},
	discord: {
		enabled: false,
		webhookUrl: '',
	},
	notion: {
		enabled: false,
		integrationToken: '',
		databaseId: '',
		titleProperty: 'Name',
		contentProperty: 'Content',
		sourceProperty: 'Source',
	},
};

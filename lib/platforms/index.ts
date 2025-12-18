/**
 * 平台管理器
 * 统一管理所有第三方平台
 */
import { browser } from 'wxt/browser';
import type {
	Platform,
	PlatformType,
	AllPlatformConfigs,
	PlatformConfig,
	SendResult,
	TelegramConfig,
	DiscordConfig,
	NotionConfig,
} from './types';
import { defaultConfigs, getEnvDefaultConfigs } from './types';
import { telegramPlatform } from './telegram';
import { discordPlatform } from './discord';
import { notionPlatform } from './notion';

// 所有已注册的平台
const platforms: Record<PlatformType, Platform> = {
	telegram: telegramPlatform,
	discord: discordPlatform,
	notion: notionPlatform,
};

// Storage key
const STORAGE_KEY = 'platformConfigs';

/**
 * 获取所有平台
 */
export function getAllPlatforms(): Platform[] {
	return Object.values(platforms);
}

/**
 * 获取指定平台
 */
export function getPlatform(type: PlatformType): Platform {
	return platforms[type];
}

/**
 * 从存储中加载所有平台配置
 * 逻辑：
 * 1. 从 storage 加载用户设置的配置
 * 2. 对于用户未设置的字段，使用环境变量作为默认值
 * 3. 环境变量的值不会被存储到 storage，仅作为运行时默认值
 */
export async function loadAllConfigs(): Promise<AllPlatformConfigs> {
	const browserAPI = browser;

	try {
		const result = await browserAPI.storage.sync.get(STORAGE_KEY);
		const savedConfigs = result[STORAGE_KEY] as Partial<AllPlatformConfigs> | undefined;

		// 获取环境变量默认配置
		const envDefaults = getEnvDefaultConfigs();

		// 合并配置：环境变量 < 用户设置
		const configs: AllPlatformConfigs = {
			telegram: mergeConfig(envDefaults.telegram, savedConfigs?.telegram),
			discord: mergeConfig(envDefaults.discord, savedConfigs?.discord),
			notion: mergeConfig(envDefaults.notion, savedConfigs?.notion),
		};

		// 兼容旧版本配置 - 从旧的存储字段迁移
		const legacyResult = await browserAPI.storage.sync.get(['telegramBotToken', 'telegramChannelId']);
		if (legacyResult.telegramBotToken && !savedConfigs?.telegram?.botToken) {
			configs.telegram.botToken = legacyResult.telegramBotToken as string;
			configs.telegram.channelId = (legacyResult.telegramChannelId as string) || '';
			configs.telegram.enabled = true;
			// 保存迁移后的配置
			await saveAllConfigs(configs);
		}

		return configs;
	} catch (error) {
		console.error('加载配置失败:', error);
		// 失败时返回环境变量默认配置
		return getEnvDefaultConfigs();
	}
}

/**
 * 合并配置：只有当用户设置了非空值时，才覆盖环境变量
 */
function mergeConfig<T extends PlatformConfig>(envDefault: T, userConfig?: Partial<T>): T {
	if (!userConfig) {
		return envDefault;
	}

	const merged = { ...envDefault };

	// 遵循以用户设置为主的原则：只有当用户设置了值时，才覆盖环境变量
	for (const [key, value] of Object.entries(userConfig)) {
		if (value !== undefined && value !== null && value !== '') {
			(merged as any)[key] = value;
		}
	}

	return merged;
}

/**
 * 保存所有平台配置
 * 只保存用户实际设置的值，不保存环境变量的默认值
 */
export async function saveAllConfigs(configs: AllPlatformConfigs): Promise<void> {
	const browserAPI = browser;

	try {
		// 获取环境变量默认配置
		const envDefaults = getEnvDefaultConfigs();
		
		// 过滤掉与环境变量相同的值，只保存用户实际修改的配置
		const filteredConfigs: Partial<AllPlatformConfigs> = {};
		
		for (const platformType of Object.keys(configs) as PlatformType[]) {
			const config = configs[platformType];
			const envDefault = envDefaults[platformType];
			const filteredConfig: any = {};
			
			// 比较每个字段，只保存与环境变量不同的值
			for (const [key, value] of Object.entries(config)) {
				// enabled 字段始终保存
				if (key === 'enabled') {
					filteredConfig[key] = value;
				} else if (value !== (envDefault as any)[key]) {
					// 只有当值与环境变量不同时才保存
					filteredConfig[key] = value;
				}
			}
			
			// 如果有需要保存的字段，则添加到 filteredConfigs
			if (Object.keys(filteredConfig).length > 0) {
				filteredConfigs[platformType] = filteredConfig;
			}
		}
		
		await browserAPI.storage.sync.set({ [STORAGE_KEY]: filteredConfigs });
	} catch (error) {
		console.error('保存配置失败:', error);
		throw error;
	}
}

/**
 * 加载指定平台配置
 */
export async function loadPlatformConfig<T extends PlatformType>(type: T): Promise<AllPlatformConfigs[T]> {
	const configs = await loadAllConfigs();
	return configs[type];
}

/**
 * 保存指定平台配置
 */
export async function savePlatformConfig<T extends PlatformType>(
	type: T,
	config: AllPlatformConfigs[T],
): Promise<void> {
	const configs = await loadAllConfigs();
	configs[type] = config;
	await saveAllConfigs(configs);
}

/**
 * 获取所有已启用的平台
 */
export async function getEnabledPlatforms(): Promise<Platform[]> {
	const configs = await loadAllConfigs();
	const enabledPlatforms: Platform[] = [];

	for (const [type, config] of Object.entries(configs)) {
		if (config.enabled && platforms[type as PlatformType]) {
			enabledPlatforms.push(platforms[type as PlatformType]);
		}
	}

	return enabledPlatforms;
}

/**
 * 向所有已启用的平台发送消息
 */
export async function sendToAllEnabled(text: string): Promise<Record<PlatformType, SendResult>> {
	const configs = await loadAllConfigs();
	const results: Record<string, SendResult> = {};

	for (const [type, config] of Object.entries(configs)) {
		const platformType = type as PlatformType;
		if (config.enabled) {
			const platform = platforms[platformType];
			if (platform && platform.validateConfig(config)) {
				results[platformType] = await platform.sendMessage(text, config);
			} else {
				results[platformType] = {
					success: false,
					error: `${platform?.meta.name || type} 配置不完整`,
				};
			}
		}
	}

	return results as Record<PlatformType, SendResult>;
}

/**
 * 向指定的多个平台发送消息
 */
export async function sendToSelectedPlatforms(
	text: string,
	selectedPlatforms: PlatformType[],
): Promise<Record<PlatformType, SendResult>> {
	const configs = await loadAllConfigs();
	const results: Record<string, SendResult> = {};

	for (const platformType of selectedPlatforms) {
		const config = configs[platformType];
		const platform = platforms[platformType];

		if (!platform) {
			results[platformType] = {
				success: false,
				error: '平台不存在',
			};
			continue;
		}

		if (!config.enabled) {
			results[platformType] = {
				success: false,
				error: `${platform.meta.name} 未启用`,
			};
			continue;
		}

		if (!platform.validateConfig(config)) {
			results[platformType] = {
				success: false,
				error: `${platform.meta.name} 配置不完整`,
			};
			continue;
		}

		results[platformType] = await platform.sendMessage(text, config);
	}

	return results as Record<PlatformType, SendResult>;
}

/**
 * 向指定平台发送消息
 */
export async function sendToPlatform(type: PlatformType, text: string): Promise<SendResult> {
	const config = await loadPlatformConfig(type);
	const platform = platforms[type];

	if (!platform) {
		return { success: false, error: '平台不存在' };
	}

	if (!config.enabled) {
		return { success: false, error: `${platform.meta.name} 未启用` };
	}

	return platform.sendMessage(text, config);
}

/**
 * 测试指定平台连接
 */
export async function testPlatformConnection(type: PlatformType, config: PlatformConfig): Promise<SendResult> {
	const platform = platforms[type];

	if (!platform) {
		return { success: false, error: '平台不存在' };
	}

	return platform.testConnection(config);
}

/**
 * 检查是否有任何平台已配置
 */
export async function hasAnyConfigured(): Promise<boolean> {
	const configs = await loadAllConfigs();

	for (const [type, config] of Object.entries(configs)) {
		if (config.enabled) {
			const platform = platforms[type as PlatformType];
			if (platform && platform.validateConfig(config)) {
				return true;
			}
		}
	}

	return false;
}

// 导出类型
export type {
	Platform,
	PlatformType,
	PlatformConfig,
	AllPlatformConfigs,
	SendResult,
	TelegramConfig,
	DiscordConfig,
	NotionConfig,
} from './types';
export { defaultConfigs } from './types';

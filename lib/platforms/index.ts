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
} from './types';
import { defaultConfigs } from './types';
import { telegramPlatform } from './telegram';
import { discordPlatform } from './discord';

// 所有已注册的平台
const platforms: Record<PlatformType, Platform> = {
  telegram: telegramPlatform,
  discord: discordPlatform,
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
 */
export async function loadAllConfigs(): Promise<AllPlatformConfigs> {
  const browserAPI = browser;
  
  try {
    const result = await browserAPI.storage.sync.get(STORAGE_KEY);
    const savedConfigs = result[STORAGE_KEY] as Partial<AllPlatformConfigs> | undefined;
    
    // 合并默认配置和保存的配置
    const configs: AllPlatformConfigs = {
      telegram: {
        ...defaultConfigs.telegram,
        ...(savedConfigs?.telegram || {}),
      },
      discord: {
        ...defaultConfigs.discord,
        ...(savedConfigs?.discord || {}),
      },
    };

    // 兼容旧版本配置 - 从旧的存储字段迁移
    const legacyResult = await browserAPI.storage.sync.get(['telegramBotToken', 'telegramChannelId']);
    if (legacyResult.telegramBotToken && !configs.telegram.botToken) {
      configs.telegram.botToken = legacyResult.telegramBotToken as string;
      configs.telegram.channelId = (legacyResult.telegramChannelId as string) || '';
      configs.telegram.enabled = true;
      // 保存迁移后的配置
      await saveAllConfigs(configs);
    }

    return configs;
  } catch (error) {
    console.error('加载配置失败:', error);
    return { ...defaultConfigs };
  }
}

/**
 * 保存所有平台配置
 */
export async function saveAllConfigs(configs: AllPlatformConfigs): Promise<void> {
  const browserAPI = browser;
  
  try {
    await browserAPI.storage.sync.set({ [STORAGE_KEY]: configs });
  } catch (error) {
    console.error('保存配置失败:', error);
    throw error;
  }
}

/**
 * 加载指定平台配置
 */
export async function loadPlatformConfig<T extends PlatformType>(
  type: T
): Promise<AllPlatformConfigs[T]> {
  const configs = await loadAllConfigs();
  return configs[type];
}

/**
 * 保存指定平台配置
 */
export async function savePlatformConfig<T extends PlatformType>(
  type: T,
  config: AllPlatformConfigs[T]
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
 * 向指定平台发送消息
 */
export async function sendToPlatform(
  type: PlatformType, 
  text: string
): Promise<SendResult> {
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
export async function testPlatformConnection(
  type: PlatformType,
  config: PlatformConfig
): Promise<SendResult> {
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
} from './types';
export { defaultConfigs } from './types';

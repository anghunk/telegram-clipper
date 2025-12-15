# 添加新平台支持

本文档介绍如何为 Clipper Hub 添加新的平台支持。

## 📐 架构概述

Clipper Hub 采用**中间件模式**实现平台解耦，核心架构包括：

```
┌─────────────────────────────────────────┐
│         应用层（UI + 业务逻辑）          │
│  entrypoints/popup, options, edit, etc. │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│           平台管理器（统一接口）          │
│      lib/platforms/index.ts             │
│  - sendToAllEnabled()                   │
│  - loadAllConfigs()                     │
│  - saveConfig()                         │
└────────────────┬────────────────────────┘
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
    ┌────┐  ┌────┐  ┌────┐
    │ T  │  │ D  │  │ ?  │
    │ e  │  │ i  │  │ 新  │
    │ l  │  │ s  │  │ 平  │
    │ e  │  │ c  │  │ 台  │
    │ g  │  │ o  │  │    │
    │ r  │  │ r  │  │    │
    │ a  │  │ d  │  │    │
    │ m  │  │    │  │    │
    └────┘  └────┘  └────┘
     实现    实现     实现
   Platform Platform Platform
```

## 🔑 核心概念

### Platform 接口

所有平台必须实现 `Platform` 接口：

```typescript
export interface Platform {
  readonly meta: PlatformMeta;
  sendMessage(text: string, config: PlatformConfig): Promise<SendResult>;
  testConnection(config: PlatformConfig): Promise<SendResult>;
  validateConfig(config: PlatformConfig): boolean;
}
```

### 类型定义

**PlatformMeta**：平台元信息

```typescript
export interface PlatformMeta {
  id: PlatformType;           // 唯一标识符
  name: string;               // 显示名称
  description: string;        // 平台描述
}
```

**PlatformConfig**：平台配置基类

```typescript
export interface PlatformConfig {
  enabled: boolean;           // 是否启用
}
```

**SendResult**：发送结果

```typescript
export interface SendResult {
  success: boolean;           // 是否成功
  error?: string;             // 错误信息
  platformId?: string;        // 平台 ID
}
```

## 🚀 添加新平台步骤

### 步骤 1：定义平台类型和配置

在 `lib/platforms/types.ts` 中添加：

```typescript
// 1. 添加平台类型
export type PlatformType = 'telegram' | 'discord' | 'your_platform';

// 2. 定义平台特定的配置接口
export interface YourPlatformConfig extends PlatformConfig {
  // 添加平台特定的配置字段
  apiKey: string;
  endpoint: string;
  // ... 其他配置
}
```

### 步骤 2：创建平台实现文件

创建 `lib/platforms/your_platform.ts`：

```typescript
import type { Platform, PlatformMeta, PlatformConfig, SendResult, YourPlatformConfig } from './types';

export class YourPlatform implements Platform {
  readonly meta: PlatformMeta = {
    id: 'your_platform',
    name: '你的平台名称',
    description: '平台描述',
  };

  /**
   * 验证配置是否完整
   */
  validateConfig(config: PlatformConfig): boolean {
    const platformConfig = config as YourPlatformConfig;
    
    // 检查必需的配置项
    if (!platformConfig.apiKey || !platformConfig.endpoint) {
      return false;
    }
    
    // 可以添加更多验证逻辑
    return true;
  }

  /**
   * 发送消息到平台
   */
  async sendMessage(text: string, config: PlatformConfig): Promise<SendResult> {
    const platformConfig = config as YourPlatformConfig;

    // 验证配置
    if (!this.validateConfig(config)) {
      return {
        success: false,
        error: '配置不完整',
        platformId: this.meta.id,
      };
    }

    try {
      // 实现你的发送逻辑
      const response = await fetch(platformConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${platformConfig.apiKey}`,
        },
        body: JSON.stringify({
          message: text,
          // ... 其他参数
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        platformId: this.meta.id,
      };
    } catch (error: any) {
      console.error(`[${this.meta.name}] 发送失败:`, error);
      return {
        success: false,
        error: error.message || '发送失败',
        platformId: this.meta.id,
      };
    }
  }

  /**
   * 测试连接
   */
  async testConnection(config: PlatformConfig): Promise<SendResult> {
    // 发送测试消息
    return this.sendMessage(
      `✅ ${this.meta.name} 连接测试成功！\n\n时间：${new Date().toLocaleString('zh-CN')}`,
      config
    );
  }
}
```

### 步骤 3：注册平台

在 `lib/platforms/index.ts` 中注册新平台：

```typescript
import { TelegramPlatform } from './telegram';
import { DiscordPlatform } from './discord';
import { YourPlatform } from './your_platform';  // 导入新平台

// 平台实例映射
export const platforms: Record<PlatformType, Platform> = {
  telegram: new TelegramPlatform(),
  discord: new DiscordPlatform(),
  your_platform: new YourPlatform(),  // 注册新平台
};
```

### 步骤 4：添加环境变量（可选）

如果需要默认配置，在 `.env.example` 中添加：

```bash
# 你的平台配置
VITE_YOUR_PLATFORM_API_KEY=
VITE_YOUR_PLATFORM_ENDPOINT=
```

在 `wxt.config.ts` 中添加环境变量定义：

```typescript
export default defineConfig({
  vite: () => ({
    define: {
      'import.meta.env.VITE_YOUR_PLATFORM_API_KEY': 
        JSON.stringify(process.env.VITE_YOUR_PLATFORM_API_KEY || ''),
      'import.meta.env.VITE_YOUR_PLATFORM_ENDPOINT': 
        JSON.stringify(process.env.VITE_YOUR_PLATFORM_ENDPOINT || ''),
    },
  }),
  // ...
});
```

### 步骤 5：添加 UI 配置表单

在 `entrypoints/options/App.vue` 中，配置表单会自动根据平台类型渲染。你需要为新平台添加配置字段：

```vue
<!-- Telegram 配置 -->
<div v-if="activePlatformTab === 'telegram'" class="config-form">
  <!-- ... -->
</div>

<!-- Discord 配置 -->
<div v-if="activePlatformTab === 'discord'" class="config-form">
  <!-- ... -->
</div>

<!-- 你的平台配置 -->
<div v-if="activePlatformTab === 'your_platform'" class="config-form">
  <div class="form-item">
    <label>API Key</label>
    <input
      v-model="platformConfigs.your_platform.apiKey"
      type="password"
      placeholder="输入 API Key"
    />
  </div>
  
  <div class="form-item">
    <label>Endpoint URL</label>
    <input
      v-model="platformConfigs.your_platform.endpoint"
      type="url"
      placeholder="https://api.yourplatform.com/send"
    />
  </div>
</div>
```

### 步骤 6：更新权限（如需要）

如果新平台需要访问特定域名，在 `wxt.config.ts` 中添加：

```typescript
export default defineConfig({
  manifest: {
    host_permissions: [
      'https://api.telegram.org/*',
      'https://discord.com/*',
      'https://discordapp.com/*',
      'https://api.yourplatform.com/*',  // 添加新平台域名
    ],
  },
});
```

### 步骤 7：编写平台文档

创建 `docs/platforms/your_platform.md`，参考现有文档：
- [Telegram 配置指南](../platforms/telegram.md)
- [Discord 配置指南](../platforms/discord.md)

包含以下内容：
- 前置要求
- 配置步骤
- 常见问题
- 使用技巧

## ✅ 测试清单

添加新平台后，请进行以下测试：

- [ ] 配置验证功能正常
- [ ] 测试连接功能正常
- [ ] 能够成功发送消息
- [ ] 错误处理正确
- [ ] UI 配置表单显示正常
- [ ] 配置能够正确保存和加载
- [ ] 启用/禁用功能正常
- [ ] 多平台同时发送功能正常

## 📋 代码检查清单

- [ ] 实现了完整的 `Platform` 接口
- [ ] 添加了详细的错误处理
- [ ] 添加了 TypeScript 类型定义
- [ ] 添加了配置验证逻辑
- [ ] 在平台管理器中注册
- [ ] 更新了相关文档
- [ ] 添加了必要的权限
- [ ] 测试了所有功能

## 🎯 最佳实践

### 1. 错误处理

```typescript
try {
  // API 调用
} catch (error: any) {
  console.error(`[${this.meta.name}] 错误:`, error);
  return {
    success: false,
    error: error.message || '未知错误',
    platformId: this.meta.id,
  };
}
```

### 2. 配置验证

```typescript
validateConfig(config: PlatformConfig): boolean {
  const c = config as YourPlatformConfig;
  
  // 检查必需字段
  if (!c.apiKey?.trim()) return false;
  if (!c.endpoint?.trim()) return false;
  
  // 格式验证
  if (!c.endpoint.startsWith('https://')) return false;
  
  return true;
}
```

### 3. 日志记录

```typescript
console.log(`[${this.meta.name}] 发送消息:`, text.substring(0, 50));
console.error(`[${this.meta.name}] 发送失败:`, error);
```

### 4. 类型安全

```typescript
// 使用类型断言
const platformConfig = config as YourPlatformConfig;

// 使用类型守卫
if ('apiKey' in config && config.apiKey) {
  // ...
}
```

## 📚 参考示例

### 简单 REST API 平台

参考 Discord 实现：
- 文件：`lib/platforms/discord.ts`
- 特点：简单的 POST 请求
- 配置：Webhook URL

### 复杂 Bot API 平台

参考 Telegram 实现：
- 文件：`lib/platforms/telegram.ts`
- 特点：需要认证的 API
- 配置：Bot Token + Channel ID

## 🤝 贡献指南

添加新平台后，欢迎提交 Pull Request：

1. Fork 项目
2. 创建特性分支：`git checkout -b feature/add-xxx-platform`
3. 提交更改：`git commit -m 'feat: add XXX platform support'`
4. 推送分支：`git push origin feature/add-xxx-platform`
5. 提交 PR，并在描述中说明：
   - 平台名称和用途
   - 配置步骤
   - 测试情况

## 📞 获取帮助

如有问题，可以：
- 查看现有平台实现作为参考
- 提交 Issue 描述问题
- 在讨论区交流

---

祝你成功添加新平台！🎉

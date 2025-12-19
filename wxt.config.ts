import { defineConfig } from 'wxt';
import pkg from './package.json';
import { resolve } from 'path';

// See https://wxt.dev/api/config.html
export default defineConfig({
	vite: () => ({
		resolve: {
			alias: {
				'@': resolve(__dirname, '.'),
			},
		},
		define: {
			// 将环境变量注入到浏览器扩展中
			'import.meta.env.VITE_TELEGRAM_ENABLED': JSON.stringify(process.env.VITE_TELEGRAM_ENABLED || 'false'),
			'import.meta.env.VITE_TELEGRAM_BOT_TOKEN': JSON.stringify(process.env.VITE_TELEGRAM_BOT_TOKEN || ''),
			'import.meta.env.VITE_TELEGRAM_CHANNEL_ID': JSON.stringify(process.env.VITE_TELEGRAM_CHANNEL_ID || ''),
			'import.meta.env.VITE_DISCORD_ENABLED': JSON.stringify(process.env.VITE_DISCORD_ENABLED || 'false'),
			'import.meta.env.VITE_DISCORD_WEBHOOK_URL': JSON.stringify(process.env.VITE_DISCORD_WEBHOOK_URL || ''),
			'import.meta.env.VITE_NOTION_ENABLED': JSON.stringify(process.env.VITE_NOTION_ENABLED || 'false'),
			'import.meta.env.VITE_NOTION_INTEGRATION_TOKEN': JSON.stringify(process.env.VITE_NOTION_INTEGRATION_TOKEN || ''),
			'import.meta.env.VITE_NOTION_DATABASE_ID': JSON.stringify(process.env.VITE_NOTION_DATABASE_ID || ''),
		},
		esbuild: {
			// 生产环境移除 console 和 debugger
			drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
		},
	}),
	modules: ['@wxt-dev/module-vue'],
	manifest: {
		name: 'Clipper Hub - 万能剪藏',
		version: pkg.version,
		description:
			'将网页内容一键收藏至多个平台的浏览器扩展，支持 Telegram、Discord、Notion 等多个平台，让你的灵感和收藏无处不在。',
		permissions: ['contextMenus', 'storage', 'notifications', 'scripting'],
		host_permissions: [
			'https://api.telegram.org/*',
			'https://discord.com/*',
			'https://discordapp.com/*',
			'https://api.notion.com/*',
			'<all_urls>',
		],
		browser_specific_settings: {
			gecko: {
				// @ts-ignore - data_collection_permissions 是 Firefox 要求的新属性
				data_collection_permissions: {
					required: [
						'browsingActivity',  // 需要访问网页内容和选中的文本
						'websiteContent'     // 需要读取和处理网页内容
					],
				},
			} as any,
		},
	} as any,
});

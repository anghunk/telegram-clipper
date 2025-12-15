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
			'import.meta.env.VITE_TELEGRAM_BOT_TOKEN': JSON.stringify(process.env.VITE_TELEGRAM_BOT_TOKEN || ''),
			'import.meta.env.VITE_TELEGRAM_CHANNEL_ID': JSON.stringify(process.env.VITE_TELEGRAM_CHANNEL_ID || ''),
			'import.meta.env.VITE_DISCORD_WEBHOOK_URL': JSON.stringify(process.env.VITE_DISCORD_WEBHOOK_URL || ''),
			'import.meta.env.VITE_DISCORD_USERNAME': JSON.stringify(process.env.VITE_DISCORD_USERNAME || ''),
		},
	}),
	extensionApi: 'chrome',
	modules: ['@wxt-dev/module-vue'],
	manifest: {
		name: 'Clipper Hub - 万能剪藏',
		version: pkg.version,
		description: '将网页内容一键收藏至多个平台的浏览器扩展，支持 Telegram、Discord 等多个平台，让你的灵感和收藏无处不在。',
		permissions: ['contextMenus', 'storage', 'notifications', 'scripting'],
		host_permissions: [
			'https://api.telegram.org/*',
			'https://discord.com/*',
			'https://discordapp.com/*',
			'<all_urls>'
		],
	},
});

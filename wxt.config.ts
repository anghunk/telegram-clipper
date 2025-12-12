import { defineConfig } from 'wxt';
import pkg from './package.json';

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            'arcoblue-6': '#2C3E50',
          },
        },
      },
    },
    define: {
      // 将环境变量注入到浏览器扩展中
      'import.meta.env.VITE_TELEGRAM_BOT_TOKEN': JSON.stringify(process.env.VITE_TELEGRAM_BOT_TOKEN || ''),
      'import.meta.env.VITE_TELEGRAM_CHANNEL_ID': JSON.stringify(process.env.VITE_TELEGRAM_CHANNEL_ID || ''),
    },
  }),
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: '一键TG频道助手',
    version: pkg.version,
    description: '右键点击选中的文字，一键发送到您的 Telegram 频道。支持编辑、添加标题、自动提取网页标题。',
    permissions: ['contextMenus', 'storage', 'notifications', 'scripting'],
    host_permissions: ['https://api.telegram.org/*', '<all_urls>'],
  }
});

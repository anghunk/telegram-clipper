/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_TELEGRAM_BOT_TOKEN?: string;
	readonly VITE_TELEGRAM_CHANNEL_ID?: string;
	readonly VITE_DISCORD_WEBHOOK_URL?: string;
	readonly VITE_DISCORD_USERNAME?: string;
	readonly VITE_NOTION_INTEGRATION_TOKEN?: string;
	readonly VITE_NOTION_DATABASE_ID?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

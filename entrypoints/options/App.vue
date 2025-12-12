<template>
  <div class="options-container">
    <h1>Telegram 配置</h1>

    <!-- 连接状态 -->
    <div class="status-box" :class="{ connected: isConfigured }">
      <span class="status-icon">{{ isConfigured ? "✅" : "⚪" }}</span>
      <span class="status-text">{{ isConfigured ? "已配置" : "未配置" }}</span>
    </div>

    <div class="form-group">
      <label for="botToken">Bot Token (机器人令牌)</label>
      <input
        type="password"
        id="botToken"
        v-model="botToken"
        :placeholder="envBotToken ? `默认: ${envBotToken.substring(0, 15)}...` : '例如: 123456789:AaBbCcDd...'"
      />
      <div class="help-text">请在 @BotFather 申请机器人的 Token</div>
    </div>

    <div class="form-group">
      <label for="channelId">Channel ID (频道 ID)</label>
      <input
        type="text"
        id="channelId"
        v-model="channelId"
        :placeholder="envChannelId ? `默认: ${envChannelId}` : '例如: @mychannel 或 -100123456789'"
      />
      <div class="help-text">记得将机器人添加为频道管理员</div>
    </div>

    <button @click="testConnection" :disabled="isLoading" class="btn-secondary">
      {{ isLoading ? "测试中..." : "测试连接" }}
    </button>
    <button @click="saveOptions" class="btn-primary">💾 保存设置</button>
    <button @click="testNotification" class="btn-secondary">🔔 测试通知</button>

    <div v-if="statusMessage" :class="['status', statusType]">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { browser } from 'wxt/browser';

const botToken = ref("");
const channelId = ref("");
const isConfigured = ref(false);
const isLoading = ref(false);
const statusMessage = ref("");
const statusType = ref("info");

// 从环境变量获取默认值
const envBotToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
const envChannelId = import.meta.env.VITE_TELEGRAM_CHANNEL_ID || '';

onMounted(() => {
  restoreOptions();
});

async function restoreOptions() {
  const items = await browser.storage.sync.get({
    telegramBotToken: envBotToken,
    telegramChannelId: envChannelId,
  }) as { telegramBotToken: string; telegramChannelId: string };
  
  botToken.value = items.telegramBotToken;
  channelId.value = items.telegramChannelId;
  updateConnectionStatus();
}

function updateConnectionStatus() {
  isConfigured.value = !!(botToken.value && channelId.value);
}

async function testConnection() {
  if (!botToken.value || !channelId.value) {
    showStatus("请先填写 Bot Token 和 Channel ID", "error");
    return;
  }

  isLoading.value = true;
  showStatus("正在测试连接...", "info");

  try {
    const url = `https://api.telegram.org/bot${botToken.value}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: channelId.value,
        text: "🔗 连接测试成功!\n这是来自 Chrome 插件的测试消息。",
      }),
    });

    const result = await response.json();

    if (result.ok) {
      showStatus("✅ 连接成功!测试消息已发送到频道", "success");
    } else {
      showStatus(`❌ 连接失败: ${result.description || "未知错误"}`, "error");
    }
  } catch (error: any) {
    showStatus(`❌ 网络错误: ${error.message}`, "error");
  } finally {
    isLoading.value = false;
  }
}

async function saveOptions() {
  if (!botToken.value || !channelId.value) {
    showStatus("请填写完整信息", "error");
    return;
  }

  await browser.storage.sync.set({
    telegramBotToken: botToken.value,
    telegramChannelId: channelId.value,
  });
  
  showStatus("✅ 设置已保存!", "success");
  updateConnectionStatus();
  setTimeout(() => {
    statusMessage.value = "";
  }, 3000);
}

async function testNotification() {
  try {
    const response = await browser.runtime.sendMessage({ action: "testNotification" }) as { success: boolean };
    if (response && response.success) {
      showStatus("✅ 通知已发送", "success");
    } else {
      showStatus("❌ 通知发送失败", "error");
    }
  } catch (error) {
    showStatus("❌ 通知发送失败", "error");
  }
}

function showStatus(message: string, type: string = "info") {
  statusMessage.value = message;
  statusType.value = type;
}
</script>

<style scoped>
body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f6f8;
  display: flex;
  justify-content: center;
  padding-top: 30px;
  margin: 0;
}

.options-container {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  width: 450px;
  max-width: 90%;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
}

.status-box {
  background-color: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

.status-box.connected {
  background-color: #d4edda;
  border-color: #28a745;
}

.status-icon {
  font-size: 20px;
}

.status-text {
  font-weight: 600;
  color: #495057;
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 600;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 14px;
  transition: border-color 0.2s;
}

input[type="text"]:focus,
input[type="password"]:focus {
  border-color: #2481cc;
  outline: none;
}

.help-text {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 10px;
}

.btn-primary {
  background-color: #2481cc;
  color: white;
}

.btn-primary:hover {
  background-color: #1a66a6;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(36, 129, 204, 0.3);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
}

button:active {
  transform: translateY(0);
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

.status {
  text-align: center;
  margin-top: 15px;
  padding: 10px;
  border-radius: 6px;
  font-weight: 500;
  min-height: 20px;
  transition: all 0.3s;
}

.status.success {
  background-color: #d4edda;
  color: #155724;
}

.status.error {
  background-color: #f8d7da;
  color: #721c24;
}

.status.info {
  background-color: #d1ecf1;
  color: #0c5460;
}
</style>

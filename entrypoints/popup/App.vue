<template>
  <div class="popup-container">
    <!-- 顶部标题栏 -->
    <div class="header">
      <h1>一键TG频道助手</h1>
      <button
        @click="toggleView"
        class="settings-btn"
        :title="currentView === 'main' ? '设置' : '返回'"
      >
        <svg v-if="currentView === 'main'" viewBox="0 0 24 24" width="20" height="20">
          <path
            fill="currentColor"
            d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"
          />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20">
          <path
            fill="currentColor"
            d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
          />
        </svg>
      </button>
    </div>

    <!-- 主面板 -->
    <div v-if="currentView === 'main'" class="main-view">
      <!-- 连接状态 -->
      <div class="status-bar" :class="{ configured: isConfigured }">
        <span class="status-icon">{{ isConfigured ? "✅" : "⚠️" }}</span>
        <span class="status-text">{{ isConfigured ? "已连接" : "未配置" }}</span>
      </div>

      <!-- 快捷输入区 -->
      <div class="input-section">
        <label>快速发送</label>
        <textarea
          v-model="quickMessage"
          placeholder="输入要发送的内容..."
          rows="6"
          @keydown.ctrl.enter="sendQuickMessage"
        ></textarea>
        <div class="input-footer">
          <button
            @click="sendQuickMessage"
            class="btn-send"
            :disabled="!quickMessage.trim() || !isConfigured"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
            发送 <span class="hint">(Ctrl + Enter 快捷发送)</span>
          </button>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <button @click="sendCurrentPage" class="action-btn" :disabled="!isConfigured">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path
              fill="currentColor"
              d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"
            />
          </svg>
          收藏当前页面
        </button>
      </div>

      <!-- 状态消息 -->
      <div v-if="statusMessage" :class="['status-message', statusType]">
        {{ statusMessage }}
      </div>
    </div>

    <!-- 设置页面 -->
    <div v-else class="settings-view">
      <h2>配置设置</h2>

      <div class="form-group">
        <label for="botToken">Bot Token (机器人令牌)</label>
        <div class="password-input-wrapper">
          <input
            :type="showPassword ? 'text' : 'password'"
            id="botToken"
            v-model="botToken"
            placeholder="例如: 123456789:AaBbCcDd..."
          />
          <button
            type="button"
            class="toggle-password"
            @click="showPassword = !showPassword"
            :title="showPassword ? '隐藏' : '显示'"
          >
            <svg v-if="!showPassword" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
              />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
              />
            </svg>
          </button>
        </div>
        <div class="help-text">请在 @BotFather 申请机器人的 Token</div>
      </div>

      <div class="form-group">
        <label for="channelId">Channel ID (频道 ID)</label>
        <input
          type="text"
          id="channelId"
          v-model="channelId"
          placeholder="例如: @mychannel 或 -100123456789"
        />
        <div class="help-text">记得将机器人添加为频道管理员</div>
      </div>

      <button @click="testConnection" :disabled="isLoading" class="btn-secondary">
        {{ isLoading ? "测试中..." : "测试连接" }}
      </button>
      <button @click="saveSettings" class="btn-primary">💾 保存设置</button>

      <div v-if="statusMessage" :class="['status', statusType]">
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { browser } from "wxt/browser";

const browserAPI = browser;

// 从环境变量获取默认值
const envBotToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
const envChannelId = import.meta.env.VITE_TELEGRAM_CHANNEL_ID || '';

// 视图状态
const currentView = ref<"main" | "settings">("main");

// 主面板状态
const quickMessage = ref("");
const isConfigured = ref(false);

// 设置页面状态
const botToken = ref("");
const channelId = ref("");
const isLoading = ref(false);
const showPassword = ref(false);

// 通用状态
const statusMessage = ref("");
const statusType = ref("info");

onMounted(() => {
  restoreSettings();
});

function toggleView() {
  currentView.value = currentView.value === "main" ? "settings" : "main";
  statusMessage.value = "";
}

async function restoreSettings() {
  const items = await browserAPI.storage.sync.get({
    telegramBotToken: envBotToken,
    telegramChannelId: envChannelId,
  }) as { telegramBotToken: string; telegramChannelId: string };
  botToken.value = items.telegramBotToken;
  channelId.value = items.telegramChannelId;
  isConfigured.value = !!(botToken.value && channelId.value);
}

// 快速发送消息
async function sendQuickMessage() {
  if (!quickMessage.value.trim()) {
    showStatus("请输入内容", "error");
    return;
  }

  if (!isConfigured.value) {
    showStatus("请先配置 Bot Token 和 Channel ID", "error");
    currentView.value = "settings";
    return;
  }

  try {
    const response = await browserAPI.runtime.sendMessage({
      action: "sendToTelegram",
      text: quickMessage.value,
    }) as { success: boolean };
    if (response && response.success) {
      showStatus("✅ 发送成功", "success");
      quickMessage.value = "";
      setTimeout(() => {
        statusMessage.value = "";
      }, 2000);
    } else {
      showStatus("❌ 发送失败", "error");
    }
  } catch (error: any) {
    showStatus(`❌ 错误: ${error.message}`, "error");
  }
}

// 收藏当前页面
async function sendCurrentPage() {
  try {
    const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];

    if (currentTab) {
      const message = `${currentTab.title}\n\n${currentTab.url}`;

      const response = await browserAPI.runtime.sendMessage({
        action: "sendToTelegram",
        text: message,
      }) as { success: boolean };
      if (response && response.success) {
        showStatus("✅ 页面已收藏", "success");
        setTimeout(() => {
          statusMessage.value = "";
        }, 2000);
      } else {
        showStatus("❌ 发送失败", "error");
      }
    }
  } catch (error: any) {
    showStatus(`❌ 错误: ${error.message}`, "error");
  }
}

// 测试连接
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

// 保存设置
async function saveSettings() {
  if (!botToken.value || !channelId.value) {
    showStatus("请填写完整信息", "error");
    return;
  }

  await browserAPI.storage.sync.set({
    telegramBotToken: botToken.value,
    telegramChannelId: channelId.value,
  });
  showStatus("✅ 设置已保存!", "success");
  isConfigured.value = true;
  setTimeout(() => {
    statusMessage.value = "";
    currentView.value = "main";
  }, 1500);
}

function showStatus(message: string, type: string = "info") {
  statusMessage.value = message;
  statusType.value = type;
}
</script>

<style scoped lang="less">
@import "./style.less";
</style>

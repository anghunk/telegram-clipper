<template>
  <div class="popup-container">
    <!-- 顶部标题栏 -->
    <div class="header">
      <h1>Clipper Hub - 万能剪藏</h1>
      <button
        @click="openSettings"
        class="settings-btn"
        title="打开设置"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            fill="currentColor"
            d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"
          />
        </svg>
      </button>
    </div>

    <!-- 主面板 -->
    <div class="main-view">
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
        
        <!-- 平台选择 -->
        <div v-if="availablePlatforms.length > 0" class="platform-selector">
          <div class="selector-header">
            <label>发送到:</label>
            <button @click="toggleAll" class="toggle-all-btn" type="button">
              {{ selectedPlatforms.length === availablePlatforms.length ? '取消全选' : '全选' }}
            </button>
          </div>
          <div class="platform-chips">
            <button
              v-for="platform in availablePlatforms"
              :key="platform.id"
              @click="togglePlatform(platform.id)"
              :class="['platform-chip', { active: selectedPlatforms.includes(platform.id) }]"
              type="button"
            >
              <!-- <span class="platform-icon">{{ platform.icon }}</span> -->
              <span class="platform-name">{{ platform.name }}</span>
              <!-- <svg v-if="selectedPlatforms.includes(platform.id)" class="check-icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg> -->
            </button>
          </div>
        </div>
        
        <div class="input-footer">
          <button
            @click="sendQuickMessage"
            class="btn-send"
            :disabled="!quickMessage.trim() || !isConfigured || isSending || selectedPlatforms.length === 0"
          >
            <svg v-if="!isSending" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
            <span v-if="isSending" class="spinner"></span>
            {{ isSending ? '发送中...' : '发送' }} <span v-if="!isSending" class="hint">(Ctrl + Enter 快捷发送)</span>
          </button>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <button @click="sendCurrentPage" class="action-btn" :disabled="!isConfigured || isSending">
          <svg v-if="!isSending" viewBox="0 0 24 24" width="16" height="16">
            <path
              fill="currentColor"
              d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"
            />
          </svg>
          <span v-if="isSending" class="spinner"></span>
          {{ isSending ? '发送中...' : '收藏当前页面' }}
        </button>
      </div>

      <!-- 状态消息 -->
      <div v-if="statusMessage" :class="['status-message', statusType]">
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { browser } from "wxt/browser";
import { hasAnyConfigured, loadAllConfigs, getAllPlatforms, type PlatformType } from "@/lib/platforms";

const browserAPI = browser;

// 主面板状态
const quickMessage = ref("");
const isConfigured = ref(false);
const isSending = ref(false);

// 通用状态
const statusMessage = ref("");
const statusType = ref("info");

// 平台选择
const availablePlatforms = ref<Array<{ id: PlatformType; name: string; icon: string; enabled: boolean }>>([]);
const selectedPlatforms = ref<PlatformType[]>([]);

onMounted(() => {
  restoreSettings();
});

// 打开设置页面
function openSettings() {
  // 在新标签页中打开 options 页面
  browserAPI.tabs.create({
    url: '/options.html'
  });
}

async function restoreSettings() {
  try {
    isConfigured.value = await hasAnyConfigured();
    
    // 加载所有已启用的平台
    const configs = await loadAllConfigs();
    const platforms = getAllPlatforms();
    
    availablePlatforms.value = platforms
      .filter(p => configs[p.meta.id].enabled)
      .map(p => ({
        id: p.meta.id,
        name: p.meta.name,
        icon: p.meta.icon,
        enabled: configs[p.meta.id].enabled
      }));
    
    // 默认选中所有已启用的平台
    selectedPlatforms.value = availablePlatforms.value.map(p => p.id);
  } catch (error) {
    console.error("加载配置失败:", error);
  }
}

// 快速发送消息
async function sendQuickMessage() {
  if (!quickMessage.value.trim()) {
    showStatus("请输入内容", "error");
    return;
  }

  if (!isConfigured.value) {
    showStatus("请先配置平台", "error");
    openSettings();
    return;
  }

  if (selectedPlatforms.value.length === 0) {
    showStatus("请至少选择一个平台", "error");
    return;
  }

  isSending.value = true;
  try {
    const response = (await browserAPI.runtime.sendMessage({
      action: "sendToSelectedPlatforms",
      text: quickMessage.value,
      platforms: selectedPlatforms.value,
    })) as { success: boolean; results?: Record<string, any> };
    
    if (response && response.success) {
      // 统计发送结果
      const results = response.results || {};
      const successCount = Object.values(results).filter((r: any) => r.success).length;
      const totalCount = Object.keys(results).length;
      
      if (successCount > 0) {
        showStatus(`✅ 发送成功 (${successCount}/${totalCount} 个平台)`, "success");
        quickMessage.value = "";
        setTimeout(() => {
          statusMessage.value = "";
        }, 3000);
      } else {
        showStatus("❌ 所有平台发送失败", "error");
      }
    } else {
      showStatus("❌ 发送失败", "error");
    }
  } catch (error: any) {
    showStatus(`❌ 错误: ${error.message}`, "error");
  } finally {
    isSending.value = false;
  }
}

// 收藏当前页面
async function sendCurrentPage() {
  if (selectedPlatforms.value.length === 0) {
    showStatus("请至少选择一个平台", "error");
    return;
  }

  isSending.value = true;
  try {
    const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];

    if (currentTab) {
      const message = `${currentTab.title}\n\n${currentTab.url}`;

      const response = (await browserAPI.runtime.sendMessage({
        action: "sendToSelectedPlatforms",
        text: message,
        platforms: selectedPlatforms.value,
      })) as { success: boolean; results?: Record<string, any> };
      
      if (response && response.success) {
        const results = response.results || {};
        const successCount = Object.values(results).filter((r: any) => r.success).length;
        const totalCount = Object.keys(results).length;
        
        if (successCount > 0) {
          showStatus(`✅ 页面已收藏 (${successCount}/${totalCount} 个平台)`, "success");
          setTimeout(() => {
            statusMessage.value = "";
          }, 3000);
        } else {
          showStatus("❌ 所有平台发送失败", "error");
        }
      } else {
        showStatus("❌ 发送失败", "error");
      }
    }
  } catch (error: any) {
    showStatus(`❌ 错误: ${error.message}`, "error");
  } finally {
    isSending.value = false;
  }
}

// 切换平台选择
function togglePlatform(platformId: PlatformType) {
  const index = selectedPlatforms.value.indexOf(platformId);
  if (index > -1) {
    selectedPlatforms.value.splice(index, 1);
  } else {
    selectedPlatforms.value.push(platformId);
  }
}

// 全选/取消全选
function toggleAll() {
  if (selectedPlatforms.value.length === availablePlatforms.value.length) {
    selectedPlatforms.value = [];
  } else {
    selectedPlatforms.value = availablePlatforms.value.map(p => p.id);
  }
}

function showStatus(message: string, type: string = "info") {
  statusMessage.value = message;
  statusType.value = type;
}
</script>

<style scoped lang="less">
@import "./style.less";
</style>

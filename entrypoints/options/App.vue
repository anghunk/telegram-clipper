<template>
  <div class="options-container">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>Clipper Hub - 设置</h1>
      </div>
      
      <div class="sidebar-section">
        <h3>平台管理</h3>
        <div class="platform-list">
          <button
            v-for="platform in platforms"
            :key="platform.meta.id"
            :class="['platform-item', { active: activePlatformTab === platform.meta.id }]"
            @click="activePlatformTab = platform.meta.id"
          >
            <div class="platform-info">
              <span class="platform-name">{{ platform.meta.name }}</span>
            </div>
            <div class="platform-status">
              <span 
                v-if="platformConfigs[platform.meta.id].enabled" 
                class="status-badge enabled"
                title="已启用"
              >
                ON
              </span>
              <span v-else class="status-badge disabled" title="未启用">OFF</span>
            </div>
          </button>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <div class="content-header">
        <h2>{{ currentPlatform?.meta.name }}</h2>
        <p class="description">{{ currentPlatform?.meta.description }}</p>
      </div>

      <!-- Telegram 配置 -->
      <div v-if="activePlatformTab === 'telegram'" class="config-form">
        <div class="form-group">
          <label class="switch-label">
            <input 
              type="checkbox" 
              v-model="platformConfigs.telegram.enabled"
              class="switch-input"
            />
            <span class="switch-slider"></span>
            <span class="switch-text">启用 Telegram</span>
          </label>
        </div>

        <div class="form-group">
          <label>Bot Token</label>
          <input
            type="text"
            v-model="platformConfigs.telegram.botToken"
            placeholder="输入 Bot Token"
          />
          <small>在 <a href="https://t.me/BotFather" target="_blank">@BotFather</a> 申请机器人获取 Token</small>
        </div>

        <div class="form-group">
          <label>Channel ID</label>
          <input
            type="text"
            v-model="platformConfigs.telegram.channelId"
            placeholder="@mychannel 或 -100123456789"
          />
          <small>记得将机器人添加为频道管理员</small>
        </div>
      </div>

      <!-- Discord 配置 -->
      <div v-if="activePlatformTab === 'discord'" class="config-form">
        <div class="form-group">
          <label class="switch-label">
            <input 
              type="checkbox" 
              v-model="platformConfigs.discord.enabled"
              class="switch-input"
            />
            <span class="switch-slider"></span>
            <span class="switch-text">启用 Discord</span>
          </label>
        </div>

        <div class="form-group">
          <label>Webhook URL</label>
          <input
            type="text"
            v-model="platformConfigs.discord.webhookUrl"
            placeholder="https://discord.com/api/webhooks/..."
          />
          <small>在 Discord 频道设置中创建 Webhook</small>
        </div>

      </div>

      <!-- Notion 配置 -->
      <div v-if="activePlatformTab === 'notion'" class="config-form">
        <div class="form-group">
          <label class="switch-label">
            <input 
              type="checkbox" 
              v-model="platformConfigs.notion.enabled"
              class="switch-input"
            />
            <span class="switch-slider"></span>
            <span class="switch-text">启用 Notion</span>
          </label>
        </div>

        <div class="form-group">
          <label>Integration Token</label>
          <input
            type="text"
            v-model="platformConfigs.notion.integrationToken"
            placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
          <small>在 <a href="https://www.notion.so/my-integrations" target="_blank">Notion Integrations</a> 创建 Integration 获取 Token</small>
        </div>

        <div class="form-group">
          <label>Database ID</label>
          <input
            type="text"
            v-model="platformConfigs.notion.databaseId"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
          <small>从数据库页面 URL 中提取，并将 Integration 连接到该数据库</small>
        </div>

        <div class="form-group">
          <label>高级配置</label>
          <details style="margin-top: 8px;">
            <summary style="cursor: pointer; color: #666; font-size: 13px;">属性名称映射</summary>
            <div style="margin-top: 12px; padding: 12px; background: #f9f9f9; border-radius: 6px;">
              <div style="margin-bottom: 12px;">
                <label style="font-size: 12px; color: #666;">标题字段名称</label>
                <input
                  type="text"
                  v-model="platformConfigs.notion.titleProperty"
                  placeholder="标题"
                  style="margin-top: 4px;"
                />
              </div>
              <div style="margin-bottom: 12px;">
                <label style="font-size: 12px; color: #666;">内容字段名称</label>
                <input
                  type="text"
                  v-model="platformConfigs.notion.contentProperty"
                  placeholder="内容"
                  style="margin-top: 4px;"
                />
              </div>
              <div>
                <label style="font-size: 12px; color: #666;">来源字段名称</label>
                <input
                  type="text"
                  v-model="platformConfigs.notion.sourceProperty"
                  placeholder="来源"
                  style="margin-top: 4px;"
                />
              </div>
            </div>
          </details>
          <small style="display: block; margin-top: 8px;">
            📚 没有数据库？<a href="https://anghunk.notion.site/2cad17511b968031a7ebeecd5e279c6a" target="_blank">复制该副本模板</a>
          </small>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <button @click="testConnection" :disabled="isLoading" class="btn btn-secondary">
          {{ isLoading ? '测试中...' : '测试连接' }}
        </button>
        <button @click="saveSettings" class="btn btn-primary">
          保存设置
        </button>
      </div>

      <!-- 状态消息 -->
      <div v-if="statusMessage" :class="['status-message', statusType]">
        {{ statusMessage }}
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { browser } from "wxt/browser";
import {
  loadAllConfigs,
  saveAllConfigs,
  getAllPlatforms,
  testPlatformConnection,
  type AllPlatformConfigs,
  type PlatformType,
  defaultConfigs,
} from "@/lib/platforms";

const browserAPI = browser;

// 状态
const activePlatformTab = ref<PlatformType>("telegram");
const platformConfigs = ref<AllPlatformConfigs>({ ...defaultConfigs });
const isLoading = ref(false);
const statusMessage = ref("");
const statusType = ref("info");

// 获取所有平台
const platforms = getAllPlatforms();

// 当前选中的平台
const currentPlatform = computed(() => 
  platforms.find(p => p.meta.id === activePlatformTab.value)
);

// 监听平台切换，清除状态消息
watch(activePlatformTab, () => {
  statusMessage.value = "";
  statusType.value = "info";
});

onMounted(() => {
  restoreSettings();
});

async function restoreSettings() {
  try {
    platformConfigs.value = await loadAllConfigs();
  } catch (error) {
    console.error("加载配置失败:", error);
    showStatus("❌ 加载配置失败", "error");
  }
}

// 测试连接
async function testConnection() {
  const platformType = activePlatformTab.value;
  const config = platformConfigs.value[platformType];

  isLoading.value = true;
  showStatus("正在测试连接...", "info");

  try {
    const result = await testPlatformConnection(platformType, config);

    if (result.success) {
      showStatus(`✅ 连接成功！测试消息已发送`, "success");
    } else {
      showStatus(`❌ 连接失败: ${result.error || "未知错误"}`, "error");
    }
  } catch (error: any) {
    showStatus(`❌ 网络错误: ${error.message}`, "error");
  } finally {
    isLoading.value = false;
  }
}

// 保存设置
async function saveSettings() {
  try {
    await saveAllConfigs(platformConfigs.value);
    showStatus("✅ 设置已保存!", "success");
    setTimeout(() => {
      statusMessage.value = "";
    }, 3000);
  } catch (error: any) {
    showStatus(`❌ 保存失败: ${error.message}`, "error");
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

<template>
  <div class="edit-container">
    <!-- 顶部标题栏 -->
    <div class="header">
      <h1>编辑剪藏内容</h1>
    </div>

    <div class="content">
      <div class="form-group">
        <label for="titleInput">自定义标题</label>
        <input
          type="text"
          id="titleInput"
          v-model="titleInput"
          placeholder="默认抓取网站 title 标题"
          maxlength="200"
          @keypress.enter="handleSave"
        />
      </div>

      <div class="form-group content-group">
        <label>内容编辑</label>
        <div class="content-textarea">
          <textarea id="contentInput" class="" v-model="contentText"></textarea>
          <!-- 来源信息单独显示 -->
          <div v-if="includeSource && editData?.url" class="source-info">
            <span class="source-label">来源:</span>
            <a :href="editData.url" target="_blank" class="source-link">{{
              editData.url
            }}</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 平台选择 -->
    <div v-if="availablePlatforms.length > 0" class="platform-selector">
      <div class="selector-header">
        <label>发送到:</label>
        <button @click="toggleAll" class="toggle-all-btn" type="button">
          {{
            selectedPlatforms.length === availablePlatforms.length ? "取消全选" : "全选"
          }}
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

    <div class="button-group">
      <button @click="handleCancel" class="btn btn-secondary">取消</button>
      <button
        @click="handleSave"
        :disabled="isSending || selectedPlatforms.length === 0"
        class="btn btn-primary"
      >
        <svg v-if="!isSending" viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
        <span v-if="isSending" class="spinner"></span>
        {{ isSending ? "发送中..." : "保存并发送到所有平台" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { browser } from "wxt/browser";
import { ElMessage } from 'element-plus';
import { loadAllConfigs, getAllPlatforms, type PlatformType } from "@/lib/platforms";

const browserAPI = browser;

const titleInput = ref("");
const contentText = ref("");
const includeSource = true; // 默认始终包含来源
const isSending = ref(false);
const editData = ref<{
  content: string;
  contentHTML: string;
  url: string;
  pageTitle: string;
} | null>(null);

// 平台选择
const availablePlatforms = ref<Array<{ id: PlatformType; name: string; icon: string; enabled: boolean }>>([]);
const selectedPlatforms = ref<PlatformType[]>([]);

onMounted(async () => {
  await loadEditData();
  // 自动聚焦到标题输入框
  setTimeout(() => {
    document.getElementById("titleInput")?.focus();
  }, 100);

  // 加载平台配置
  await loadPlatforms();
});

onUnmounted(() => {
  // 清理存储的临时数据
  browserAPI.storage.local.remove([
    "edit_content",
    "edit_content_html",
    "edit_url",
    "edit_title",
  ]);
});

// 移除了设置加载和切换功能，始终包含来源

async function loadPlatforms() {
  try {
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
    console.error("加载平台失败:", error);
  }
}

async function loadEditData() {
  try {
    const result = await browserAPI.storage.local.get([
      "edit_content",
      "edit_content_html",
      "edit_url",
      "edit_title",
    ]);

    editData.value = {
      content: (result.edit_content as string) || "",
      contentHTML: (result.edit_content_html as string) || "",
      url: (result.edit_url as string) || "",
      pageTitle: (result.edit_title as string) || "",
    };

    // 自动填充网页标题到标题输入框
    if (editData.value?.pageTitle) {
      titleInput.value = editData.value.pageTitle;
    }

    // 加载内容文本
    loadContentText();
  } catch (error) {
    console.error("数据加载失败:", error);
    showError("数据加载失败");
  }
}

function loadContentText() {
  if (!editData.value) return;

  // 如果content没有换行，尝试从 contentHTML提取
  let content = editData.value.content;
  if (content && !content.includes("\n") && editData.value.contentHTML) {
    content = htmlToTextWithBreaks(editData.value.contentHTML);
  }

  // 如果内容就是 URL（收藏网址的情况），不显示在内容区域，因为已经在来源栏目显示了
  if (content && editData.value.url && content.trim() === editData.value.url.trim()) {
    contentText.value = "";
  } else {
    contentText.value = content || "";
  }
}

async function handleSave() {
  if (!editData.value) {
    ElMessage.error('数据丢失，请重试');
    return;
  }

  if (selectedPlatforms.value.length === 0) {
    ElMessage.error('请至少选择一个平台');
    return;
  }

  const customTitle = titleInput.value.trim();
  
  // 获取编辑后的内容
  let editedContent = contentText.value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line)
    .join("\n");

  // 如果内容只是 URL（收藏网址的情况），则不添加内容
  const isUrlOnly = editedContent.trim() && editData.value?.url && 
                    editedContent.trim() === editData.value.url.trim();

  // 格式化消息
  const parts = [];
  
  // 添加标题
  if (customTitle) {
    parts.push(customTitle);
  }
  
  // 添加内容（仅当内容不是 URL 时）
  if (editedContent.trim() && !isUrlOnly) {
    parts.push(editedContent);
  }
  
  // 添加来源 URL（如果有的话）
  if (includeSource && editData.value.url) {
    parts.push(editData.value.url);
  }
  
  // 检查是否至少有内容
  if (parts.length === 0) {
    ElMessage.error('内容不能为空');
    return;
  }
  
  // 用双换行连接各部分
  const message = parts.join("\n\n");

  // 发送到选定的平台
  isSending.value = true;
  try {
    const response = (await browserAPI.runtime.sendMessage({
      action: "sendToSelectedPlatforms",
      text: message,
      platforms: selectedPlatforms.value,
    })) as { success?: boolean; results?: Record<string, { success: boolean; error?: string }> };
    
    if (response && response.success) {
      // 检查是否有平台发送成功
      const results = response.results || {};
      const successPlatforms = Object.entries(results)
        .filter(([_, r]) => r.success)
        .map(([platform]) => platform);
      const failedPlatforms = Object.entries(results)
        .filter(([_, r]) => !r.success)
        .map(([platform, r]) => `${platform}: ${r.error}`);
      
      if (successPlatforms.length > 0) {
        if (failedPlatforms.length === 0) {
          // 全部成功
          ElMessage.success({
            message: `发送成功！已发送到: ${successPlatforms.join(', ')}`,
            duration: 2000,
            onClose: () => window.close()
          });
        } else {
          // 部分成功
          ElMessage.warning({
            message: `部分发送成功\n成功: ${successPlatforms.join(', ')}\n失败: ${failedPlatforms.join(', ')}`,
            duration: 3000,
            onClose: () => window.close()
          });
        }
      } else {
        // 全部失败
        const errors = failedPlatforms.join('\n');
        ElMessage.error(`发送失败\n${errors || '未知错误'}`);
      }
    } else {
      ElMessage.error('发送失败，请检查平台配置');
    }
  } catch (error) {
    console.error("发送失败:", error);
    ElMessage.error('发送失败，请重试');
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

function handleCancel() {
  window.close();
}

function showError(message: string) {
  contentText.value = `❌ ${message}`;
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function htmlToTextWithBreaks(html: string): string {
  if (!html) return "";

  let text = html;

  // 处理 <br> 标签
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // 在块级元素结束标签后添加换行
  const blockTags = [
    "p",
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "li",
    "tr",
    "blockquote",
    "pre",
    "article",
    "section",
  ];
  blockTags.forEach((tag) => {
    const regex = new RegExp(`</${tag}>`, "gi");
    text = text.replace(regex, `</${tag}>\n`);
  });

  // 移除HTML标签
  const div = document.createElement("div");
  div.innerHTML = text;
  text = div.textContent || div.innerText || "";

  // 清理
  text = text
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
  // 把连续空行压缩成单个换行
  return text.replace(/\n{2,}/g, "\n").trim();
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.edit-container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
  background: #f4f4f5;
  color: #000000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 顶部标题栏 - Telegram 蓝色 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #3390ec;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.header h1 {
  color: white;
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  letter-spacing: 0.3px;
}

.content {
  flex: 1;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: #f4f4f5;
  overflow: hidden;
  min-height: 0;
}

.form-group {
  margin-bottom: 16px;
}

.content-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #707579;
  font-weight: 500;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e4e4e5;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: #ffffff;
  color: #000000;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #3390ec;
}

.form-group input::placeholder {
  color: #a2acb4;
}

.preview-box {
  flex: 1;
  width: 100%;
  background: #ffffff;
  border: 1px solid #e4e4e5;
  border-radius: 12px;
  padding: 16px;
  font-size: 14px;
  font-family: inherit;
  color: #000000;
  overflow-y: scroll !important;
  overflow-x: hidden !important;
  line-height: 1.6;
  transition: all 0.2s ease;
  resize: none;
  box-sizing: border-box;
  word-wrap: break-word;
  white-space: normal;
  scrollbar-width: thin;
  scrollbar-color: #c7c7cc #f2f2f7;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.preview-box::-webkit-scrollbar {
  width: 8px;
}

.preview-box::-webkit-scrollbar-track {
  background: #f2f2f7;
  border-radius: 4px;
}

.preview-box::-webkit-scrollbar-thumb {
  background: #c7c7cc;
  border-radius: 4px;
}

.preview-box::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.preview-box :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 4px 0;
  transform: none !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: block;
  max-height: 400px;
}

.preview-box :deep(img.emoji) {
  display: inline;
  max-height: 1.2em;
  margin: 0 2px;
  vertical-align: middle;
  max-width: 1.2em;
}

.preview-box:empty:before {
  content: "正在加载内容...";
  color: #a2acb4;
  font-style: italic;
}

.preview-box:focus {
  outline: none;
  border-color: #3390ec;
}

/* textarea 样式 */
.content-textarea {
  flex: 1;
  width: 100%;
  background: #ffffff;
  border: 1px solid #e4e4e5;
  border-radius: 12px;
  padding: 16px;
  font-size: 14px;
  font-family: inherit;
  color: #000000;
  line-height: 1.6;
  transition: all 0.2s ease;
  resize: vertical;
  box-sizing: border-box;
  scrollbar-color: #c7c7cc #f2f2f7;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.content-textarea textarea {
  flex: 1;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  resize: none;
  overflow-y: auto;
  scrollbar-width: thin;
  word-wrap: break-word;
}

.content-textarea::-webkit-scrollbar {
  width: 8px;
}

.content-textarea::-webkit-scrollbar-track {
  background: #f2f2f7;
  border-radius: 4px;
}

.content-textarea::-webkit-scrollbar-thumb {
  background: #c7c7cc;
  border-radius: 4px;
}

.content-textarea::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.content-textarea:focus {
  outline: none;
  border-color: #3390ec;
}

.content-textarea::placeholder {
  color: #a2acb4;
  font-style: italic;
}

.button-group {
  flex-shrink: 0;
  flex-grow: 0;
  padding: 12px 20px 20px 20px;
  background: #f4f4f5;
  display: flex;
  gap: 12px;
  align-items: center;
  box-sizing: border-box;
}

.btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-primary {
  background: #3390ec;
  color: white;
}

.btn-primary:hover {
  background: #2b7cd3;
}

.btn-secondary {
  background: #f4f4f5;
  color: #3390ec;
  border: 1px solid #e4e4e5;
}

.btn-secondary:hover {
  background: #e8e8e9;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading 动画 */
.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 6px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 平台选择器 */
.platform-selector {
  margin: 0 20px 10px;
  padding: 12px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e4e4e5;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.selector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.selector-header label {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #707579;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toggle-all-btn {
  padding: 4px 10px;
  font-size: 12px;
  background: transparent;
  color: #3390ec;
  border: 1px solid #3390ec;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  height: auto;
  font-weight: 500;
}

.toggle-all-btn:hover {
  background: #3390ec;
  color: white;
}

.platform-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.platform-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f4f4f5;
  border: 1.5px solid #e4e4e5;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 400;
  color: #707579;
  cursor: pointer;
  transition: all 0.2s;
  height: auto;
}

.platform-chip:hover {
  border-color: #3390ec;
  background: #f0f7ff;
}

.platform-chip.active {
  background: #3390ec;
  border-color: #3390ec;
  color: white;
}

.platform-name {
  font-weight: 500;
}

.check-icon {
  flex-shrink: 0;
  margin-left: 2px;
}

/* 来源信息样式 */
.source-info {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e5ea;
  font-size: 13px;
  color: #666;
}

.source-label {
  color: #666;
  margin-right: 4px;
}

.source-link {
  color: #007aff;
  text-decoration: none;
  word-break: break-all;
}

.source-link:hover {
  text-decoration: underline;
}
</style>

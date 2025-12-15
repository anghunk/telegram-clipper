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
          placeholder="输入标题(可选)"
          maxlength="100"
          @keypress.enter="handleSave"
        />
      </div>

      <div class="form-group content-group">
        <label>内容编辑</label>
        <div
          id="contentInput"
          class="preview-box"
          contenteditable="true"
          v-html="contentHTML"
          @input="onContentInput"
        ></div>
      </div>
    </div>

    <div class="button-group">
      <button @click="handleCancel" class="btn btn-secondary">取消</button>
      <button @click="handleSave" :disabled="isSending" class="btn btn-primary">
        <svg v-if="!isSending" viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
        <span v-if="isSending" class="spinner"></span>
        {{ isSending ? '发送中...' : '保存并发送到所有平台' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { browser } from "wxt/browser";
import { ElMessage } from 'element-plus';

const browserAPI = browser;

const titleInput = ref("");
const contentHTML = ref("");
const includeSource = true; // 默认始终包含来源
const isSending = ref(false);
const editData = ref<{
  content: string;
  contentHTML: string;
  url: string;
  pageTitle: string;
} | null>(null);

onMounted(async () => {
  await loadEditData();
  // 自动聚焦到标题输入框
  setTimeout(() => {
    document.getElementById("titleInput")?.focus();
  }, 100);
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

    // 显示内容预览
    updateContentPreview();
  } catch (error) {
    console.error("数据加载失败:", error);
    showError("数据加载失败");
  }
}

function updateContentPreview() {
  if (!editData.value) return;

  console.log("=== DEBUG ===");
  console.log("原始content:", JSON.stringify(editData.value.content));
  console.log(
    "contentHTML:",
    editData.value.contentHTML ? editData.value.contentHTML.substring(0, 200) : "empty"
  );

  // 如果content没有换行，尝试从contentHTML提取
  let content = editData.value.content;
  if (content && !content.includes("\n") && editData.value.contentHTML) {
    console.log("content没有换行，尝试从HTML提取...");
    content = htmlToTextWithBreaks(editData.value.contentHTML);
    console.log("从HTML提取后:", JSON.stringify(content));
  }

  const url = editData.value.url;

  // 始终使用纯文本（带换行）来显示，确保段落正确
  if (content && content.trim()) {
    const lines = content.split("\n");
    let htmlContent = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        htmlContent += `<p style="margin: 0 0 6px 0;">${escapeHtml(line)}</p>`;
      }
    }

    // 添加来源信息
    if (includeSource && url) {
      htmlContent += `<div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e5ea;"><span style="color: #666; font-size: 13px;">来源: <a href="${url}" target="_blank" style="color: #007aff; text-decoration: none;">${url}</a></span></div>`;
    }

    contentHTML.value = htmlContent;
  } else {
    contentHTML.value = "无内容";
  }
}

function onContentInput(event: Event) {
  const target = event.target as HTMLDivElement;
  contentHTML.value = target.innerHTML;
}

async function handleSave() {
  if (!editData.value) {
    ElMessage.error('数据丢失，请重试');
    return;
  }

  const customTitle = titleInput.value.trim();
  const contentDiv = document.getElementById("contentInput");

  // 获取编辑后的内容，并清理多余换行
  let editedContent = contentDiv?.innerText || contentDiv?.textContent || "";
  editedContent = editedContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line)
    .join("\n");

  if (!editedContent.trim()) {
    ElMessage.error('内容不能为空');
    return;
  }

  // 移除内容中的"来源:"行
  editedContent = editedContent
    .split("\n")
    .filter((line) => !line.startsWith("来源:"))
    .join("\n");

  // 格式化消息
  let message = "";
  if (customTitle) {
    message = `${customTitle}\n\n${editedContent}`;
  } else {
    message = editedContent;
  }

  // 添加来源链接
  if (includeSource && editData.value.url) {
    message += `\n\n来源: ${editData.value.url}`;
  }

  // 发送到所有已启用的平台
  isSending.value = true;
  try {
    const response = (await browserAPI.runtime.sendMessage({
      action: "sendToAllPlatforms",
      text: message,
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

function handleCancel() {
  window.close();
}

function showError(message: string) {
  contentHTML.value = `<div style="color: #dc2626; font-weight: 500;">❌ ${escapeHtml(
    message
  )}</div>`;
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
  min-height: 200px;
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
  to { transform: rotate(360deg); }
}
</style>

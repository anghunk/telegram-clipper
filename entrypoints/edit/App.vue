<template>
  <div class="edit-container">
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
        <div class="label-row">
          <label>内容编辑</label>
          <label
            class="source-toggle"
            :class="{ active: includeSource }"
            @click="toggleSource"
          >
            <input type="checkbox" v-model="includeSource" />
            <svg class="toggle-icon" viewBox="0 0 24 24">
              <path
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                fill="currentColor"
              />
            </svg>
            <span class="toggle-text">来源</span>
          </label>
        </div>
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
      <button @click="handleSave" class="btn btn-primary">保存收藏</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { browser } from "wxt/browser";

const browserAPI = browser;

const titleInput = ref("");
const contentHTML = ref("");
const includeSource = ref(true);
const editData = ref<{
  content: string;
  contentHTML: string;
  url: string;
  pageTitle: string;
} | null>(null);

onMounted(async () => {
  await loadEditData();
  await loadUserSettings();
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

async function loadUserSettings() {
  try {
    const result = await browserAPI.storage.sync.get(["includeSource"]);
    includeSource.value =
      result.includeSource !== undefined ? (result.includeSource as boolean) : true;
  } catch (error) {
    console.error("加载设置失败:", error);
  }
}

function saveUserSettings() {
  browserAPI.storage.sync.set({
    includeSource: includeSource.value,
  });
}

function toggleSource() {
  includeSource.value = !includeSource.value;
  saveUserSettings();
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
    if (url) {
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
    alert("数据丢失，请重试");
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
    alert("内容不能为空");
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

  // 如果勾选了来源开关，添加来源链接
  if (includeSource.value && editData.value.url) {
    message += `\n\n来源: ${editData.value.url}`;
  }

  // 发送到 Telegram
  try {
    const response = (await browserAPI.runtime.sendMessage({
      action: "sendToTelegram",
      text: message,
    })) as { success?: boolean };
    if (response && response.success) {
      window.close();
    } else {
      alert("发送失败,请重试");
    }
  } catch (error) {
    console.error("发送失败:", error);
    alert("发送失败,请重试");
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
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background: #ffffff;
  color: #1d1d1f;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: #ffffff;
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
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.01em;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.label-row > label:first-child {
  margin-bottom: 0;
}

.source-toggle {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 5px 12px;
  border-radius: 6px;
  background: #f2f2f7;
  font-size: 13px;
  font-weight: 500;
  color: #999;
  transition: all 0.2s ease;
  user-select: none;
  border: 1px solid #e5e5ea;
}

.source-toggle:hover {
  background: #e5e5ea;
}

.source-toggle input {
  display: none;
}

.source-toggle.active {
  background: #e3f2fd;
  color: #007aff;
  border-color: #007aff;
}

.source-toggle .toggle-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transform: translateY(2px);
}

.source-toggle .toggle-text {
  font-size: 13px;
  line-height: 1.2;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  background: #ffffff;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-group input::placeholder {
  color: #9ca3af;
}

.preview-box {
  flex: 1;
  width: 100%;
  background: #ffffff;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
  font-family: inherit;
  color: #1d1d1f;
  overflow-y: scroll !important;
  overflow-x: hidden !important;
  line-height: 1.5;
  transition: all 0.2s ease;
  resize: none;
  box-sizing: border-box;
  min-height: 200px;
  word-wrap: break-word;
  white-space: normal;
  scrollbar-width: thin;
  scrollbar-color: #007aff #f0f0f0;
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
  color: #9ca3af;
  font-style: italic;
}

.preview-box:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.button-group {
  flex-shrink: 0;
  flex-grow: 0;
  padding: 8px 20px 20px 20px;
  background: #ffffff;
  border-top: 1px solid #f2f2f7;
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
  font-size: 16px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  letter-spacing: -0.01em;
}

.btn-primary {
  background: #007aff;
  color: white;
}

.btn-primary:hover {
  background: #0056cc;
}

.btn-secondary {
  background: #f2f2f7;
  color: #1d1d1f;
  border: 1px solid #d2d2d7;
}

.btn-secondary:hover {
  background: #e5e5ea;
}
</style>

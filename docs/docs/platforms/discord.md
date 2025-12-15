# Discord 平台配置指南

本文档介绍如何配置 Discord 平台以使用 Clipper Hub。

## 📋 前置要求

- 一个 Discord 账号
- 对目标服务器有管理权限或能够管理 Webhook 的权限

## 🌐 什么是 Discord Webhook？

Discord Webhook 是一种简单的方式，允许外部应用向 Discord 频道发送消息，无需创建完整的 Bot。

**优点：**
- ✅ 配置简单，无需 Bot Token
- ✅ 无需验证和授权流程
- ✅ 可以自定义发送者名称和头像
- ✅ 支持富文本消息

## 🔧 第一步：创建 Webhook

### 1. 进入服务器设置

1. 打开 Discord 应用或网页版
2. 选择你要发送消息的服务器
3. 右键点击要接收消息的频道
4. 选择"编辑频道"（或"频道设置"）

### 2. 创建 Webhook

1. 在左侧菜单中选择"整合"（Integrations）
2. 点击"Webhook"部分
3. 点击"新建 Webhook"按钮
4. 为 Webhook 命名（例如：`Clipper Hub`）
5. （可选）上传一个头像图标
6. 选择要发送消息的频道
7. 点击"复制 Webhook URL"按钮

### 3. Webhook URL 格式

复制的 URL 应该类似于：

```
https://discord.com/api/webhooks/1234567890123456789/AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdefghij
```

⚠️ **重要提示：**
- Webhook URL 是敏感信息，请妥善保管
- 任何拥有此 URL 的人都可以向该频道发送消息
- 不要在公开场合分享此 URL
- 如果 URL 泄露，可以删除并重新创建 Webhook

## ⚙️ 第二步：在 Clipper Hub 中配置

1. 打开 Clipper Hub 扩展
2. 点击右上角的"设置"按钮
3. 在侧边栏选择"Discord"平台
4. 填写配置信息：

   | 字段 | 说明 | 必填 | 示例 |
   |------|------|------|------|
   | **Webhook URL** | 从 Discord 复制的完整 URL | ✅ 是 | `https://discord.com/api/webhooks/...` |
   | **用户名** | 自定义发送者名称 | ❌ 否 | `Clipper Bot` |
   | **头像 URL** | 自定义发送者头像 | ❌ 否 | `https://example.com/avatar.png` |
   | **启用** | 是否启用该平台 | ✅ 是 | ✅ 开启 |

5. 点击"测试连接"按钮验证配置
6. 如果测试成功，会在 Discord 频道中收到一条测试消息
7. 点击"保存"按钮保存配置

## ✅ 验证配置

配置完成后，你可以：

1. 在 Popup 中输入测试消息并发送
2. 查看 Discord 频道是否收到消息
3. 在网页上选中文字，右键发送测试

## 🎨 自定义设置

### 自定义用户名

在配置中填写"用户名"字段，消息将以该名称显示：

```
用户名: My Clipper
```

如果不填写，将使用创建 Webhook 时设置的默认名称。

### 自定义头像

在配置中填写"头像 URL"字段，提供一个公开可访问的图片 URL：

```
头像 URL: https://i.imgur.com/abc123.png
```

支持的格式：
- ✅ PNG
- ✅ JPG/JPEG
- ✅ GIF
- ✅ WebP

## 🔧 常见问题

### Q: 提示"Invalid Webhook Token"

**原因：** Webhook URL 错误或无效

**解决方法：**
1. 重新复制 Webhook URL，确保完整
2. 确认 URL 以 `https://discord.com/api/webhooks/` 开头
3. 检查是否有多余的空格或换行符
4. 如果 Webhook 已被删除，需要重新创建

### Q: 消息发送成功但看不到

**原因：** 频道权限问题或消息被过滤

**解决方法：**
1. 确认你有查看该频道的权限
2. 检查频道设置中的消息过滤选项
3. 刷新 Discord 客户端

### Q: 头像或用户名没有生效

**原因：** URL 格式错误或图片无法访问

**解决方法：**
1. 确保头像 URL 是公开可访问的
2. 在浏览器中直接打开 URL，测试图片是否能加载
3. 用户名不能为空或包含特殊字符

### Q: 消息被限流

**原因：** Discord 对 Webhook 有速率限制

**限制说明：**
- 每个 Webhook 每秒最多 5 条消息
- 超过限制会返回 429 错误

**解决方法：**
- 避免短时间内大量发送消息
- 如需高频发送，考虑创建多个 Webhook

### Q: Webhook 被他人滥用

**原因：** Webhook URL 泄露

**解决方法：**
1. 立即删除被滥用的 Webhook
2. 创建新的 Webhook
3. 更新 Clipper Hub 配置
4. 妥善保管新的 URL

### Q: 如何删除 Webhook？

**步骤：**
1. 进入 Discord 频道设置
2. 选择"整合" → "Webhook"
3. 找到要删除的 Webhook
4. 点击"删除 Webhook"按钮
5. 确认删除

## 📚 消息格式

Discord Webhook 支持多种消息格式：

### 普通文本

```
这是一条普通消息
```

### Markdown 格式

Discord 支持以下 Markdown 语法：

- `**粗体**` - **粗体**
- `*斜体*` - *斜体*
- `__下划线__` - __下划线__
- `~~删除线~~` - ~~删除线~~
- `` `代码` `` - `代码`
- ` ```代码块``` ` - 代码块
- `[链接](url)` - 超链接

### Emoji

支持 Discord 和 Unicode Emoji：

```
这是一条带 emoji 的消息 🎉 ✨ 🚀
```

## 🔐 安全建议

1. **定期更换 Webhook**
   - 定期删除旧 Webhook 并创建新的
   - 更新配置中的 URL

2. **限制访问权限**
   - 只在需要的频道创建 Webhook
   - 为 Webhook 频道设置适当的权限

3. **监控使用情况**
   - 定期检查频道消息
   - 发现异常立即删除 Webhook

4. **使用环境变量**
   - 开发时使用 `.env` 文件存储 Webhook URL
   - 不要将 URL 提交到版本控制系统

## 📚 相关资源

- [Discord Webhook 官方文档](https://discord.com/developers/docs/resources/webhook)
- [Discord Markdown 文本格式](https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-)
- [Discord 开发者门户](https://discord.com/developers/applications)

## 💡 高级技巧

### 使用多个 Webhook

你可以为不同用途创建多个 Webhook：
- 个人笔记频道
- 团队协作频道
- 公开分享频道

每个 Webhook 可以配置不同的名称和头像。

### 富文本嵌入（Embeds）

Discord Webhook 支持发送富文本嵌入消息，但 Clipper Hub 目前使用简单文本格式。如需自定义，可以修改 `lib/platforms/discord.ts` 文件。

示例富文本格式：

```json
{
  "embeds": [{
    "title": "标题",
    "description": "描述内容",
    "color": 3447003,
    "url": "https://example.com"
  }]
}
```

---

🎉 配置完成！现在你可以开始使用 Discord 平台收藏精彩内容了！

# Telegram 平台配置指南

本文档介绍如何配置 Telegram 平台以使用 Clipper Hub。

## 📋 前置要求

- 一个 Telegram 账号
- 能够创建 Bot 和频道的权限

## 🤖 第一步：创建 Telegram Bot

### 1. 找到 BotFather

1. 打开 Telegram
2. 在搜索框中输入 `@BotFather`
3. 点击进入与 BotFather 的对话

### 2. 创建新 Bot

1. 发送命令 `/newbot`
2. BotFather 会要求你提供 Bot 名称
   - 输入你的 Bot 名称（例如：`My Clipper Bot`）
3. 接着需要提供用户名（必须以 `bot` 结尾）
   - 输入用户名（例如：`my_clipper_bot`）
4. 创建成功后，BotFather 会返回 **Bot Token**

### 3. 保存 Bot Token

Bot Token 格式类似：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

⚠️ **重要提示：**
- Bot Token 是敏感信息，请妥善保管
- 不要将 Token 分享给他人
- 不要在公开代码中暴露 Token

## 📢 第二步：创建或使用现有频道

### 选项 A：创建新频道

1. 在 Telegram 中点击"新建"按钮
2. 选择"新建频道"
3. 输入频道名称和描述
4. 选择频道类型：
   - **公开频道**：可以设置 @username，任何人都能搜索到
   - **私有频道**：只能通过邀请链接加入

### 选项 B：使用现有频道

确保你是频道的管理员或拥有者。

## 🔗 第三步：将 Bot 添加到频道

1. 进入你的频道
2. 点击频道名称进入频道信息页
3. 点击"管理员"
4. 点击"添加管理员"
5. 搜索并选择你刚创建的 Bot
6. 授予以下权限（至少需要）：
   - ✅ 发送消息
   - ✅ 编辑他人的消息（可选）
   - ✅ 删除他人的消息（可选）

## 🆔 第四步：获取频道 ID

### 方法一：公开频道

如果你的频道是公开的且设置了用户名，可以直接使用：

```
@your_channel_username
```

例如：`@myclipper`

### 方法二：私有频道或数字 ID

#### 使用 @userinfobot

1. 搜索并打开 `@userinfobot`
2. 将你的 Bot 转发一条消息给 @userinfobot
3. 或者将 @userinfobot 添加到频道
4. Bot 会返回频道的数字 ID

私有频道 ID 格式类似：`-1001234567890`

#### 使用 Web Telegram

1. 在浏览器中打开 [https://web.telegram.org](https://web.telegram.org)
2. 进入你的频道
3. 查看浏览器地址栏的 URL
4. URL 中会包含频道 ID（格式：`-100xxxxxxxxxx`）

## ⚙️ 第五步：在 Clipper Hub 中配置

1. 打开 Clipper Hub 扩展
2. 点击右上角的"设置"按钮
3. 在侧边栏选择"Telegram"平台
4. 填写配置信息：

   | 字段 | 说明 | 示例 |
   |------|------|------|
   | **Bot Token** | 从 BotFather 获取的 Token | `123456789:ABCdefGHI...` |
   | **Channel ID** | 频道 ID 或用户名 | `@mychannel` 或 `-1001234567890` |
   | **启用** | 是否启用该平台 | ✅ 开启 |

5. 点击"测试连接"按钮验证配置
6. 如果测试成功，会在频道中收到一条测试消息
7. 点击"保存"按钮保存配置

## ✅ 验证配置

配置完成后，你可以：

1. 在 Popup 中输入测试消息并发送
2. 查看 Telegram 频道是否收到消息
3. 在网页上选中文字，右键发送测试

## 🔧 常见问题

### Q: 提示"Bad Request: chat not found"

**原因：** 频道 ID 错误或 Bot 未添加到频道

**解决方法：**
1. 确认频道 ID 格式正确
2. 确保 Bot 已添加为频道管理员
3. 如果是公开频道，确认用户名前有 `@` 符号

### Q: 提示"Unauthorized"

**原因：** Bot Token 错误或无效

**解决方法：**
1. 重新复制 Bot Token，确保完整
2. 确认没有多余的空格
3. 如果 Token 泄露，可以在 BotFather 中使用 `/revoke` 命令重新生成

### Q: Bot 无法发送消息

**原因：** Bot 权限不足

**解决方法：**
1. 进入频道管理员设置
2. 找到你的 Bot
3. 确保勾选了"发送消息"权限

### Q: 如何获取群组 ID？

**说明：** Clipper Hub 主要用于频道，但也支持群组

**步骤：**
1. 将 Bot 添加到群组
2. 使用 @userinfobot 或其他 ID 获取工具
3. 群组 ID 通常是负数（例如：`-123456789`）

### Q: 消息格式有问题

**说明：** Telegram Bot API 使用 Markdown 或 HTML 格式

**建议：**
- 特殊字符可能需要转义
- 如果消息包含代码，使用代码块格式
- 超长消息会被自动截断（限制 4096 字符）

## 📚 相关资源

- [Telegram Bot API 官方文档](https://core.telegram.org/bots/api)
- [BotFather 使用指南](https://core.telegram.org/bots#6-botfather)
- [如何创建 Telegram 频道](https://telegram.org/faq_channels)

## 💡 高级技巧

### 使用多个频道

你可以创建多个 Telegram Bot 配置：
- 个人笔记频道
- 工作相关频道
- 收藏分享频道

只需在设置页面配置不同的 Bot Token 和 Channel ID 即可。

### 自定义消息格式

Telegram 支持 Markdown 格式，你可以在编辑模式中使用：
- `*粗体*` - **粗体**
- `_斜体_` - *斜体*
- `` `代码` `` - `代码`
- `[链接](url)` - 超链接

---

🎉 配置完成！现在你可以开始使用 Telegram 平台收藏精彩内容了！

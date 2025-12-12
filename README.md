## 一键TG频道助手

原帖，[爆肝 2 小时！一键TG频道助手 - Chrome 插件发布（碎片信息化 - 收藏整理发布到 - Telegram）](https://linux.do/t/topic/1302858)，在这个代码的基础上进行二次开发修改

> 右键点击选中的文字，一键发送到您的 Telegram 频道。支持编辑、添加标题、自动提取网页标题。

## ✨ 功能特性

- **快速发送** - Popup 快捷输入框，直接发送消息到频道
- **右键菜单** - 选中文字后右键发送
- **编辑模式** - 发送前编辑内容，添加标题
- **网页收藏** - 一键保存当前网页（标题+链接）
- **格式保留** - 自动保留文本换行和段落格式

## 🚀 快速开始

### 1. 准备 Telegram Bot

1. 在 Telegram 中搜索 `@BotFather`
2. 发送 `/newbot` 创建机器人
3. 复制获得的 **Bot Token**（格式：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`）

### 2. 准备频道

1. 创建一个 Telegram 频道
2. 将机器人添加为频道**管理员**
3. 获取频道 ID：
   - 公开频道：直接使用 `@频道用户名`（如 `@mychannel`）
   - 私有频道：使用数字 ID（格式：`-100xxxxxxxxx`）

### 3. 安装插件

```bash
# 克隆项目
git clone <repository-url>
cd TelegramKKK

# 安装依赖
npm install

# （可选）配置环境变量默认值
# 复制 .env.example 为 .env.development
cp .env.example .env.development

# 在 .env.development 中配置默认的 Bot Token 和 Channel ID
# VITE_TELEGRAM_BOT_TOKEN=你的Bot Token
# VITE_TELEGRAM_CHANNEL_ID=你的频道ID

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

### 4. 配置插件

**方式一：环境变量配置（推荐用于开发/团队）**

1. 复制 `.env.example` 为 `.env.development`
2. 编辑 `.env.development`，填写默认的 Bot Token 和 Channel ID：
   ```bash
   VITE_TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   VITE_TELEGRAM_CHANNEL_ID=@mychannel
   ```
3. 重新构建项目：`npm run dev` 或 `npm run build`
4. 如果用户未在设置页面填写配置，将自动使用环境变量中的默认值

**方式二：界面配置（用于个人使用）**

1. 点击浏览器扩展图标打开 Popup
2. 点击右上角设置按钮 ⚙️
3. 填写 Bot Token 和 Channel ID
4. 点击"测试连接"验证配置
5. 保存设置

**注意：** 界面配置的值优先级高于环境变量。如果用户在设置页面填写了配置，将使用界面配置的值。

## 💡 使用方式

### 方式一：快捷输入（Popup）
1. 点击扩展图标
2. 在输入框中输入内容
3. 按 `Ctrl + Enter` 或点击"发送"按钮

### 方式二：选中文字发送
1. 在任意网页选中文字
2. 右键菜单 → **一键TG频道助手** → **⚡ 发送选中文字**

### 方式三：编辑后发送
1. 在任意网页选中文字
2. 右键菜单 → **一键TG频道助手** → **✏️ 编辑后发送**
3. 在弹出窗口编辑内容、添加标题
4. 点击"保存收藏"

### 方式四：收藏网页
1. 在需要收藏的网页上右键
2. 右键菜单 → **一键TG频道助手** → **🔖 收藏网址**

## 📝 开发命令

```bash
npm run dev          # 开发模式
npm run build        # 构建生产版本
npm run zip          # 打包为 zip 文件
npm run compile      # 类型检查
```

## 🔧 常见问题

**Q: 提示"配置缺失"？**  
A: 需要先在设置中配置 Bot Token 和 Channel ID

**Q: 发送失败？**  
A: 检查：
- Bot Token 是否正确
- 机器人是否已添加为频道管理员
- Channel ID 格式是否正确
- 网络连接是否正常

**Q: 如何获取私有频道 ID？**  
A: 使用 `@userinfobot`，将机器人添加到频道后会显示频道 ID

## 📄 License

[MIT](./LICENSE)

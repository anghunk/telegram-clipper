![](./public/icon/128.png)

## Clipper Hub - 万能剪藏

> 将网页内容一键收藏至多个平台的浏览器扩展，支持 Telegram、Discord、Notion 等多个平台，让你的灵感和收藏无处不在。

正在申请商店发布中，请耐心等待~~

<img width="2022" height="1378" alt="frame_generic_dark" src="https://github.com/user-attachments/assets/5b6678fe-aff9-4220-aac1-813777c80f23" />

## ✨ 功能特性

### 🎯 核心功能

- **多平台支持** - 同时发送到 Telegram、Discord 等多个平台
- **快速发送** - Popup 快捷输入框，直接发送消息
- **右键菜单** - 选中文字后右键发送
- **编辑模式** - 发送前编辑内容，添加自定义标题
- **网页收藏** - 一键保存当前网页（标题 + 链接）

### 🔌 支持的平台

| 平台     | 状态     | 说明                            |
| -------- | -------- | ------------------------------- |
| Telegram | ✅ 支持  | 通过 Bot API 发送到频道         |
| Discord  | ✅ 支持  | 通过 Webhook 发送到频道         |
| Notion   | ✅ 支持  | 通过 Notion API 发送到 Database |
| 飞书文档 | 🚧 计划 | 目前需要付费实现 webhook 功能   |
| 语雀笔记 | 🚧 计划 | 需要超级会员开放 token 功能     |

## 🚀 快速开始

### 1. 安装

```bash
cd clipper-hub

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

### 3. 配置平台

1. 点击浏览器扩展图标
2. 点击右上角"设置"按钮
3. 在侧边栏选择要配置的平台
4. 填写平台配置信息
5. 点击"测试连接"验证配置
6. 点击"保存"完成配置

**详细配置教程：**

- [Telegram 配置指南](./docs/platforms/telegram.md)
- [Discord 配置指南](./docs/platforms/discord.md)

## 🏗️ 项目架构

### 目录结构

```
clipper-hub/
├── entrypoints/          # 扩展入口点
│   ├── background.ts     # 后台服务
│   ├── content.ts        # 内容脚本
│   ├── popup/            # 弹出窗口
│   ├── options/          # 设置页面
│   └── edit/             # 编辑页面
├── lib/
│   └── platforms/        # 平台适配层（中间件）
│       ├── types.ts      # 平台接口定义
│       ├── telegram.ts   # Telegram 平台实现
│       ├── discord.ts    # Discord 平台实现
│       └── index.ts      # 平台管理器
├── public/               # 静态资源
├── docs/                 # 文档
│   └── platforms/        # 平台配置文档
└── wxt.config.ts         # WXT 配置
```

### 中间件模式

项目采用中间件模式实现平台解耦：

- **Platform 接口**：定义统一的平台行为规范
- **平台实现**：每个平台独立实现 Platform 接口
- **平台管理器**：统一管理所有平台的配置和调用
- **易于扩展**：新增平台只需实现 Platform 接口即可

## 📝 开发命令

```bash
# 开发
npm run dev              # Chrome 开发模式
npm run dev:firefox      # Firefox 开发模式

# 构建
npm run build            # 构建 Chrome 版本
npm run build:firefox    # 构建 Firefox 版本

# 打包
npm run zip              # 打包 Chrome 版本为 zip
npm run zip:firefox      # 打包 Firefox 版本为 zip
npm run publish          # 构建并打包所有版本

# 其他
npm run compile          # TypeScript 类型检查
```

## 🔧 常见问题

**Q: 如何添加新的平台支持？**

A: 参考 [开发文档 - 添加新平台](./docs/development/add-platform.md)

**Q: 消息发送失败怎么办？**

A: 请检查：
1. 平台配置是否正确（点击"测试连接"验证）
2. 网络连接是否正常
3. 平台服务是否可用
4. 查看浏览器控制台错误信息

**Q: 可以只启用部分平台吗？**

A: 可以。在设置页面中，每个平台都有独立的启用开关，其他平台正在陆续开发支持中。

**Q: 配置数据存储在哪里？**

A: 使用本地浏览器的 `browser.storage.sync` API 存储，数据会在同一账号的不同设备间同步。**完全不接触云端。**

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

### 添加新平台

如果你想添加对新平台的支持，请参考：
- [平台开发文档](./docs/development/add-platform.md)
- 现有平台实现：[telegram.ts](./lib/platforms/telegram.ts)、[discord.ts](./lib/platforms/discord.ts)

## 📄 许可证

[Apache-2.0 license](./LICENSE)

## 🙏 致谢

本项目参考 [[爆肝 2 小时！一键 TG 频道助手](https://linux.do/t/topic/1302858)](https://linux.do/t/topic/1302858) 进行开发。

---

⭐ 如果这个项目对你有帮助，欢迎 Star！

---
layout: home

hero:
  name: Clipper Hub - 万能剪藏
  tagline: 将网页内容一键收藏至多个平台的浏览器扩展，支持 Telegram、Discord 等多个平台，让你的灵感和收藏无处不在。
  image:
    src: https://github.com/anghunk/clipper-hub/blob/main/public/icon/128.png?raw=true
    alt: 文档封面
  actions:
    - theme: brand
      text: 配置指南
      link: /platforms/discord
    - theme: alt
      text: GitHub
      link: https://github.com/anghunk/clipper-hub
    - theme: alt
      text: Chrome Web Store(暂未上架)
      link: https://github.com/anghunk/clipper-hub

features:
  - icon: 🚀
    title: 多平台同步
    details: 同时发送到 Telegram、Discord、Notion 等多个平台，一键收藏，处处同步
  - icon: ✏️
    title: 灵活编辑
    details: 发送前可编辑内容、添加自定义标题、智能保留段落格式和来源链接
  - icon: ⚡
    title: 快捷操作
    details: 右键菜单快速发送、Popup 弹窗输入、Ctrl+Enter 快捷键，效率翻倍
---


## 🔧 常见问题

**Q: 如何添加新的平台支持？**

A: 参考 [开发文档 - 添加新平台](/development/add-platform.md)

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


<style>
.VPHero .text {
  font-size: 18px;
}

.VPImage {
  border-radius: 50%;
}

:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);
  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(40px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(72px);
  }
  .clip {
    font-size:45px !important;
  }
  .tagline {
    font-size:20px !important;
  }
}
</style>
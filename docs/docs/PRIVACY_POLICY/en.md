# Privacy Policy for Clipper Hub

[English](./en.md) / [中文版](./zh-CN.md)

**Last Updated: December 23, 2025**

This Privacy Policy describes how Clipper Hub ("the Extension", "we", "us", or "our") handles information when you use our browser extension.

## Summary

**Clipper Hub processes all data locally on your device. We do not collect, store, or transmit any personal information to our servers. The Extension only sends data to third-party platforms (Telegram, Discord, Notion) that YOU explicitly configure and authorize.**

---

## 1. Information We Access

To provide our core functionality, the Extension may access the following data:

### 1.1 Web Page Content
- **Selected text**: Text you explicitly select on web pages for clipping
- **Page title**: The title of the current web page
- **Page URL**: The URL of the current web page

### 1.2 User Configuration
- Platform API tokens (Telegram Bot Token, Discord Webhook URL, Notion Integration Token)
- Database IDs and other platform-specific settings
- Language preferences

---

## 2. How We Use Information

### 2.1 Core Functionality
All accessed information is used **exclusively** for:
- Sending your selected content to platforms you have configured (Telegram, Discord, Notion)
- Displaying page information in the editing interface before submission

### 2.2 Local Processing Only
- **All data processing occurs locally** on your device
- Content is only transmitted when you actively click "Send" or use the context menu
- Data is sent **directly** from your browser to your configured platforms (Telegram API, Discord Webhook, Notion API)

---

## 3. Data Storage

### 3.1 Local Storage Only
All configuration data is stored locally using the browser's built-in storage APIs:
- `browser.storage.local` - For user preferences and platform configurations
- `browser.storage.sync` - For syncing settings across your devices (via your browser account, not our servers)

### 3.2 What We Store Locally
- Platform enable/disable status
- API tokens and credentials you provide
- Language preferences

### 3.3 What We Do NOT Store
- Browsing history
- Web page content
- Selected text (only processed in memory, not persisted)
- Analytics or tracking data

---

## 4. Data Sharing

### 4.1 Third-Party Platforms
When you use the Extension to clip content, data is sent **directly** to:
- **Telegram** (api.telegram.org) - if you have configured Telegram
- **Discord** (discord.com/api/webhooks) - if you have configured Discord
- **Notion** (api.notion.com) - if you have configured Notion

These transmissions occur:
- Only when you explicitly initiate a send action
- Directly from your browser to the platform's API
- Using credentials YOU provide

### 4.2 No Other Data Sharing
- We do **NOT** operate any backend servers
- We do **NOT** collect analytics or usage data
- We do **NOT** share any data with advertisers or data brokers
- We do **NOT** use any third-party tracking services

---

## 5. Data Security

- All API communications use HTTPS encryption
- Your credentials are stored only in your browser's secure storage
- No data is transmitted to any servers controlled by us

---

## 6. Your Rights and Controls

You have full control over your data:

### 6.1 Access and Modify
- View and modify all settings through the Extension's options page
- All stored data is accessible through browser developer tools

### 6.2 Delete
- Uninstalling the Extension removes all locally stored data
- You can manually clear Extension data through browser settings

### 6.3 Opt-Out
- You can disable any platform at any time
- The Extension does not function without your explicit configuration

---

## 7. Permissions Explained

| Permission | Purpose |
|------------|---------|
| `contextMenus` | Create right-click menu for quick clipping |
| `storage` | Store your settings locally |
| `notifications` | Show send success/failure notifications |
| `scripting` | Read selected text from web pages |
| `activeTab` | Access current tab's title and URL |
| Host permissions for platform APIs | Send content to your configured platforms |

---

## 8. Children's Privacy

The Extension is not directed at children under 13. We do not knowingly collect information from children.

---

## 9. Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be reflected in the "Last Updated" date above.

---

## 10. Open Source

Clipper Hub is open source software. You can review our complete source code at:
- **GitHub**: https://github.com/anghunk/clipper-hub

---

## 11. Contact

If you have questions about this Privacy Policy, please:
- Open an issue on GitHub: https://github.com/anghunk/clipper-hub/issues
- Join our Discord: https://discord.gg/3wDmhCsVeU

---

## 12. Consent

By installing and using Clipper Hub, you agree to this Privacy Policy. The Extension will request your explicit consent for data collection on first use.

---

**Summary of Key Points:**
- ✅ All processing happens locally on your device
- ✅ No data is sent to our servers (we don't have any)
- ✅ Data only goes to platforms YOU configure
- ✅ You have full control over your data
- ✅ Fully open source and auditable

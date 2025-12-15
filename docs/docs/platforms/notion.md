# Notion 配置指南

本文档介绍如何配置 Clipper Hub 将内容保存到 Notion 数据库。

## 📋 前置要求

1. 拥有 Notion 账号
2. 创建一个 Notion 数据库用于存储剪藏内容
3. 创建 Notion Integration 并获取 Token

---

## 🔧 配置步骤

### 步骤 1: 创建 Notion Integration

1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 点击 **"+ New integration"** 创建新的 Integration
3. 填写以下信息：
   - **Name**: `Clipper Hub`（或任意名称）
   - **Associated workspace**: 选择你的工作空间
   - **Type**: 选择 **Internal Integration**
4. 点击 **"Submit"** 创建
5. 复制显示的 **Internal Integration Token**（格式：`secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

> ⚠️ **重要**: 请妥善保管 Token，不要分享给他人

---

### 步骤 2: 创建 Notion 数据库

#### 方法 1: 从模板创建（推荐）

1. 在 Notion 中创建一个新页面
2. 输入 `/database` 并选择 **Table - Full page**
3. 添加以下属性（列）：

| 属性名称 | 类型 | 说明 | 必需 |
|---------|------|------|------|
| Name | Title | 剪藏标题 | ✅ 必需 |
| Content | Text | 剪藏内容 | ✅ 推荐 |
| Source | URL | 来源链接 | 推荐 |
| Created | Created time | 创建时间 | 可选 |
| Tags | Multi-select | 标签分类 | 可选 |

#### 方法 2: 使用现有数据库

如果你想使用已有的数据库，请确保至少包含以下属性：
- **一个 Title 类型的属性**（用于存储标题）
- **一个 Text 类型的属性**（用于存储内容）

---

### 步骤 3: 连接 Integration 到数据库

1. 打开你创建的数据库页面
2. 点击右上角的 **"..."** 菜单
3. 选择 **"Connections"** → **"Connect to"**
4. 在列表中找到你刚创建的 Integration（如 `Clipper Hub`）
5. 点击连接

> ⚠️ **必须执行此步骤**，否则 Integration 无法访问数据库

---

### 步骤 4: 获取 Database ID

#### 方法 1: 从 URL 获取

1. 在浏览器中打开数据库页面
2. 查看 URL，格式通常为：
   ```
   https://www.notion.so/workspace/[database-id]?v=...
   ```
3. 复制 `database-id` 部分

**示例 URL**:
```
https://www.notion.so/myworkspace/a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4?v=123456
                                 ↑ 这部分是 Database ID
```

#### 方法 2: 使用分享链接

1. 点击数据库右上角的 **"Share"** 按钮
2. 点击 **"Copy link"**
3. 粘贴链接，从中提取 Database ID

**Database ID 格式**:
- 带连字符: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- 不带连字符: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

两种格式都支持！

---

### 步骤 5: 在 Clipper Hub 中配置

1. 打开 Clipper Hub 设置页面
2. 在左侧选择 **"Notion"**
3. 填写配置信息：
   - **启用 Notion**: 打开开关
   - **Integration Token**: 粘贴步骤 1 中获取的 Token
   - **Database ID**: 粘贴步骤 4 中获取的 ID
4. （可选）配置高级选项：
   - **标题字段名称**: 默认 `Name`，如果你的数据库使用其他名称，请修改
   - **内容字段名称**: 默认 `Content`
   - **来源字段名称**: 默认 `Source`
5. 点击 **"测试连接"** 验证配置
6. 点击 **"保存设置"**

---

## 🎯 使用方法

### 1. 快速发送

1. 在网页上选中文字
2. 右键选择 **"Clipper Hub - 万能剪藏"** → **"发送选中文字"**
3. 内容会自动保存到 Notion 数据库

### 2. 编辑后发送

1. 选中文字后右键选择 **"编辑后发送"**
2. 在编辑窗口中修改内容和标题
3. 点击 **"保存并发送"**

### 3. 收藏网页

1. 打开 Clipper Hub 插件弹窗
2. 点击 **"收藏当前页面"**
3. 网页标题和链接会保存到 Notion

---

## 📊 数据格式说明

### 保存的内容结构

| 字段 | 内容 |
|------|------|
| Name (标题) | 剪藏内容的第一行，或自定义标题 |
| Content (内容) | 剪藏的正文内容 |
| Source (来源) | 网页 URL（如果有） |
| Created (创建时间) | 自动记录 |

### 示例数据

**Name**: `如何使用 Notion API`  
**Content**: `Notion API 是一个强大的工具，可以让你通过编程方式访问 Notion 的数据...`  
**Source**: `https://developers.notion.com/docs`  
**Created**: `2025-12-15 21:00:00`

---

## ❓ 常见问题

### Q1: 提示 "Integration Token 无效或已过期"

**原因**: Token 输入错误或已失效

**解决方法**:
1. 检查 Token 是否完整复制（包含 `secret_` 前缀）
2. 前往 [Notion Integrations](https://www.notion.so/my-integrations) 重新生成 Token
3. 确保 Integration 状态为 Active

---

### Q2: 提示 "Database ID 不存在或 Integration 未连接"

**原因**: 
- Database ID 错误
- 忘记将 Integration 连接到数据库

**解决方法**:
1. 检查 Database ID 是否正确
2. 确保已执行 **步骤 3**（连接 Integration 到数据库）
3. 在数据库页面点击 `...` → `Connections`，确认你的 Integration 已连接

---

### Q3: 提示 "数据验证失败"

**原因**: 数据库属性配置不匹配

**解决方法**:
1. 检查数据库是否有 **Title 类型** 的属性（用于标题）
2. 检查 **高级配置** 中的字段名称是否与数据库属性名称完全一致
3. 属性名称区分大小写，例如 `Name` ≠ `name`

---

### Q4: 内容过长被截断

**原因**: Notion Rich Text 单个块限制 2000 字符

**解决方法**:
- 内容会自动分割成多个块，这是正常行为
- 如需保存超长文本，建议在编辑窗口中适当精简内容

---

### Q5: 如何使用自定义属性名称？

1. 在设置页面展开 **"高级配置（可选）"**
2. 修改字段名称为你数据库中的实际属性名称
3. 例如，如果你的数据库用 `标题` 而不是 `Name`，就修改 **标题字段名称** 为 `标题`
4. 保存并测试连接

---

### Q6: 可以保存到多个数据库吗？

当前版本只支持配置一个数据库。如需切换：
1. 修改 Database ID
2. 确保新数据库已连接 Integration
3. 保存设置

---

## 🔒 隐私与安全

- ✅ **本地存储**: 配置信息存储在浏览器本地，不会上传到任何服务器
- ✅ **直连 API**: 扩展直接调用 Notion API，不经过第三方服务器
- ✅ **权限最小化**: Integration 只需要 "Insert content" 权限
- ⚠️ **Token 安全**: 请勿与他人分享 Integration Token

---

## 📚 相关资源

- [Notion API 官方文档](https://developers.notion.com/)
- [Notion Integrations 管理](https://www.notion.so/my-integrations)
- [创建数据库属性说明](https://www.notion.so/help/guides/creating-a-database)

---

## 💡 使用技巧

### 1. 配合标签使用

在数据库中添加 `Tags` 属性（Multi-select 类型），可以手动为剪藏内容添加标签进行分类。

### 2. 使用视图过滤

创建不同的数据库视图（View）来组织内容：
- **最近剪藏**: 按创建时间降序排序
- **待阅读**: 添加 `Status` 属性，筛选未读内容
- **按来源**: 按 `Source` 分组

### 3. 自动化工作流

结合 Notion 的自动化功能，可以：
- 自动给新剪藏添加默认标签
- 发送提醒通知
- 同步到其他页面

---

## 🤝 反馈与支持

如有问题或建议，欢迎：
- 提交 GitHub Issue
- 查看项目文档
- 参与社区讨论

---

⭐ 祝你剪藏愉快！

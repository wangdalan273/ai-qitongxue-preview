# 📤 Obsidian 社区插件上架完整指南

## 🎯 上架前检查清单

### ✅ 必需文件检查

您的插件目录应包含以下文件：

```
ai-qitongxue-preview/
├── main.js           ✅ 已有
├── manifest.json     ✅ 已有
├── styles.css        ✅ 已有
└── README.md         ✅ 已有
```

### ✅ manifest.json 检查

```json
{
    "id": "ai-qitongxue-preview",              // ✅ 唯一 ID
    "name": "Ai淇橦学排版预览",                   // ✅ 显示名称
    "version": "1.0.0",                        // ✅ 版本号
    "minAppVersion": "0.15.0",                 // ✅ 最低 Obsidian 版本
    "description": "描述信息",                  // ✅ 描述
    "author": "Ai淇橦学",                        // ✅ 作者
    "authorUrl": "GitHub URL",                // ✅ 作者链接
    "isDesktopOnly": false                     // ✅ 是否仅桌面端
}
```

### ✅ 功能测试清单

- [ ] 插件可以正常安装
- [ ] 插件可以正常卸载
- [ ] 所有核心功能正常工作
- [ ] 设置页面正常显示
- [ ] 没有控制台错误
- [ ] 在最新版 Obsidian 中测试

---

## 📋 上架步骤

### 第 1 步：Fork 官方仓库

1. 访问：https://github.com/obsidianmd/obsidian-releases
2. 点击右上角 **Fork** 按钮
3. 等待 Fork 完成

### 第 2 步：克隆您的 Fork

```powershell
# 克隆到本地
git clone https://github.com/wangdalan273/obsidian-releases.git
cd obsidian-releases
```

### 第 3 步：编辑 plugins.json

1. 用文本编辑器打开 `plugins.json`
2. 按字母顺序找到合适的位置
3. 添加您的插件信息：

```json
{
    "id": "ai-qitongxue-preview",
    "name": "Ai淇橦学排版预览",
    "author": "Ai淇橦学",
    "description": "一键将 Markdown 文档转换为微信公众号格式，支持多种模板样式和自定义主题",
    "repo": "wangdalan273/ai-qitongxue-preview"
}
```

**重要提示**：
- 确保前后都有逗号（JSON 格式）
- 按字母顺序插入
- 使用英文标点

### 第 4 步：提交更改

```powershell
# 添加文件
git add plugins.json

# 提交
git commit -m "Add plugin: ai-qitongxue-preview"

# 推送
git push origin main
```

### 第 5 步：创建 Pull Request

1. 访问：https://github.com/wangdalan273/obsidian-releases
2. 点击 **Contribute** → **Open pull request**
3. 填写 PR 信息

**PR 标题**：
```
Add plugin: ai-qitongxue-preview
```

**PR 描述**：
```markdown
## Plugin Information

**Plugin Name**: Ai淇橦学排版预览
**Plugin ID**: ai-qitongxue-preview
**Author**: Ai淇橦学
**GitHub**: https://github.com/wangdalan273/ai-qitongxue-preview

## Description

一键将 Markdown 文档转换为微信公众号格式，支持多种模板样式和自定义主题。

## Features

- 🚀 一键转换 Markdown 为公众号格式
- 🎨 内置多种精美模板
- 🎯 实时预览效果
- 🔧 高度可定制（字体、背景、颜色）
- 📦 完整的模板、字体、背景管理功能

## Screenshots

（可选：添加截图链接）

## Testing

✅ 已在 Obsidian 最新版本中测试
✅ 所有功能正常工作
✅ 无控制台错误

---

I have read the [Plugin Submission Guidelines](https://github.com/obsidianmd/obsidian-releases/blob/master/README.md#plugin-submission-guidelines) and confirm my plugin follows the requirements.
```

4. 点击 **Create pull request**

---

## ⏳ 审核流程

### 时间线

- **提交后**: PR 进入审核队列
- **1-3 天**: 初步审核
- **3-7 天**: 完整审核（可能需要修改）

### 可能的反馈

#### 1. 需要修改

如果审核人员要求修改：

```powershell
# 修改您的插件
cd D:\ai-qitongxue-preview
# 进行修改...

# 更新版本号
# 修改 manifest.json 中的 version

# 提交并推送
git add .
git commit -m "Update: fix issues"
git push

# 创建新版本标签
git tag -a v1.0.1 -m "Update v1.0.1"
git push origin v1.0.1
```

#### 2. 需要更多信息

在 PR 中回复审核人员的问题，提供所需信息。

#### 3. 审核通过

恭喜！您的插件将出现在 Obsidian 插件市场！

---

## 📱 审核通过后

### 1. 用户如何安装

用户可以在 Obsidian 设置中：
1. 进入 **社区插件**
2. 搜索 **"Ai淇橦学排版预览"** 或 **"ai-qitongxue-preview"**
3. 点击 **安装**
4. 启用插件

### 2. 更新插件

```powershell
# 修改代码
cd D:\ai-qitongxue-preview

# 更新版本号（在 manifest.json 中）
# 从 1.0.0 → 1.0.1

# 提交
git add .
git commit -m "Update: 新功能描述"
git push

# 创建新标签
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1

# GitHub 会自动检测到新 Release
# Obsidian 插件市场会在几小时内更新
```

### 3. 宣传插件

在您的公众号 **"AI淇橦学"** 中发文：

**标题**：🎉 我开发了一个 Obsidian 插件！

**内容**：
```
【插件发布】我开发了一个 Obsidian 插件，可以一键将 Markdown 转换为微信公众号格式！

✨ 主要功能：
- 一键转换，无需繁琐排版
- 内置多种精美模板
- 实时预览效果
- 高度可定制

📦 安装方法：
1. 打开 Obsidian 设置
2. 进入社区插件
3. 搜索"Ai淇橦学排版预览"
4. 点击安装即可使用

🔗 GitHub: https://github.com/wangdalan273/ai-qitongxue-preview

欢迎大家使用并提出宝贵意见！
```

---

## ⚠️ 注意事项

### 1. 版本控制

- 版本号必须遵循 [语义化版本](https://semver.org/lang/zh-CN/)
- 格式：`主版本号.次版本号.修订号`
- 示例：`1.0.0` → `1.0.1` → `1.1.0` → `2.0.0`

### 2. 更新频率

- 不要过于频繁地提交小更新
- 建议积累一定改进后批量更新
- 重大更新（如 1.0.0 → 2.0.0）要有充分理由

### 3. 代码质量

- 保持代码整洁
- 添加必要的注释
- 遵循 TypeScript 最佳实践

### 4. 用户反馈

- 及时回复 GitHub Issues
- 认真考虑用户的建议
- 快速修复 bug

---

## 🆘 常见问题

### Q1: PR 提交后多久能通过？

A: 通常 **1-7 个工作日**。如果超过 7 天没有回复，可以在 PR 中礼貌地询问。

### Q2: 审核被拒怎么办？

A: 仔细阅读拒绝原因，修改后重新提交。大多数拒绝原因都是可以修正的。

### Q3: 可以上架商业插件吗？

A: Obsidian 社区插件市场只接受免费插件。如果要收费，需要自己在其他渠道分发。

### Q4: 插件上架后可以改名吗？

A: 不建议。改名会影响已安装用户。如需改名，最好创建新插件。

### Q5: 如何删除插件？

A: 在 PR 中说明要删除，或在 issues 中联系维护者。

---

## 📚 参考资源

- [Obsidian 插件开发文档](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [插件提交指南](https://github.com/obsidianmd/obsidian-releases/blob/master/README.md#plugin-submission-guidelines)
- [插件审核标准](https://github.com/obsidianmd/obsidian-releases/blob/master/README.md#review-criteria)

---

## 🎉 准备好了吗？

现在就开始吧！

1. ✅ Fork 官方仓库
2. ✅ 添加插件信息
3. ✅ 提交 PR
4. ⏳ 等待审核
5. 🎉 上架成功！

**祝您的插件顺利上架！** 🚀

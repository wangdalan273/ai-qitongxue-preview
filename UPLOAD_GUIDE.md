# 🚀 GitHub 发布完整指南

## ✅ 已完成的修改

1. ✅ 插件名称改为：**Ai淇橦学排版预览**
2. ✅ 插件 ID 改为：`ai-qitongxue-preview`
3. ✅ 作者邮箱改为：`a15517856661@qq.com`
4. ✅ GitHub 用户名改为：`wangdalan273`
5. ✅ 仓库名称改为：`ai-qitongxue-preview`

## 📋 发布到 GitHub 的步骤

### 步骤 1：创建 GitHub 仓库

1. 访问 https://github.com/new
2. **仓库名称**：`ai-qitongxue-preview`
3. **描述**：`Ai淇橦学排版预览 - 一键将 Markdown 文档转换为微信公众号格式`
4. **Public** ✅（公开）
5. **不要**初始化 README、.gitignore
6. 点击 **Create repository**

### 步骤 2：初始化 Git 并推送

```bash
# 进入项目目录
cd D:\ai-qitongxue-preview

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 第一次提交
git commit -m "Initial commit: Ai淇橦学排版预览 v1.0.0"

# 关联远程仓库
git remote add origin https://github.com/wangdalan273/ai-qitongxue-preview.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 步骤 3：创建版本标签

```bash
# 创建标签
git tag -a v1.0.0 -m "Release v1.0.0: Ai淇橦学排版预览"

# 推送标签到 GitHub
git push origin v1.0.0
```

### 步骤 4：在 GitHub 创建 Release

1. 访问：https://github.com/wangdalan273/ai-qitongxue-preview/releases
2. 点击 **Draft a new release**
3. 填写信息：
   - **Tag**: 选择 `v1.0.0`
   - **Release title**: `🎉 v1.0.0 - Ai淇橦学排版预览`
   - **Description**:

```markdown
## 🎉 首次发布 - Ai淇橦学排版预览

### ✨ 主要功能

- 🚀 一键将 Markdown 转换为微信公众号格式
- 🎨 内置多种精美模板，支持自定义样式
- 🎯 实时预览效果
- 🔧 高度可定制（字体、背景、颜色）
- 📦 完整的模板、字体、背景管理功能

### 📦 安装方式

**手动安装：**
1. 下载 `main.js`、`manifest.json`、`styles.css`
2. 复制到 `.obsidian/plugins/ai-qitongxue-preview/`
3. 在 Obsidian 设置中启用插件

**从源码编译：**
```bash
npm install
npm run build
```

### 📖 使用说明

查看 [README](README.md) 了解详细使用方法

### 🙏 致谢

感谢原插件作者提供的灵感和基础代码

### 📄 许可证

MIT License
```

4. 勾选 **Set as the latest release**
5. 点击 **Publish release**

### 步骤 5：验证发布

访问以下链接确认：
- 仓库主页：https://github.com/wangdalan273/ai-qitongxue-preview
- Releases：https://github.com/wangdalan273/ai-qitongxue-preview/releases

## 📝 二维码图片说明

您需要替换以下二维码图片：

1. **打赏二维码**
   - 路径：`src/assets/donate.ts`
   - 将您的微信/支付宝收款码转换为 base64

2. **公众号二维码**
   - 路径：`src/assets/qrcode.ts`
   - 将您的公众号二维码转换为 base64

### 转换方法

1. 在线工具：https://www.base64-image.de/
2. 或使用命令：
```bash
# 安装 ImageMagick
magick your-qrcode.jpg base64:output.txt
```

## 🎯 完成检查清单

发布前请确认：

- [ ] 所有文件中的 `ai-qixong` 已改为 `wangdalan273`
- [ ] 所有文件中的 `ai-qixong-mp-preview` 已改为 `ai-qitongxue-preview`
- [ ] 所有文件中的 `AI淇橦学微信预览` 已改为 `Ai淇橦学排版预览`
- [ ] 邮箱已改为 `a15517856661@qq.com`
- [ ] 二维码图片已替换（或暂时保留原图）
- [ ] Git 仓库已成功推送
- [ ] Release 已创建
- [ ] Release 中的文件可下载

## 📌 发布后的工作

### 1. 提交到 Obsidian 插件市场

1. 访问：https://github.com/obsidianmd/obsidian-releases
2. Fork 该仓库
3. 编辑 `plugins.json`，添加：

```json
{
  "id": "ai-qitongxue-preview",
  "name": "Ai淇橦学排版预览",
  "author": "Ai淇橦学",
  "description": "一键将 Markdown 文档转换为微信公众号格式",
  "repo": "wangdalan273/ai-qitongxue-preview"
}
```

4. 提交 Pull Request

### 2. 在公众号宣传

发布后可以在您的公众号"AI淇橦学"中发文宣传：
- 介绍插件功能
- 说明使用方法
- 附上 GitHub 链接

## 🆘 常见问题

**Q: 推送时提示权限错误？**
A: 确保已登录 GitHub 账号，并使用 Personal Access Token

**Q: 如何修改已发布的信息？**
A: 可以直接在 GitHub 上编辑文件，或本地修改后重新 git push

**Q: 如何创建新版本？**
A:
```bash
# 修改版本号
# 提交代码
git add .
git commit -m "Update to v1.0.1"
git push

# 创建新标签
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

---

**准备好了吗？让我们开始发布！** 🚀

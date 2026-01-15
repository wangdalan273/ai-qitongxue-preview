# 发布说明

## 准备发布到 GitHub

### 1. 初始化 Git 仓库

```bash
cd D:\ai-qixong-mp-preview
git init
git add .
git commit -m "Initial commit: AI淇橦学微信预览 v1.0.0"
```

### 2. 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名称：`ai-qixong-mp-preview`
3. 描述：`AI淇橦学微信预览 - 一键将 Markdown 文档转换为微信公众号格式`
4. 设置为 Public
5. 不要初始化 README（我们已经有了）
6. 点击"Create repository"

### 3. 关联远程仓库

```bash
git remote add origin https://github.com/aiqixong/ai-qixong-mp-preview.git
git branch -M main
git push -u origin main
```

### 4. 创建发布标签

```bash
git tag -a v1.0.0 -m "Release v1.0.0: AI淇橦学微信预览"
git push origin v1.0.0
```

### 5. 在 GitHub 上创建 Release

1. 访问 https://github.com/aiqixong/ai-qixong-mp-preview/releases
2. 点击"Create a new release"
3. 选择标签：v1.0.0
4. 发布标题：`v1.0.0 - AI淇橦学微信预览`
5. 发布说明：

```markdown
## 🎉 首次发布 - AI淇橦学微信预览

### ✨ 主要功能

- 🚀 一键将 Markdown 转换为微信公众号格式
- 🎨 内置多种精美模板
- 🎯 实时预览效果
- 🔧 高度可定制
- 📦 完整的模板、字体、背景管理

### 📦 安装方式

**手动安装：**
1. 下载 `main.js`、`manifest.json`、`styles.css`
2. 复制到 `.obsidian/plugins/ai-qixong-mp-preview/`
3. 在 Obsidian 设置中启用插件

**从源码编译：**
```bash
npm install
npm run build
```

### 📖 使用说明

查看 [README](README.md) 了解详细使用方法

### 🙏 致谢

感谢原插件作者提供的灵感

### 📄 许可证

MIT License
```

6. 勾选"Set as the latest release"
7. 点击"Publish release"

## 文件清单

### 必需文件（用于 Obsidian）
- `main.js` - 编译后的插件代码
- `manifest.json` - 插件元信息
- `styles.css` - 样式文件

### 源代码
- `src/` - TypeScript 源代码目录

### 配置文件
- `package.json` - npm 配置
- `package-lock.json` - 依赖锁定文件
- `tsconfig.json` - TypeScript 配置
- `esbuild.config.mjs` - 构建配置
- `.gitignore` - Git 忽略规则
- `.editorconfig` - 编辑器配置

### 文档
- `README.md` - 项目说明（中英文）
- `CHANGELOG.md` - 更新日志
- `CONTRIBUTING.md` - 贡献指南
- `LICENSE` - MIT 许可证
- `versions.json` - 版本历史

### GitHub 模板
- `.github/ISSUE_TEMPLATE/bug_report.md` - Bug 报告模板
- `.github/ISSUE_TEMPLATE/feature_request.md` - 功能请求模板
- `.github/PULL_REQUEST_TEMPLATE.md` - PR 模板
- `.github/workflows/release.yml` - 自动发布工作流

## 修改记录

### 已修改的文件
- ✅ `package.json` - 插件名称、作者、仓库信息
- ✅ `manifest.json` - 插件元信息
- ✅ `src/main.ts` - 插件名称文字
- ✅ `src/donateManager.ts` - 作者信息
- ✅ `LICENSE` - 版权信息
- ✅ `.gitignore` - 更新忽略规则

### 新增的文件
- ✅ `README.md` - 完整的项目说明
- ✅ `CHANGELOG.md` - 更新日志
- ✅ `CONTRIBUTING.md` - 贡献指南
- ✅ `versions.json` - 版本历史
- ✅ `.editorconfig` - 编辑器配置
- ✅ `.github/` - GitHub 模板和工作流

## 后续步骤

1. ✅ 修改所有作者和联系信息
2. ✅ 生成 GitHub 所需的所有文件
3. ✅ 清理不需要的文件
4. ⏭️ 初始化 Git 仓库
5. ⏭️ 推送到 GitHub
6. ⏭️ 创建第一个 Release
7. ⏭️ 向 Obsidian 插件市场提交插件

## 提交到 Obsidian 插件市场

在发布到 GitHub 后，可以提交到 Obsidian 插件市场：

1. 访问 https://github.com/obsidianmd/obsidian-releases
2. Fork 该仓库
3. 添加你的插件到 `plugins.json`：

```json
{
  "id": "ai-qixong-mp-preview",
  "name": "AI淇橦学微信预览",
  "author": "AI淇橦学",
  "description": "一键将 Markdown 文档转换为微信公众号格式",
  "repo": "aiqixong/ai-qixong-mp-preview"
}
```

4. 提交 Pull Request

---

**打包完成！** 📦

所有文件已准备就绪，位于 `D:\ai-qixong-mp-preview\`

# Ai淇橦学排版预览

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Obsidian](https://img.shields.io/badge/Obsidian-compatible-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

一键将 Markdown 文档转换为微信公众号格式

[English](#english) | [中文](#中文)

</div>

## 中文

### ✨ 特性

- 🚀 **一键转换**：无需繁琐排版，一键将 Markdown 转换为公众号格式
- 🎨 **丰富模板**：内置多种精美模板，支持自定义样式
- 🎯 **实时预览**：所见即所得的预览体验
- 🔧 **高度可定制**：支持自定义字体、背景、颜色等
- 📦 **模板管理**：方便的模板导入、导出、编辑功能
- 🎭 **字体管理**：支持自定义字体配置
- 🖼️ **背景管理**：支持自定义背景样式
- 🎨 **现代化UI**：优雅的左右分栏界面设计

### 📸 截图

#### 主界面
- 左侧设置栏：基础设置 + 管理导航
- 右侧内容区：动态显示预览或管理内容

#### 核心功能
- **效果预览**：实时查看当前设置的模板效果
- **模板管理**：导入、导出、编辑、删除模板
- **字体管理**：添加、编辑自定义字体
- **背景管理**：添加、编辑自定义背景

### 🚀 安装

#### 方法1：手动安装

1. 下载最新版本的 [main.js](../../releases/latest) 和 [manifest.json](../../raw/main/manifest.json)
2. 在你的 Obsidian vault 中创建插件目录：`.obsidian/plugins/ai-qitongxue-preview/`
3. 将下载的文件复制到该目录
4. 在 Obsidian 设置中启用插件

#### 方法2：从源码编译

```bash
# 克隆仓库
git clone https://github.com/aiqixong/ai-qitongxue-preview.git
cd ai-qitongxue-preview

# 安装依赖
npm install

# 编译
npm run build

# 复制 main.js, manifest.json, styles.css 到你的 Obsidian 插件目录
```

### 📖 使用

1. **打开插件**
   - 点击左侧边栏的 👁️ 图标
   - 或使用命令面板（Ctrl/Cmd + P）搜索"打开AI淇橦学微信预览"

2. **基础设置**
   - 选择默认模板
   - 调整默认字号

3. **使用预览**
   - 在预览区实时查看效果
   - 根据需要调整设置

4. **管理功能**
   - 点击"模板管理"进行模板相关操作
   - 点击"字体管理"管理自定义字体
   - 点击"背景管理"管理自定义背景

### 🎯 核心功能

#### 模板管理
- **导入模板**：从 JSON 文件导入自定义模板
- **导出模板**：导出模板到 JSON 文件
- **显示选项**：控制模板在列表中的显示/隐藏
- **删除模板**：删除不需要的模板

#### 字体管理
- **添加字体**：创建自定义字体配置
- **编辑字体**：修改现有字体配置
- **删除字体**：移除不需要的字体

#### 背景管理
- **新建背景**：创建自定义背景样式
- **显示选项**：控制背景的显示/隐藏
- **编辑背景**：修改现有背景配置
- **删除背景**：移除不需要的背景

### 🔧 配置

插件提供以下配置选项：

- **默认模板**：选择文章默认使用的模板
- **默认字号**：设置正文的默认字体大小

### ⚙️ 开发

```bash
# 开发模式（自动重新编译）
npm run dev

# 生产编译
npm run build
```

### 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

### 📝 更新日志

#### v1.0.0 (2025-01-15)
- 🎉 初始发布
- ✨ 实现左右分栏界面设计
- ✨ 添加模板管理功能
- ✨ 添加字体管理功能
- ✨ 添加背景管理功能
- 🎨 优化 UI/UX 体验

### 👨‍💻 作者

**AI淇橦学**

- 微信公众号：AI淇橦学
- GitHub：[@aiqixong](https://github.com/aiqixong)

### 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

### 🙏 致谢

- [Obsidian](https://obsidian.md/) - 强大的知识管理工具
- 原插件的作者提供的灵感

### 📮 联系方式

- 提交 [Issue](../../issues)
- 关注微信公众号：**AI淇橦学**

---

## English

### ✨ Features

- 🚀 **One-click conversion**: Convert Markdown to WeChat Official Account format without complex formatting
- 🎨 **Rich templates**: Built-in beautiful templates with custom style support
- 🎯 **Real-time preview**: WYSIWYG preview experience
- 🔧 **Highly customizable**: Support custom fonts, backgrounds, colors, etc.
- 📦 **Template management**: Easy template import, export, and editing
- 🎭 **Font management**: Support custom font configuration
- 🖼️ **Background management**: Support custom background styles
- 🎨 **Modern UI**: Elegant left-right split interface design

### 📸 Screenshots

#### Main Interface
- Left sidebar: Basic settings + Management navigation
- Right content area: Dynamic display of preview or management content

#### Core Features
- **Effect Preview**: Real-time view of current template settings
- **Template Management**: Import, export, edit, delete templates
- **Font Management**: Add, edit custom fonts
- **Background Management**: Add, edit custom backgrounds

### 🚀 Installation

#### Method 1: Manual Installation

1. Download the latest [main.js](../../releases/latest) and [manifest.json](../../raw/main/manifest.json)
2. Create plugin directory in your Obsidian vault: `.obsidian/plugins/ai-qitongxue-preview/`
3. Copy downloaded files to that directory
4. Enable the plugin in Obsidian settings

#### Method 2: Build from Source

```bash
# Clone repository
git clone https://github.com/aiqixong/ai-qitongxue-preview.git
cd ai-qitongxue-preview

# Install dependencies
npm install

# Build
npm run build

# Copy main.js, manifest.json, styles.css to your Obsidian plugins directory
```

### 📖 Usage

1. **Open Plugin**
   - Click the 👁️ icon on the left sidebar
   - Or use command palette (Ctrl/Cmd + P) and search "Open AI Qixong WeChat Preview"

2. **Basic Settings**
   - Select default template
   - Adjust default font size

3. **Use Preview**
   - View effects in real-time in the preview area
   - Adjust settings as needed

4. **Management Functions**
   - Click "Template Management" for template operations
   - Click "Font Management" to manage custom fonts
   - Click "Background Management" to manage custom backgrounds

### 🎯 Core Features

#### Template Management
- **Import Template**: Import custom templates from JSON files
- **Export Template**: Export templates to JSON files
- **Display Options**: Control template visibility in the list
- **Delete Template**: Remove unwanted templates

#### Font Management
- **Add Font**: Create custom font configurations
- **Edit Font**: Modify existing font configurations
- **Delete Font**: Remove unwanted fonts

#### Background Management
- **New Background**: Create custom background styles
- **Display Options**: Control background visibility
- **Edit Background**: Modify existing background configurations
- **Delete Background**: Remove unwanted backgrounds

### 🔧 Configuration

The plugin provides the following configuration options:

- **Default Template**: Select the default template for articles
- **Default Font Size**: Set the default font size for body text

### ⚙️ Development

```bash
# Development mode (auto-rebuild)
npm run dev

# Production build
npm run build
```

### 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📝 Changelog

#### v1.0.0 (2025-01-15)
- 🎉 Initial release
- ✨ Implement left-right split interface
- ✨ Add template management features
- ✨ Add font management features
- ✨ Add background management features
- 🎨 Optimize UI/UX experience

### 👨‍💻 Author

**AI Qixong**

- WeChat Official Account: AI淇橦学
- GitHub: [@aiqixong](https://github.com/aiqixong)

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

### 🙏 Acknowledgments

- [Obsidian](https://obsidian.md/) - Powerful knowledge management tool
- Original plugin author for inspiration

### 📮 Contact

- Submit [Issues](../../issues)
- Follow WeChat Official Account: **AI淇橦学**

---

<div align="center">

**⭐ 如果这个插件对你有帮助，请给个 Star 支持！**

**Made with ❤️ by AI淇橦学**

</div>

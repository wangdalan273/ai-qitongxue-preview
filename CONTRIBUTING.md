# 贡献指南

感谢你考虑为 Ai淇橦学排版预览 做出贡献！

## 如何贡献

### 报告 Bug

1. 在 [Issues](../../issues) 页面搜索现有问题，避免重复
2. 如果没有找到相同问题，创建新的 Issue
3. 在 Issue 中提供：
   - 清晰的标题和描述
   - 复现步骤
   - 预期行为 vs 实际行为
   - 截图（如果适用）
   - 环境信息（Obsidian 版本、操作系统等）

### 提交新功能建议

1. 先在 [Issues](../../issues) 中讨论你的想法
2. 说明为什么这个功能有用
3. 如果可能，提供设计草图或详细描述

### 提交代码

1. **Fork 仓库**
   ```bash
   # 1. Fork 项目到你的 GitHub 账户
   # 2. Clone 你的 fork
   git clone https://github.com/YOUR_USERNAME/ai-qixong-mp-preview.git
   cd ai-qixong-mp-preview
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **进行修改**
   - 遵循现有代码风格
   - 添加必要的注释
   - 确保代码通过编译

4. **测试**
   ```bash
   npm install
   npm run build
   ```

5. **提交**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   # 或
   git commit -m "fix: fix bug description"
   ```

6. **推送到你的 fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **创建 Pull Request**
   - 访问原始仓库
   - 点击 "New Pull Request"
   - 提供清晰的描述
   - 等待代码审查

### 代码规范

#### TypeScript 规范

```typescript
// ✅ 好的示例
class ExampleManager {
    private items: Item[];

    constructor(items: Item[]) {
        this.items = items;
    }

    public getItem(id: string): Item | undefined {
        return this.items.find(item => item.id === id);
    }
}
```

#### 命名规范

- **类名**: PascalCase (例如: `TemplateManager`)
- **函数/方法**: camelCase (例如: `getTemplate()`)
- **常量**: UPPER_SNAKE_CASE (例如: `MAX_ITEMS`)
- **私有成员**: 以下划线开头 (例如: `_privateMethod`)

#### 注释规范

```typescript
/**
 * 获取模板配置
 * @param id 模板ID
 * @returns 模板对象，如果不存在则返回 undefined
 */
public getTemplate(id: string): Template | undefined {
    // 实现代码
}
```

### Pull Request 检查清单

在提交 PR 前，请确保：

- [ ] 代码通过编译（`npm run build`）
- [ ] 添加了必要的注释
- [ ] 更新了相关文档
- [ ] 没有引入新的警告
- [ ] 测试了修改的功能
- [ ] PR 描述清晰完整

### 获取帮助

如果你有任何问题：

- 查看 [现有 Issues](../../issues)
- 阅读 [README](README.md)
- 提交新的 Issue

## 许可证

通过贡献，你同意你的贡献将在 MIT 许可证下发布。

---

再次感谢你的贡献！🎉

import { App, PluginSettingTab, Setting, setIcon, Notice } from 'obsidian';
import MPPlugin from '../main'; // 修改插件名以匹配类名
import { CreateTemplateModal } from './CreateTemplateModal';
import { CreateFontModal } from './CreateFontModal';
import { CreateBackgroundModal } from './CreateBackgroundModal'; // 添加导入
import { ConfirmModal } from './ConfirmModal';
import { TemplatePreviewModal }  from './templatePreviewModal'; // 添加导入
export class MPSettingTab extends PluginSettingTab {
    plugin: MPPlugin; // 修改插件类型以匹配类名
    private expandedSections: Set<string> = new Set();
    private currentTab: string = 'preview'; // 当前选中的标签页

    constructor(app: App, plugin: MPPlugin) { // 修改插件类型以匹配类名
        super(app, plugin);
        this.plugin = plugin;
    }

    private createSection(containerEl: HTMLElement, title: string, renderContent: (contentEl: HTMLElement) => void) {
        const section = containerEl.createDiv('settings-section');
        const header = section.createDiv('settings-section-header');

        const toggle = header.createSpan('settings-section-toggle');
        setIcon(toggle, 'chevron-right');

        header.createEl('h4', { text: title });

        const content = section.createDiv('settings-section-content');
        renderContent(content);

        header.addEventListener('click', () => {
            const isExpanded = !section.hasClass('is-expanded');
            section.toggleClass('is-expanded', isExpanded);
            setIcon(toggle, isExpanded ? 'chevron-down' : 'chevron-right');
            if (isExpanded) {
                this.expandedSections.add(title);
            } else {
                this.expandedSections.delete(title);
            }
        });

        if (this.expandedSections.has(title) || (!containerEl.querySelector('.settings-section'))) {
            section.addClass('is-expanded');
            setIcon(toggle, 'chevron-down');
            this.expandedSections.add(title);
        }

        return section;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass('mp-settings');

        // 创建左右分栏容器
        const layoutContainer = containerEl.createDiv('mp-settings-layout');

        // 左侧设置区域
        const settingsSidebar = layoutContainer.createDiv('mp-settings-sidebar');

        // 侧边栏头部
        const sidebarHeader = settingsSidebar.createDiv('mp-settings-sidebar-header');
        sidebarHeader.createEl('h2', { text: 'Ai-qitongxue Preview' });

        // 设置项列表
        const settingsList = settingsSidebar.createDiv('mp-settings-list');

        // ========== 基础设置 ==========
        this.renderSectionTitle(settingsList, '基础设置');
        this.renderTemplateSettingsList(settingsList);
        this.renderFontSizeSettingsList(settingsList);

        // ========== 管理导航 ==========
        this.renderSectionTitle(settingsList, '管理');
        this.renderNavigationButtons(settingsList);

        // 右侧动态内容区
        const contentArea = layoutContainer.createDiv('mp-settings-content');

        // 根据当前选中的标签显示内容
        this.updateContentArea(contentArea);
    }

    /**
     * 渲染区块标题
     */
    private renderSectionTitle(containerEl: HTMLElement, title: string): void {
        const titleEl = containerEl.createDiv('mp-section-title');
        titleEl.textContent = title;
    }

    /**
     * 渲染导航按钮
     */
    private renderNavigationButtons(containerEl: HTMLElement): void {
        const tabs = [
            { id: 'preview', label: '效果预览', icon: '👁️' },
            { id: 'template', label: '模板管理', icon: '📄' },
            { id: 'font', label: '字体管理', icon: '🔤' },
            { id: 'background', label: '背景管理', icon: '🎨' }
        ];

        const navContainer = containerEl.createDiv('mp-nav-buttons');

        tabs.forEach(tab => {
            const btn = navContainer.createEl('button', {
                cls: `mp-nav-btn ${this.currentTab === tab.id ? 'active' : ''}`
            });
            btn.dataset.tabId = tab.id;
            btn.innerHTML = `${tab.icon} ${tab.label}`;
            btn.addEventListener('click', () => {
                this.currentTab = tab.id;
                this.display(); // 重新渲染以更新内容
            });
        });
    }

    /**
     * 更新右侧内容区
     */
    private updateContentArea(contentArea: HTMLElement): void {
        // 清空内容
        contentArea.empty();

        // 根据当前标签显示不同内容
        switch (this.currentTab) {
            case 'preview':
                this.renderPreviewContent(contentArea);
                break;
            case 'template':
                this.renderTemplateManagementContent(contentArea);
                break;
            case 'font':
                this.renderFontManagementContent(contentArea);
                break;
            case 'background':
                this.renderBackgroundManagementContent(contentArea);
                break;
        }
    }

    /**
     * 渲染预览内容
     */
    private renderPreviewContent(containerEl: HTMLElement): void {
        const header = containerEl.createDiv('mp-settings-content-header');
        header.createEl('h3', { text: '效果预览' });

        const content = containerEl.createDiv('mp-settings-content-body');
        const previewBox = content.createDiv('mp-preview-box');
        this.createPreviewContent(previewBox);
    }

    /**
     * 渲染模板管理内容
     */
    private renderTemplateManagementContent(containerEl: HTMLElement): void {
        const header = containerEl.createDiv('mp-settings-content-header');
        header.createEl('h3', { text: '模板管理' });

        const content = containerEl.createDiv('mp-settings-content-body mp-scrollable');
        this.renderTemplateManagement(content);
    }

    /**
     * 渲染字体管理内容
     */
    private renderFontManagementContent(containerEl: HTMLElement): void {
        const header = containerEl.createDiv('mp-settings-content-header');
        header.createEl('h3', { text: '字体管理' });

        const content = containerEl.createDiv('mp-settings-content-body mp-scrollable');
        this.renderFontManagement(content);
    }

    /**
     * 渲染背景管理内容
     */
    private renderBackgroundManagementContent(containerEl: HTMLElement): void {
        const header = containerEl.createDiv('mp-settings-content-header');
        header.createEl('h3', { text: '背景管理' });

        const content = containerEl.createDiv('mp-settings-content-body mp-scrollable');
        this.renderBackgroundManagement(content);
    }

    /**
     * 创建可折叠的面板
     */
    private createCollapsibleSection(
        containerEl: HTMLElement,
        title: string,
        id: string,
        renderContent: (contentEl: HTMLElement) => void
    ): void {
        const section = containerEl.createDiv('mp-collapsible-section');

        const header = section.createDiv('mp-collapsible-header');
        const toggle = header.createSpan('mp-collapsible-toggle');
        setIcon(toggle, 'chevron-right');
        header.createEl('h4', { text: title });

        const content = section.createDiv('mp-collapsible-content');
        renderContent(content);

        header.addEventListener('click', () => {
            const isExpanded = section.hasClass('is-expanded');
            section.toggleClass('is-expanded', !isExpanded);
            setIcon(toggle, isExpanded ? 'chevron-right' : 'chevron-down');
        });
    }

    private renderBasicSettings(containerEl: HTMLElement): void {
        // 字体管理区域
        const fontSection = containerEl.createDiv('mp-settings-subsection');
        const fontHeader = fontSection.createDiv('mp-settings-subsection-header');
        const fontToggle = fontHeader.createSpan('mp-settings-subsection-toggle');
        setIcon(fontToggle, 'chevron-right');

        fontHeader.createEl('h3', { text: '字体管理' });

        const fontContent = fontSection.createDiv('mp-settings-subsection-content');

        // 折叠/展开逻辑
        fontHeader.addEventListener('click', () => {
            const isExpanded = !fontSection.hasClass('is-expanded');
            fontSection.toggleClass('is-expanded', isExpanded);
            setIcon(fontToggle, isExpanded ? 'chevron-down' : 'chevron-right');
        });

        // 字体列表
        const fontList = fontContent.createDiv('font-management');
        this.plugin.settingsManager.getFontOptions().forEach(font => {
            const fontItem = fontList.createDiv('font-item');
            const setting = new Setting(fontItem)
                .setName(font.label)
                .setDesc(font.value);

            // 只为非预设字体添加编辑和删除按钮
            if (!font.isPreset) {
                setting
                    .addExtraButton(btn =>
                        btn.setIcon('pencil')
                            .setTooltip('编辑')
                            .onClick(() => {
                                new CreateFontModal(
                                    this.app,
                                    async (updatedFont) => {
                                        await this.plugin.settingsManager.updateFont(font.value, updatedFont);
                                        this.display();
                                        new Notice('请重启 Obsidian 或重新加载以使更改生效');
                                    },
                                    font
                                ).open();
                            }))
                    .addExtraButton(btn =>
                        btn.setIcon('trash')
                            .setTooltip('删除')
                            .onClick(() => {
                                // 新增确认模态框
                                new ConfirmModal(
                                    this.app,
                                    '确认删除字体',
                                    `确定要删除「${font.label}」字体配置吗？`,
                                    async () => {
                                        await this.plugin.settingsManager.removeFont(font.value);
                                        this.display();
                                        new Notice('请重启 Obsidian 或重新加载以使更改生效');
                                    }
                                ).open();
                            }));
            }
        });

        // 添加新字体按钮
        new Setting(fontContent)
            .addButton(btn => btn
                .setButtonText('+ 添加字体')
                .setCta()
                .onClick(() => {
                    new CreateFontModal(
                        this.app,
                        async (newFont) => {
                            await this.plugin.settingsManager.addCustomFont(newFont);
                            this.display();
                            new Notice('请重启 Obsidian 或重新加载以使更改生效');
                        }
                    ).open();
                }));
    }

    private renderTemplateSettings(containerEl: HTMLElement): void {
        // 模板显示设置部分
        const templateVisibilitySection = containerEl.createDiv('mp-settings-subsection');
        const templateVisibilityHeader = templateVisibilitySection.createDiv('mp-settings-subsection-header');

        const templateVisibilityToggle = templateVisibilityHeader.createSpan('mp-settings-subsection-toggle');
        setIcon(templateVisibilityToggle, 'chevron-right');

        templateVisibilityHeader.createEl('h3', { text: '模板显示选项' });

        const templateVisibilityContent = templateVisibilitySection.createDiv('mp-settings-subsection-content');

        // 折叠/展开逻辑
        templateVisibilityHeader.addEventListener('click', () => {
            const isExpanded = !templateVisibilitySection.hasClass('is-expanded');
            templateVisibilitySection.toggleClass('is-expanded', isExpanded);
            setIcon(templateVisibilityToggle, isExpanded ? 'chevron-down' : 'chevron-right');
        });

        // 模板选择容器
        const templateSelectionContainer = templateVisibilityContent.createDiv('template-selection-container');

        // 左侧：所有模板列表
        const allTemplatesContainer = templateSelectionContainer.createDiv('all-templates-container');
        allTemplatesContainer.createEl('h4', { text: '隐藏模板' });
        const allTemplatesList = allTemplatesContainer.createDiv('templates-list');

        // 中间：控制按钮
        const controlButtonsContainer = templateSelectionContainer.createDiv('control-buttons-container');
        const addButton = controlButtonsContainer.createEl('button', { text: '>' });
        const removeButton = controlButtonsContainer.createEl('button', { text: '<' });

        // 右侧：显示的模板列表
        const visibleTemplatesContainer = templateSelectionContainer.createDiv('visible-templates-container');
        visibleTemplatesContainer.createEl('h4', { text: '显示模板' });
        const visibleTemplatesList = visibleTemplatesContainer.createDiv('templates-list');

        // 获取所有模板
        const allTemplates = this.plugin.settingsManager.getAllTemplates();

        // 渲染模板列表
        const renderTemplateLists = () => {
            // 清空列表
            allTemplatesList.empty();
            visibleTemplatesList.empty();

            // 填充左侧列表（所有未显示的模板）
            allTemplates
                .filter(template => template.isVisible === false)
                .forEach(template => {
                    const templateItem = allTemplatesList.createDiv('template-list-item');
                    templateItem.textContent = template.name;
                    templateItem.dataset.templateId = template.id;

                    // 点击选中/取消选中
                    templateItem.addEventListener('click', () => {
                        templateItem.toggleClass('selected', !templateItem.hasClass('selected'));
                    });
                });

            // 填充右侧列表（所有显示的模板）
            allTemplates
                .filter(template => template.isVisible !== false) // 默认显示
                .forEach(template => {
                    const templateItem = visibleTemplatesList.createDiv('template-list-item');
                    templateItem.textContent = template.name;
                    templateItem.dataset.templateId = template.id;

                    // 点击选中/取消选中
                    templateItem.addEventListener('click', () => {
                        templateItem.toggleClass('selected', !templateItem.hasClass('selected'));
                    });
                });
        };

        // 初始渲染
        renderTemplateLists();

        // 添加按钮事件
        addButton.addEventListener('click', async () => {
            const selectedItems = Array.from(allTemplatesList.querySelectorAll('.template-list-item.selected'));
            if (selectedItems.length === 0) return;

            for (const item of selectedItems) {
                const templateId = (item as HTMLElement).dataset.templateId;
                if (!templateId) continue;

                const template = allTemplates.find(t => t.id === templateId);
                if (template) {
                    template.isVisible = true;
                    await this.plugin.settingsManager.updateTemplate(templateId, template);
                }
            }

            renderTemplateLists();
            new Notice('请重启 Obsidian 或重新加载以使更改生效');
        });

        // 移除按钮事件
        removeButton.addEventListener('click', async () => {
            const selectedItems = Array.from(visibleTemplatesList.querySelectorAll('.template-list-item.selected'));
            if (selectedItems.length === 0) return;

            for (const item of selectedItems) {
                const templateId = (item as HTMLElement).dataset.templateId;
                if (!templateId) continue;

                const template = allTemplates.find(t => t.id === templateId);
                if (template) {
                    template.isVisible = false;
                    await this.plugin.settingsManager.updateTemplate(templateId, template);
                }
            }

            renderTemplateLists();
            new Notice('请重启 Obsidian 或重新加载以使更改生效');
        });

        // 模板删除选项部分 - 新增
        const templateDeleteSection = containerEl.createDiv('mp-settings-subsection');
        const templateDeleteHeader = templateDeleteSection.createDiv('mp-settings-subsection-header');

        const templateDeleteToggle = templateDeleteHeader.createSpan('mp-settings-subsection-toggle');
        setIcon(templateDeleteToggle, 'chevron-right');

        templateDeleteHeader.createEl('h3', { text: '模板导入导出' });

        const templateDeleteContent = templateDeleteSection.createDiv('mp-settings-subsection-content');

        // 折叠/展开逻辑
        templateDeleteHeader.addEventListener('click', () => {
            const isExpanded = !templateDeleteSection.hasClass('is-expanded');
            templateDeleteSection.toggleClass('is-expanded', isExpanded);
            setIcon(templateDeleteToggle, isExpanded ? 'chevron-down' : 'chevron-right');
        });

        // 操作按钮区域
        const actionButtonsContainer = templateDeleteContent.createDiv('mp-template-action-buttons');

        // 导入模板按钮
        const importButton = actionButtonsContainer.createEl('button', {
            text: '📥 导入模板',
            cls: 'mp-template-action-btn'
        });
        importButton.addEventListener('click', () => this.importTemplates());

        // 导出全部按钮
        const exportAllButton = actionButtonsContainer.createEl('button', {
            text: '📤 导出全部自定义模板',
            cls: 'mp-template-action-btn'
        });
        exportAllButton.addEventListener('click', () => this.exportAllTemplates());

        // 模板列表
        const templateList = templateDeleteContent.createDiv('template-management');

        // 添加说明文字
        const deleteHint = templateList.createEl('p', {
            text: '点击删除按钮即可删除模板，预设模板删除后需重新编译插件才能恢复。可以导出单个模板或导入新模板。',
            cls: 'setting-item-description'
        });

        // 所有模板列表
        this.plugin.settingsManager.getAllTemplates()
            .forEach(template => {
                const templateItem = templateList.createDiv('template-item');

                // 为预设模板添加标识
                const templateType = template.isPreset ? ' (预设)' : ' (自定义)';

                new Setting(templateItem)
                    .setName(template.name + templateType)
                    .setDesc(template.description)
                    .addExtraButton(btn =>
                        btn.setIcon('eye')
                            .setTooltip('预览')
                            .onClick(() => {
                                new TemplatePreviewModal(this.app, template, this.plugin.templateManager).open();
                            }))
                    .addExtraButton(btn =>
                        btn.setIcon('trash')
                            .setTooltip('删除')
                            .onClick(() => {
                                new ConfirmModal(
                                    this.app,
                                    '确认删除模板',
                                    `确定要删除「${template.name}」模板吗？${template.isPreset ? '这是预设模板，删除后需要重新编译插件才能恢复。' : '此操作不可恢复。'}`,
                                    async () => {
                                        await this.plugin.settingsManager.removeTemplate(template.id);
                                        this.display();
                                        new Notice('模板已删除，请重启 Obsidian 或重新加载以使更改生效');
                                    }
                                ).open();
                            }))
                    .addExtraButton(btn =>
                        btn.setIcon('download')
                            .setTooltip('导出')
                            .onClick(() => {
                                this.exportSingleTemplate(template);
                            }));
            });

        // 添加新模板按钮
        new Setting(containerEl)
            .addButton(btn => btn
                .setButtonText('+ 新建模板')
                .setCta()
                .onClick(() => {
                    new CreateTemplateModal(
                        this.app,
                        this.plugin,
                        async (newTemplate) => {
                            await this.plugin.settingsManager.addCustomTemplate(newTemplate);
                            this.display();
                            new Notice('请重启 Obsidian 或重新加载以使更改生效');
                        }
                    ).open();
                }));
    }

    private renderBackgroundSettings(containerEl: HTMLElement): void {
        // 背景显示设置部分
        const backgroundVisibilitySection = containerEl.createDiv('mp-settings-subsection');
        const backgroundVisibilityHeader = backgroundVisibilitySection.createDiv('mp-settings-subsection-header');

        const backgroundVisibilityToggle = backgroundVisibilityHeader.createSpan('mp-settings-subsection-toggle');
        setIcon(backgroundVisibilityToggle, 'chevron-right');

        backgroundVisibilityHeader.createEl('h3', { text: '背景显示' });

        const backgroundVisibilityContent = backgroundVisibilitySection.createDiv('mp-settings-subsection-content');

        // 折叠/展开逻辑
        backgroundVisibilityHeader.addEventListener('click', () => {
            const isExpanded = !backgroundVisibilitySection.hasClass('is-expanded');
            backgroundVisibilitySection.toggleClass('is-expanded', isExpanded);
            setIcon(backgroundVisibilityToggle, isExpanded ? 'chevron-down' : 'chevron-right');
        });

        // 背景选择容器
        const backgroundSelectionContainer = backgroundVisibilityContent.createDiv('background-selection-container');

        // 左侧：所有背景列表
        const allBackgroundsContainer = backgroundSelectionContainer.createDiv('all-backgrounds-container');
        allBackgroundsContainer.createEl('h4', { text: '隐藏背景' });
        const allBackgroundsList = allBackgroundsContainer.createDiv('backgrounds-list');

        // 中间：控制按钮
        const controlButtonsContainer = backgroundSelectionContainer.createDiv('control-buttons-container');
        const addButton = controlButtonsContainer.createEl('button', { text: '>' });
        const removeButton = controlButtonsContainer.createEl('button', { text: '<' });

        // 右侧：显示的背景列表
        const visibleBackgroundsContainer = backgroundSelectionContainer.createDiv('visible-backgrounds-container');
        visibleBackgroundsContainer.createEl('h4', { text: '显示背景' });
        const visibleBackgroundsList = visibleBackgroundsContainer.createDiv('backgrounds-list');

        // 获取所有背景
        const allBackgrounds = this.plugin.settingsManager.getAllBackgrounds();

        // 渲染背景列表
        const renderBackgroundLists = () => {
            // 清空列表
            allBackgroundsList.empty();
            visibleBackgroundsList.empty();

            // 填充左侧列表（所有未显示的背景）
            allBackgrounds
                .filter(background => background.isVisible === false)
                .forEach(background => {
                    const backgroundItem = allBackgroundsList.createDiv('background-list-item');
                    backgroundItem.textContent = background.name;
                    backgroundItem.dataset.backgroundId = background.id;

                    // 点击选中/取消选中
                    backgroundItem.addEventListener('click', () => {
                        backgroundItem.toggleClass('selected', !backgroundItem.hasClass('selected'));
                    });
                });

            // 填充右侧列表（所有显示的背景）
            allBackgrounds
                .filter(background => background.isVisible !== false) // 默认显示
                .forEach(background => {
                    const backgroundItem = visibleBackgroundsList.createDiv('background-list-item');
                    backgroundItem.textContent = background.name;
                    backgroundItem.dataset.backgroundId = background.id;

                    // 点击选中/取消选中
                    backgroundItem.addEventListener('click', () => {
                        backgroundItem.toggleClass('selected', !backgroundItem.hasClass('selected'));
                    });
                });
        };

        // 初始渲染
        renderBackgroundLists();

        // 添加按钮事件
        addButton.addEventListener('click', async () => {
            const selectedItems = Array.from(allBackgroundsList.querySelectorAll('.background-list-item.selected'));
            if (selectedItems.length === 0) return;

            for (const item of selectedItems) {
                const backgroundId = (item as HTMLElement).dataset.backgroundId;
                if (!backgroundId) continue;

                const background = allBackgrounds.find(b => b.id === backgroundId);
                if (background) {
                    background.isVisible = true;
                    await this.plugin.settingsManager.updateBackground(backgroundId, background);
                }
            }

            renderBackgroundLists();
            new Notice('背景显示设置已更新');
        });

        // 移除按钮事件
        removeButton.addEventListener('click', async () => {
            const selectedItems = Array.from(visibleBackgroundsList.querySelectorAll('.background-list-item.selected'));
            if (selectedItems.length === 0) return;

            for (const item of selectedItems) {
                const backgroundId = (item as HTMLElement).dataset.backgroundId;
                if (!backgroundId) continue;

                const background = allBackgrounds.find(b => b.id === backgroundId);
                if (background) {
                    background.isVisible = false;
                    await this.plugin.settingsManager.updateBackground(backgroundId, background);
                }
            }

            renderBackgroundLists();
            new Notice('背景显示已更新');
        });

        // 背景管理区域
        const backgroundList = containerEl.createDiv('background-management');

        // 渲染自定义背景
        backgroundList.createEl('h4', { text: '自定义背景', cls: 'background-custom-header' });
        this.plugin.settingsManager.getAllBackgrounds()
            .filter(background => !background.isPreset)
            .forEach(background => {
                const backgroundItem = backgroundList.createDiv('background-item');
                new Setting(backgroundItem)
                    .setName(background.name)
                    .addExtraButton(btn =>
                        btn.setIcon('pencil')
                            .setTooltip('编辑')
                            .onClick(() => {
                                // 使用背景编辑模态框
                                new CreateBackgroundModal(
                                    this.app,
                                    async (updatedBackground) => {
                                        await this.plugin.settingsManager.updateBackground(background.id, updatedBackground);
                                        this.display();
                                        new Notice('背景已更新');
                                    },
                                    background
                                ).open();
                            }))
                    .addExtraButton(btn =>
                        btn.setIcon('trash')
                            .setTooltip('删除')
                            .onClick(() => {
                                new ConfirmModal(
                                    this.app,
                                    '确认删除背景',
                                    `确定要删除「${background.name}」背景吗？此操作不可恢复。`,
                                    async () => {
                                        await this.plugin.settingsManager.removeBackground(background.id);
                                        this.display();
                                        new Notice('背景已删除');
                                    }
                                ).open();
                            }));
                
                // 添加背景预览
                const previewEl = backgroundItem.createDiv('background-preview');
                previewEl.setAttribute('style', background.style);
            });

        // 添加新背景按钮
        new Setting(containerEl)
            .addButton(btn => btn
                .setButtonText('+ 新建背景')
                .setCta()
                .onClick(() => {
                    // 使用新的背景创建模态框
                    new CreateBackgroundModal(
                        this.app,
                        async (newBackground) => {
                            await this.plugin.settingsManager.addCustomBackground(newBackground);
                            this.display();
                            new Notice('背景已创建');
                        }
                    ).open();
                }));
    }

    /**
     * 导出单个模板为 JSON 文件
     */
    private exportSingleTemplate(template: any) {
        try {
            // 生成文件名
            const filename = `${template.name}-${template.id}.json`;

            // 创建 JSON 内容
            const jsonContent = JSON.stringify(template, null, 2);

            // 创建 Blob 并下载
            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';

            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            new Notice(`模板 "${template.name}" 已导出`);
        } catch (error) {
            new Notice('导出失败: ' + (error as Error).message);
        }
    }

    /**
     * 导出所有自定义模板
     */
    private async exportAllTemplates() {
        try {
            const customTemplates = this.plugin.settingsManager.getAllTemplates()
                .filter(t => !t.isPreset);

            if (customTemplates.length === 0) {
                new Notice('没有自定义模板可以导出');
                return;
            }

            // 逐个导出自定义模板
            new Notice(`将导出 ${customTemplates.length} 个自定义模板`);

            for (const template of customTemplates) {
                await new Promise(resolve => setTimeout(resolve, 100));

                const filename = `${template.name}-${template.id}.json`;
                const jsonContent = JSON.stringify(template, null, 2);
                const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.style.display = 'none';

                document.body.appendChild(a);
                a.click();

                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            new Notice(`已导出 ${customTemplates.length} 个自定义模板`);
        } catch (error) {
            new Notice('导出失败: ' + (error as Error).message);
        }
    }

    /**
     * 导入模板（支持 JSON 和 CSS 格式）
     */
    private async importTemplates() {
        try {
            // 创建文件选择器
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = '.json,.css';

            input.onchange = async (e: Event) => {
                const files = (e.target as HTMLInputElement).files;
                if (!files || files.length === 0) return;

                let importCount = 0;
                let skipCount = 0;
                let errorCount = 0;

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const fileName = file.name;

                    try {
                        const content = await file.text();

                        if (fileName.endsWith('.json')) {
                            // 处理 JSON 格式
                            try {
                                const template = JSON.parse(content);

                                // 验证模板结构
                                if (!template.id || !template.name || !template.styles) {
                                    throw new Error('无效的模板格式');
                                }

                                // 检查是否已存在
                                const existingTemplate = this.plugin.settingsManager.getTemplate(template.id);

                                if (existingTemplate) {
                                    // 询问是否覆盖
                                    const shouldOverwrite = await this.askOverwrite(template.name);
                                    if (shouldOverwrite) {
                                        if (template.isPreset) {
                                            await this.plugin.settingsManager.addCustomTemplate({ ...template, isPreset: false });
                                        } else {
                                            await this.plugin.settingsManager.updateTemplate(template.id, { ...template, isPreset: false });
                                        }
                                        importCount++;
                                    } else {
                                        skipCount++;
                                    }
                                } else {
                                    // 新模板，直接添加
                                    await this.plugin.settingsManager.addCustomTemplate({ ...template, isPreset: false });
                                    importCount++;
                                }
                            } catch (parseError) {
                                console.error(`解析 JSON 失败: ${fileName}`, parseError);
                                errorCount++;
                            }
                        } else if (fileName.endsWith('.css')) {
                            // 处理 CSS 格式 - 提示用户使用创建模板功能
                            new Notice(`${fileName}: CSS 文件请使用"新建模板"功能导入`);
                            skipCount++;
                        }
                    } catch (fileError) {
                        console.error(`读取文件失败: ${fileName}`, fileError);
                        errorCount++;
                    }
                }

                // 显示结果
                this.display();

                if (importCount > 0) {
                    new Notice(`成功导入 ${importCount} 个模板，请重启 Obsidian 或重新加载以使更改生效`);
                }
                if (skipCount > 0) {
                    new Notice(`跳过 ${skipCount} 个文件（CSS 文件请使用"新建模板"导入）`);
                }
                if (errorCount > 0) {
                    new Notice(`${errorCount} 个文件导入失败`);
                }
            };

            input.click();
        } catch (error) {
            new Notice('导入失败: ' + (error as Error).message);
        }
    }

    /**
     * 询问是否覆盖已存在的模板
     */
    private async askOverwrite(templateName: string): Promise<boolean> {
        return new Promise((resolve) => {
            // 创建简单的确认对话框
            const confirmed = window.confirm(`模板 "${templateName}" 已存在，是否覆盖？\n\n点击"确定"覆盖，点击"取消"跳过。`);
            resolve(confirmed);
        });
    }

    /**
     * 渲染模板设置列表项
     */
    private renderTemplateSettingsList(containerEl: HTMLElement): void {
        const settings = this.plugin.settingsManager.getSettings();

        const settingItem = containerEl.createDiv('mp-setting-item');

        const label = settingItem.createDiv('mp-setting-label');
        label.createEl('h4', { text: '默认模板' });
        label.createEl('p', { text: '文章默认使用的模板样式' });

        const control = settingItem.createDiv('mp-setting-control');

        const select = control.createEl('select', { cls: 'mp-setting-select' });
        const templates = this.plugin.settingsManager.getVisibleTemplates();

        templates.forEach(template => {
            const option = select.createEl('option', {
                value: template.id,
                text: template.name
            });
            if (template.id === settings.templateId) {
                option.selected = true;
            }
        });

        select.addEventListener('change', async () => {
            await this.plugin.settingsManager.updateSettings({ templateId: select.value });
            this.plugin.templateManager.setCurrentTemplate(select.value);
            this.updatePreview();
        });
    }

    /**
     * 渲染字号设置列表项
     */
    private renderFontSizeSettingsList(containerEl: HTMLElement): void {
        const settings = this.plugin.settingsManager.getSettings();

        const settingItem = containerEl.createDiv('mp-setting-item');

        const label = settingItem.createDiv('mp-setting-label');
        label.createEl('h4', { text: '默认字号' });
        label.createEl('p', { text: '正文的默认字体大小' });

        const control = settingItem.createDiv('mp-setting-control');

        const input = control.createEl('input', {
            type: 'text',
            value: settings.fontSize?.toString() || '16',
            cls: 'mp-setting-input'
        }) as HTMLInputElement;
        input.setAttribute('min', '12');
        input.setAttribute('max', '24');

        input.addEventListener('change', async () => {
            const size = parseInt(input.value);
            if (size >= 12 && size <= 24) {
                await this.plugin.settingsManager.updateSettings({ fontSize: size });
                this.plugin.templateManager.setFontSize(size);
                this.updatePreview();
            }
        });
    }

    /**
     * 创建预览内容
     */
    private createPreviewContent(containerEl: HTMLElement): void {
        containerEl.innerHTML = `
            <div class="mp-preview-content" style="padding: 20px;">
                <h2 style="margin-bottom: 16px;">文章标题示例</h2>
                <p style="margin-bottom: 12px; line-height: 1.8;">
                    这是一段示例文字，用于预览模板的实际效果。你可以看到标题、段落等元素的样式呈现。
                </p>
                <h3 style="margin-bottom: 12px;">小标题示例</h3>
                <p style="margin-bottom: 12px; line-height: 1.8;">
                    这里是正文内容，展示了文字排版和间距效果。通过右侧的设置面板，你可以实时调整模板、背景和字号。
                </p>
                <ul style="margin-bottom: 12px; padding-left: 20px;">
                    <li>列表项目一</li>
                    <li>列表项目二</li>
                    <li>列表项目三</li>
                </ul>
                <p style="margin-bottom: 12px; line-height: 1.8;">
                    <strong>加粗文字</strong>和<em>斜体文字</em>的展示效果。
                </p>
                <blockquote style="margin: 12px 0; padding-left: 16px; border-left: 4px solid #5B9BD5;">
                    这是一段引用文字，用于展示引用块的样式效果。
                </blockquote>
            </div>
        `;

        // 应用当前模板
        setTimeout(() => {
            const contentEl = containerEl.querySelector('.mp-preview-content');
            if (contentEl) {
                this.plugin.templateManager.applyTemplate(contentEl as HTMLElement);
            }
        }, 100);
    }

    /**
     * 更新预览区域
     */
    private updatePreview(): void {
        const previewBox = document.querySelector('.mp-preview-box');
        if (previewBox) {
            const contentEl = previewBox.querySelector('.mp-preview-content');
            if (contentEl) {
                this.plugin.templateManager.applyTemplate(contentEl as HTMLElement);
            }
        }
    }

    /**
     * 渲染模板管理内容
     */
    private renderTemplateManagement(containerEl: HTMLElement): void {
        // 操作按钮区域
        const actionButtonsContainer = containerEl.createDiv('mp-compact-actions');
        actionButtonsContainer.createEl('button', {
            text: '📥 导入模板',
            cls: 'mp-compact-btn'
        }).addEventListener('click', () => this.importTemplates());

        actionButtonsContainer.createEl('button', {
            text: '📤 导出自定义模板',
            cls: 'mp-compact-btn'
        }).addEventListener('click', () => this.exportAllTemplates());

        actionButtonsContainer.createEl('button', {
            text: '+ 新建模板',
            cls: 'mp-compact-btn mp-compact-btn-primary'
        }).addEventListener('click', () => {
            new CreateTemplateModal(
                this.app,
                this.plugin,
                async (newTemplate) => {
                    await this.plugin.settingsManager.addCustomTemplate(newTemplate);
                    this.display();
                    new Notice('请重启 Obsidian 或重新加载以使更改生效');
                }
            ).open();
        });

        // 模板显示选项
        const visibilitySection = containerEl.createDiv('mp-subsection');
        visibilitySection.createEl('h5', { text: '模板显示选项', cls: 'mp-subsection-title' });

        const templateSelectionContainer = visibilitySection.createDiv('mp-dual-list-container');

        // 左侧：隐藏的模板
        const hiddenContainer = templateSelectionContainer.createDiv('mp-list-column');
        hiddenContainer.createEl('h6', { text: '隐藏模板' });
        const hiddenList = hiddenContainer.createDiv('mp-list-items');

        // 中间：控制按钮
        const controlButtons = templateSelectionContainer.createDiv('mp-list-controls');
        const showBtn = controlButtons.createEl('button', { text: '显示 ▶', cls: 'mp-control-btn' });
        const hideBtn = controlButtons.createEl('button', { text: '◀ 隐藏', cls: 'mp-control-btn' });

        // 右侧：显示的模板
        const visibleContainer = templateSelectionContainer.createDiv('mp-list-column');
        visibleContainer.createEl('h6', { text: '显示模板' });
        const visibleList = visibleContainer.createDiv('mp-list-items');

        const allTemplates = this.plugin.settingsManager.getAllTemplates();

        const renderLists = () => {
            hiddenList.empty();
            visibleList.empty();

            allTemplates.filter(t => t.isVisible === false).forEach(template => {
                const item = hiddenList.createDiv('mp-list-item');
                item.textContent = template.name;
                item.dataset.templateId = template.id;
                item.addEventListener('click', () => {
                    const isSelected = item.hasClass('selected');
                    item.toggleClass('selected', !isSelected);
                });
            });

            allTemplates.filter(t => t.isVisible !== false).forEach(template => {
                const item = visibleList.createDiv('mp-list-item');
                item.textContent = template.name;
                item.dataset.templateId = template.id;
                item.addEventListener('click', () => {
                    const isSelected = item.hasClass('selected');
                    item.toggleClass('selected', !isSelected);
                });
            });
        };

        renderLists();

        showBtn.addEventListener('click', async () => {
            const selected = Array.from(hiddenList.querySelectorAll('.mp-list-item.selected'));
            for (const item of selected) {
                const templateId = (item as HTMLElement).dataset.templateId;
                if (templateId) {
                    const template = allTemplates.find(t => t.id === templateId);
                    if (template) {
                        template.isVisible = true;
                        await this.plugin.settingsManager.updateTemplate(templateId, template);
                    }
                }
            }
            renderLists();
            new Notice('请重启 Obsidian 或重新加载以使更改生效');
        });

        hideBtn.addEventListener('click', async () => {
            const selected = Array.from(visibleList.querySelectorAll('.mp-list-item.selected'));
            for (const item of selected) {
                const templateId = (item as HTMLElement).dataset.templateId;
                if (templateId) {
                    const template = allTemplates.find(t => t.id === templateId);
                    if (template) {
                        template.isVisible = false;
                        await this.plugin.settingsManager.updateTemplate(templateId, template);
                    }
                }
            }
            renderLists();
            new Notice('请重启 Obsidian 或重新加载以使更改生效');
        });

        // 模板删除列表
        const deleteSection = containerEl.createDiv('mp-subsection');
        deleteSection.createEl('h5', { text: '模板删除', cls: 'mp-subsection-title' });

        this.plugin.settingsManager.getAllTemplates().forEach(template => {
            const templateItem = deleteSection.createDiv('mp-compact-item');
            const label = templateItem.createDiv('mp-item-label');
            label.textContent = template.name + (template.isPreset ? ' (预设)' : ' (自定义)');

            const actions = templateItem.createDiv('mp-item-actions');

            // 预览按钮
            actions.createEl('button', { cls: 'mp-action-btn' }).textContent = '👁️';
            actions.lastChild?.addEventListener('click', () => {
                new TemplatePreviewModal(this.app, template, this.plugin.templateManager).open();
            });

            // 导出按钮
            actions.createEl('button', { cls: 'mp-action-btn' }).textContent = '📤';
            actions.lastChild?.addEventListener('click', () => this.exportSingleTemplate(template));

            // 删除按钮
            const deleteBtn = actions.createEl('button', { cls: 'mp-action-btn mp-action-btn-danger' });
            deleteBtn.textContent = '🗑️';
            deleteBtn.addEventListener('click', () => {
                new ConfirmModal(
                    this.app,
                    '确认删除模板',
                    `确定要删除「${template.name}」模板吗？${template.isPreset ? '这是预设模板，删除后需要重新编译插件才能恢复。' : '此操作不可恢复。'}`,
                    async () => {
                        await this.plugin.settingsManager.removeTemplate(template.id);
                        this.display();
                        new Notice('模板已删除，请重启 Obsidian 或重新加载以使更改生效');
                    }
                ).open();
            });
        });
    }

    /**
     * 渲染字体管理内容
     */
    private renderFontManagement(containerEl: HTMLElement): void {
        // 添加字体按钮
        const addBtnContainer = containerEl.createDiv('mp-compact-actions');
        addBtnContainer.createEl('button', {
            text: '+ 添加字体',
            cls: 'mp-compact-btn mp-compact-btn-primary'
        }).addEventListener('click', () => {
            new CreateFontModal(
                this.app,
                async (newFont) => {
                    await this.plugin.settingsManager.addCustomFont(newFont);
                    this.display();
                    new Notice('请重启 Obsidian 或重新加载以使更改生效');
                }
            ).open();
        });

        // 字体列表
        this.plugin.settingsManager.getFontOptions().forEach(font => {
            const fontItem = containerEl.createDiv('mp-compact-item');
            const label = fontItem.createDiv('mp-item-label');
            label.textContent = `${font.label} (${font.value})`;

            if (!font.isPreset) {
                const actions = fontItem.createDiv('mp-item-actions');

                // 编辑按钮
                actions.createEl('button', { cls: 'mp-action-btn' }).textContent = '✏️';
                actions.lastChild?.addEventListener('click', () => {
                    new CreateFontModal(
                        this.app,
                        async (updatedFont) => {
                            await this.plugin.settingsManager.updateFont(font.value, updatedFont);
                            this.display();
                            new Notice('请重启 Obsidian 或重新加载以使更改生效');
                        },
                        font
                    ).open();
                });

                // 删除按钮
                const deleteBtn = actions.createEl('button', { cls: 'mp-action-btn mp-action-btn-danger' });
                deleteBtn.textContent = '🗑️';
                deleteBtn.addEventListener('click', () => {
                    new ConfirmModal(
                        this.app,
                        '确认删除字体',
                        `确定要删除「${font.label}」字体配置吗？`,
                        async () => {
                            await this.plugin.settingsManager.removeFont(font.value);
                            this.display();
                            new Notice('请重启 Obsidian 或重新加载以使更改生效');
                        }
                    ).open();
                });
            }
        });
    }

    /**
     * 渲染背景管理内容
     */
    private renderBackgroundManagement(containerEl: HTMLElement): void {
        // 添加背景按钮
        const addBtnContainer = containerEl.createDiv('mp-compact-actions');
        addBtnContainer.createEl('button', {
            text: '+ 新建背景',
            cls: 'mp-compact-btn mp-compact-btn-primary'
        }).addEventListener('click', () => {
            new CreateBackgroundModal(
                this.app,
                async (newBackground) => {
                    await this.plugin.settingsManager.addCustomBackground(newBackground);
                    this.display();
                    new Notice('背景已创建');
                }
            ).open();
        });

        // 背景显示选项
        const visibilitySection = containerEl.createDiv('mp-subsection');
        visibilitySection.createEl('h5', { text: '背景显示选项', cls: 'mp-subsection-title' });

        const bgSelectionContainer = visibilitySection.createDiv('mp-dual-list-container');

        const hiddenContainer = bgSelectionContainer.createDiv('mp-list-column');
        hiddenContainer.createEl('h6', { text: '隐藏背景' });
        const hiddenList = hiddenContainer.createDiv('mp-list-items');

        const controlButtons = bgSelectionContainer.createDiv('mp-list-controls');
        const showBtn = controlButtons.createEl('button', { text: '显示 ▶', cls: 'mp-control-btn' });
        const hideBtn = controlButtons.createEl('button', { text: '◀ 隐藏', cls: 'mp-control-btn' });

        const visibleContainer = bgSelectionContainer.createDiv('mp-list-column');
        visibleContainer.createEl('h6', { text: '显示背景' });
        const visibleList = visibleContainer.createDiv('mp-list-items');

        const allBackgrounds = this.plugin.settingsManager.getAllBackgrounds();

        const renderLists = () => {
            hiddenList.empty();
            visibleList.empty();

            allBackgrounds.filter(b => b.isVisible === false).forEach(bg => {
                const item = hiddenList.createDiv('mp-list-item');
                item.textContent = bg.name;
                item.dataset.bgId = bg.id;
                item.addEventListener('click', () => {
                    const isSelected = item.hasClass('selected');
                    item.toggleClass('selected', !isSelected);
                });
            });

            allBackgrounds.filter(b => b.isVisible !== false).forEach(bg => {
                const item = visibleList.createDiv('mp-list-item');
                item.textContent = bg.name;
                item.dataset.bgId = bg.id;
                item.addEventListener('click', () => {
                    const isSelected = item.hasClass('selected');
                    item.toggleClass('selected', !isSelected);
                });
            });
        };

        renderLists();

        showBtn.addEventListener('click', async () => {
            const selected = Array.from(hiddenList.querySelectorAll('.mp-list-item.selected'));
            for (const item of selected) {
                const bgId = (item as HTMLElement).dataset.bgId;
                if (bgId) {
                    const bg = allBackgrounds.find(b => b.id === bgId);
                    if (bg) {
                        bg.isVisible = true;
                        await this.plugin.settingsManager.updateBackground(bgId, bg);
                    }
                }
            }
            renderLists();
            new Notice('背景显示设置已更新');
        });

        hideBtn.addEventListener('click', async () => {
            const selected = Array.from(visibleList.querySelectorAll('.mp-list-item.selected'));
            for (const item of selected) {
                const bgId = (item as HTMLElement).dataset.bgId;
                if (bgId) {
                    const bg = allBackgrounds.find(b => b.id === bgId);
                    if (bg) {
                        bg.isVisible = false;
                        await this.plugin.settingsManager.updateBackground(bgId, bg);
                    }
                }
            }
            renderLists();
            new Notice('背景显示已更新');
        });

        // 自定义背景列表
        const customSection = containerEl.createDiv('mp-subsection');
        customSection.createEl('h5', { text: '自定义背景', cls: 'mp-subsection-title' });

        this.plugin.settingsManager.getAllBackgrounds()
            .filter(bg => !bg.isPreset)
            .forEach(background => {
                const bgItem = customSection.createDiv('mp-compact-item');
                const label = bgItem.createDiv('mp-item-label');
                label.textContent = background.name;

                const actions = bgItem.createDiv('mp-item-actions');

                // 编辑按钮
                actions.createEl('button', { cls: 'mp-action-btn' }).textContent = '✏️';
                actions.lastChild?.addEventListener('click', () => {
                    new CreateBackgroundModal(
                        this.app,
                        async (updatedBackground) => {
                            await this.plugin.settingsManager.updateBackground(background.id, updatedBackground);
                            this.display();
                            new Notice('背景已更新');
                        },
                        background
                    ).open();
                });

                // 删除按钮
                const deleteBtn = actions.createEl('button', { cls: 'mp-action-btn mp-action-btn-danger' });
                deleteBtn.textContent = '🗑️';
                deleteBtn.addEventListener('click', () => {
                    new ConfirmModal(
                        this.app,
                        '确认删除背景',
                        `确定要删除「${background.name}」背景吗？此操作不可恢复。`,
                        async () => {
                            await this.plugin.settingsManager.removeBackground(background.id);
                            this.display();
                            new Notice('背景已删除');
                        }
                    ).open();
                });
            });
    }
}
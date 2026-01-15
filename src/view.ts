import { ItemView, WorkspaceLeaf, MarkdownRenderer, TFile, setIcon, MarkdownView, Notice } from 'obsidian';
import { MPConverter } from './converter';
import { CopyManager } from './copyManager';
import type { TemplateManager } from './templateManager';
import { DonateManager } from './donateManager';
import type { SettingsManager } from './settings/settings';
import { BackgroundManager } from './backgroundManager';
import { ExportManager } from './exportManager';
import { ExportSettingsModal } from './settings/ExportSettingsModal';
import type { ExportOptions } from './exportManager';
export const VIEW_TYPE_MP = 'mp-preview';

export class MPView extends ItemView {
    private previewEl: HTMLElement;
    private currentFile: TFile | null = null;
    private updateTimer: NodeJS.Timeout | null = null;
    private isPreviewLocked: boolean = false;
    private lockButton: HTMLButtonElement;
    private copyButton: HTMLButtonElement;
    private syncScrollButton: HTMLButtonElement;
    private exportButton: HTMLButtonElement;
    private templateManager: TemplateManager;
    private settingsManager: SettingsManager;
    private customTemplateSelect: HTMLElement;
    private fontSizeSelect: HTMLInputElement;
    private backgroundManager: BackgroundManager;
    private customBackgroundSelect: HTMLElement;
    private syncScrollEnabled: boolean = false;
    private isScrolling: boolean = false;
    private editorScrollHandler: ((evt: Event) => void) | null = null;
    private previewScrollHandler: ((evt: Event) => void) | null = null;
    private editorScrollEl: HTMLElement | null = null; // 保存编辑器滚动元素引用

    constructor(
        leaf: WorkspaceLeaf, 
        templateManager: TemplateManager,
        settingsManager: SettingsManager
    ) {
        super(leaf);
        this.templateManager = templateManager;
        this.settingsManager = settingsManager;
        this.backgroundManager = new BackgroundManager(this.settingsManager);
    }

    getViewType() {
        return VIEW_TYPE_MP;
    }

    getDisplayText() {
        return '公众号预览';
    }

    getIcon() {
       return 'eye';
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.classList.remove('view-content');
        container.classList.add('mp-view-content');

        // 顶部工具栏 - 主要操作
        const toolbar = container.createEl('div', { cls: 'mp-toolbar' });
        const controlsGroup = toolbar.createEl('div', { cls: 'mp-controls-group' });

        // 复制按钮
        this.copyButton = controlsGroup.createEl('button', {
            text: '复制到公众号',
            cls: 'mp-copy-button'
        });

        // 添加复制按钮点击事件
        this.copyButton.addEventListener('click', async () => {
            if (this.previewEl) {
                this.copyButton.disabled = true;
                this.copyButton.setText('复制中...');

                try {
                    await CopyManager.copyToClipboard(this.previewEl);
                    this.copyButton.setText('复制成功');

                    setTimeout(() => {
                        this.copyButton.disabled = false;
                        this.copyButton.setText('复制到公众号');
                    }, 2000);
                } catch (error) {
                    this.copyButton.setText('复制失败');
                    setTimeout(() => {
                        this.copyButton.disabled = false;
                        this.copyButton.setText('复制到公众号');
                    }, 2000);
                }
            }
        });

        // 导出按钮
        this.exportButton = controlsGroup.createEl('button', {
            text: '导出 HTML',
            cls: 'mp-export-button'
        });

        // 添加导出按钮点击事件
        this.exportButton.addEventListener('click', async () => {
            if (this.previewEl) {
                // 显示导出设置模态框
                const defaultOptions: ExportOptions = {
                    includeStyles: true,
                    inlineImages: true,
                    includeMetadata: true,
                    format: 'full',
                    title: this.currentFile?.basename
                };

                new ExportSettingsModal(
                    this.app,
                    defaultOptions,
                    async (options) => {
                        this.exportButton.disabled = true;
                        this.exportButton.setText('导出中...');

                        try {
                            await ExportManager.exportToHtml(
                                this.previewEl,
                                this.currentFile,
                                options
                            );
                            this.exportButton.setText('导出成功');
                            new Notice('HTML文件已导出到exports文件夹');

                            setTimeout(() => {
                                this.exportButton.disabled = false;
                                this.exportButton.setText('导出 HTML');
                            }, 2000);
                        } catch (error) {
                            this.exportButton.setText('导出失败');
                            new Notice('导出失败: ' + error.message);

                            setTimeout(() => {
                                this.exportButton.disabled = false;
                                this.exportButton.setText('导出 HTML');
                            }, 2000);
                        }
                    }
                ).open();
            }
        });

        // 底部工具栏 - 样式设置
        const bottomBar = container.createEl('div', { cls: 'mp-bottom-bar' });
        const bottomControlsGroup = bottomBar.createEl('div', { cls: 'mp-controls-group' });

        // 锁定按钮
        this.lockButton = bottomControlsGroup.createEl('button', {
            cls: 'mp-lock-button',
            attr: { 'aria-label': '关闭实时预览状态' }
        });
        setIcon(this.lockButton, 'lock');
        this.lockButton.setAttribute('aria-label', '开启实时预览状态');
        this.lockButton.addEventListener('click', () => this.togglePreviewLock());

        // 同步滚动按钮
        this.syncScrollButton = bottomControlsGroup.createEl('button', {
            cls: 'mp-sync-scroll-button',
            attr: { 'aria-label': '开启同步滚动' }
        });
        setIcon(this.syncScrollButton, 'split');
        this.syncScrollButton.addEventListener('click', () => this.toggleSyncScroll());

        // 添加背景选择器
        const backgroundOptions = [
            { value: '', label: '无背景' },
            ...(this.settingsManager.getVisibleBackgrounds()?.map(bg => ({
                value: bg.id,
                label: bg.name
            })) || [])
        ];

        this.customBackgroundSelect = this.createCustomSelect(
            bottomControlsGroup,
            'mp-background-select',
            backgroundOptions
        );

        // 添加背景选择器的事件监听
        this.customBackgroundSelect.querySelector('.custom-select')?.addEventListener('change', async (e: any) => {
            const value = e.detail.value;
            this.backgroundManager.setBackground(value);
            await this.settingsManager.updateSettings({
                backgroundId: value
            });
            this.backgroundManager.applyBackground(this.previewEl);
        });

        // 创建自定义下拉选择器
        this.customTemplateSelect = this.createCustomSelect(
            bottomControlsGroup,
            'mp-template-select',
            await this.getTemplateOptions()
        );
        this.customTemplateSelect.id = 'template-select';

        // 添加模板选择器的 change 事件监听
        this.customTemplateSelect.querySelector('.custom-select')?.addEventListener('change', async (e: any) => {
            const value = e.detail.value;
            this.templateManager.setCurrentTemplate(value);
            await this.settingsManager.updateSettings({
                templateId: value
            });
            this.templateManager.applyTemplate(this.previewEl);
        });

        // 字号调整
        const fontSizeGroup = bottomControlsGroup.createEl('div', { cls: 'mp-font-size-group' });
        const decreaseButton = fontSizeGroup.createEl('button', {
            cls: 'mp-font-size-btn',
            text: '-'
        });
        this.fontSizeSelect = fontSizeGroup.createEl('input', {
            cls: 'mp-font-size-input',
            type: 'text',
            value: '16',
            attr: {
                style: 'border: none; outline: none; background: transparent;'
            }
        });
        const increaseButton = fontSizeGroup.createEl('button', {
            cls: 'mp-font-size-btn',
            text: '+'
        });

        // 从设置中恢复上次的选择
        const settings = this.settingsManager.getSettings();
        
        // 恢复背景设置
        if (settings.backgroundId) {
            const backgroundSelect = this.customBackgroundSelect.querySelector('.selected-text');
            const backgroundDropdown = this.customBackgroundSelect.querySelector('.select-dropdown');
            if (backgroundSelect && backgroundDropdown) {
                const option = backgroundOptions.find(o => o.value === settings.backgroundId);
                if (option) {
                    backgroundSelect.textContent = option.label;
                    this.customBackgroundSelect.querySelector('.custom-select')?.setAttribute('data-value', option.value);
                    backgroundDropdown.querySelectorAll('.select-item').forEach(el => {
                        if (el.getAttribute('data-value') === option.value) {
                            el.classList.add('selected');
                        } else {
                            el.classList.remove('selected');
                        }
                    });
                }
            }
            this.backgroundManager.setBackground(settings.backgroundId);
        }

        // 恢复设置
        if (settings.templateId) {
            const templateSelect = this.customTemplateSelect.querySelector('.selected-text');
            const templateDropdown = this.customTemplateSelect.querySelector('.select-dropdown');
            if (templateSelect && templateDropdown) {
                const option = await this.getTemplateOptions();
                const selected = option.find(o => o.value === settings.templateId);
                if (selected) {
                    templateSelect.textContent = selected.label;
                    this.customTemplateSelect.querySelector('.custom-select')?.setAttribute('data-value', selected.value);
                    templateDropdown.querySelectorAll('.select-item').forEach(el => {
                        if (el.getAttribute('data-value') === selected.value) {
                            el.classList.add('selected');
                        } else {
                            el.classList.remove('selected');
                        }
                    });
                }
            }
            this.templateManager.setCurrentTemplate(settings.templateId);
        }

        if (settings.fontSize) {
            this.fontSizeSelect.value = settings.fontSize.toString();
            this.templateManager.setFontSize(settings.fontSize);
        }

        // 更新字号调整事件
        const updateFontSize = async () => {
            const size = parseInt(this.fontSizeSelect.value);
            this.templateManager.setFontSize(size);
            await this.settingsManager.updateSettings({
                fontSize: size
            });
            this.templateManager.applyTemplate(this.previewEl);
        };

        // 字号调整按钮事件
        decreaseButton.addEventListener('click', () => {
            const currentSize = parseInt(this.fontSizeSelect.value);
            if (currentSize > 12) {
                this.fontSizeSelect.value = (currentSize - 1).toString();
                updateFontSize();
            }
        });

        increaseButton.addEventListener('click', () => {
            const currentSize = parseInt(this.fontSizeSelect.value);
            if (currentSize < 30) {
                this.fontSizeSelect.value = (currentSize + 1).toString();
                updateFontSize();
            }
        });

        this.fontSizeSelect.addEventListener('change', updateFontSize);
        // 预览区域
        this.previewEl = container.createEl('div', { cls: 'mp-preview-area' });

        // 帮助按钮 - 固定在右下角
        const helpButtonContainer = container.createEl('div', { cls: 'mp-help-button-container' });
        const helpButton = helpButtonContainer.createEl('button', {
            cls: 'mp-help-button',
            attr: { 'aria-label': '使用指南' }
        });
        setIcon(helpButton, 'help');
        // 帮助提示框
        helpButtonContainer.createEl('div', {
            cls: 'mp-help-tooltip',
            text: `使用指南：
1. 选择喜欢的模板
2. 调整字号大小
3. 点击【复制到公众号】
4. 在公众号编辑器粘贴
5. 解锁按钮控制实时预览
6. 同步按钮开启滚动同步`
        });

        // 监听文档变化
        this.registerEvent(
            this.app.workspace.on('file-open', this.onFileOpen.bind(this))
        );

        // 监听文档内容变化
        this.registerEvent(
            this.app.vault.on('modify', this.onFileModify.bind(this))
        );

        // 检查当前打开的文件
        const currentFile = this.app.workspace.getActiveFile();
        await this.onFileOpen(currentFile);
    }

    private updateControlsState(enabled: boolean) {
        this.lockButton.disabled = !enabled;
        // 更新所有自定义选择器的禁用状态
        const templateSelect = this.customTemplateSelect.querySelector('.custom-select');
        const backgroundSelect = this.customBackgroundSelect.querySelector('.custom-select');

        [templateSelect, backgroundSelect].forEach(select => {
            if (select) {
                select.classList.toggle('disabled', !enabled);
                select.setAttribute('style', `pointer-events: ${enabled ? 'auto' : 'none'}`);
            }
        });

        this.fontSizeSelect.disabled = !enabled;
        this.copyButton.disabled = !enabled;
        this.exportButton.disabled = !enabled;

        // 字号调节按钮的状态控制
        const fontSizeButtons = this.containerEl.querySelectorAll('.mp-font-size-btn');
        fontSizeButtons.forEach(button => {
            (button as HTMLButtonElement).disabled = !enabled;
        });
    }

    async onFileOpen(file: TFile | null) {
        this.currentFile = file;
        if (!file || file.extension !== 'md') {
            this.previewEl.empty();
            this.previewEl.createEl('div', {
                text: '只能预览 markdown 文本文档',
                cls: 'mp-empty-message'
            });
            this.updateControlsState(false);
            return;
        }

        this.updateControlsState(true);
        this.isPreviewLocked = false;
        setIcon(this.lockButton, 'unlock');
        await this.updatePreview();
    }

    private async togglePreviewLock() {
        this.isPreviewLocked = !this.isPreviewLocked;
        const lockIcon = this.isPreviewLocked ? 'lock' : 'unlock';
        const lockStatus = this.isPreviewLocked ? '开启实时预览状态' : '关闭实时预览状态';
        setIcon(this.lockButton, lockIcon);
        this.lockButton.setAttribute('aria-label', lockStatus);
        
        if (!this.isPreviewLocked) {
            await this.updatePreview();
        }
    }

    async onFileModify(file: TFile) {
        if (file === this.currentFile && !this.isPreviewLocked) {
            if (this.updateTimer) {
                clearTimeout(this.updateTimer);
            }
            
            this.updateTimer = setTimeout(() => {
                this.updatePreview();
            }, 500);
        }
    }

    async updatePreview() {
        if (!this.currentFile) return;

        // 保存当前滚动位置和内容高度
        const scrollPosition = this.previewEl.scrollTop;
        const prevHeight = this.previewEl.scrollHeight;
        const isAtBottom = (this.previewEl.scrollHeight - this.previewEl.scrollTop) <= (this.previewEl.clientHeight + 100);

        this.previewEl.empty();
        const content = await this.app.vault.cachedRead(this.currentFile);
        
        await MarkdownRenderer.render(
            this.app,
            content,
            this.previewEl,
            this.currentFile.path,
            this
        );

        MPConverter.formatContent(this.previewEl);
        this.templateManager.applyTemplate(this.previewEl);
        this.backgroundManager.applyBackground(this.previewEl);

        // 根据滚动位置决定是否自动滚动
        if (isAtBottom) {
            // 如果用户在底部附近，自动滚动到底部
            requestAnimationFrame(() => {
                this.previewEl.scrollTop = this.previewEl.scrollHeight;
            });
        } else {
            // 否则保持原来的滚动位置
            const heightDiff = this.previewEl.scrollHeight - prevHeight;
            this.previewEl.scrollTop = scrollPosition + heightDiff;
        }
    }

    // 添加自定义下拉选择器创建方法
    private createCustomSelect(
        parent: HTMLElement,
        className: string,
        options: { value: string; label: string }[]
    ) {
        const container = parent.createEl('div', { cls: 'custom-select-container' });
        const select = container.createEl('div', { cls: 'custom-select' });
        const selectedText = select.createEl('span', { cls: 'selected-text' });
        const arrow = select.createEl('span', { cls: 'select-arrow', text: '▾' });

        const dropdown = container.createEl('div', { cls: 'select-dropdown' });

        // 自动关闭定时器
        let autoCloseTimer: number | null = null;

        options.forEach(option => {
            const item = dropdown.createEl('div', {
                cls: 'select-item',
                text: option.label
            });

            item.dataset.value = option.value;
            item.addEventListener('click', () => {
                // 清除定时器
                if (autoCloseTimer !== null) {
                    clearTimeout(autoCloseTimer);
                    autoCloseTimer = null;
                }
                // 移除其他项的选中状态
                dropdown.querySelectorAll('.select-item').forEach(el =>
                    el.classList.remove('selected'));
                // 添加当前项的选中状态
                item.classList.add('selected');
                selectedText.textContent = option.label;
                select.dataset.value = option.value;
                dropdown.classList.remove('show');
                select.dispatchEvent(new CustomEvent('change', {
                    detail: { value: option.value }
                }));
            });
        });

        // 设置默认值和选中状态
        if (options.length > 0) {
            selectedText.textContent = options[0].label;
            select.dataset.value = options[0].value;
            dropdown.querySelector('.select-item')?.classList.add('selected');
        }

        // 点击显示/隐藏下拉列表
        select.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpening = !dropdown.classList.contains('show');

            // 清除之前的定时器
            if (autoCloseTimer !== null) {
                clearTimeout(autoCloseTimer);
                autoCloseTimer = null;
            }

            dropdown.classList.toggle('show');

            // 如果打开下拉框，设置2.5秒后自动关闭
            if (isOpening) {
                autoCloseTimer = window.setTimeout(() => {
                    dropdown.classList.remove('show');
                    autoCloseTimer = null;
                }, 2500);
            }
        });

        // 点击其他地方关闭下拉列表
        document.addEventListener('click', () => {
            if (autoCloseTimer !== null) {
                clearTimeout(autoCloseTimer);
                autoCloseTimer = null;
            }
            dropdown.classList.remove('show');
        });

        return container;
    }

    // 获取模板选项
    private async getTemplateOptions() {

        const templates = this.settingsManager.getVisibleTemplates();

        return templates.length > 0
            ? templates.map(t => ({ value: t.id, label: t.name }))
            : [{ value: 'default', label: '默认模板' }];
    }

    private toggleSyncScroll() {
        this.syncScrollEnabled = !this.syncScrollEnabled;

        if (this.syncScrollEnabled) {
            this.syncScrollButton.addClass('active');
            this.syncScrollButton.setAttribute('aria-label', '关闭同步滚动');
            this.setupSyncScroll();
            new Notice('同步滚动已开启');
        } else {
            this.syncScrollButton.removeClass('active');
            this.syncScrollButton.setAttribute('aria-label', '开启同步滚动');
            this.removeSyncScroll();
            new Notice('同步滚动已关闭');
        }
    }

    private setupSyncScroll() {
        // 移除旧的事件监听器
        this.removeSyncScroll();

        // 尝试多种方式获取编辑器滚动容器
        let editorScrollEl: HTMLElement | null = null;

        // 方法1: 从当前活动的 markdown view 获取
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
            // 尝试从编辑器获取滚动容器
            const editor = (activeView as any).editor;
            if (editor && editor.containerEl) {
                // 尝试多种可能的选择器
                const selectors = [
                    '.cm-scroller',
                    '.CodeMirror-scroll',
                    '.markdown-source-view',
                    'div[contenteditable="true"]'
                ];

                for (const selector of selectors) {
                    editorScrollEl = editor.containerEl.querySelector(selector) as HTMLElement;
                    if (editorScrollEl) {
                        // 验证元素是否真的可滚动
                        if (editorScrollEl.scrollHeight > editorScrollEl.clientHeight) {
                            this.editorScrollEl = editorScrollEl;
                            break;
                        }
                    }
                }
            }

            // 如果没找到，尝试从 view.containerEl 获取
            if (!editorScrollEl && activeView.containerEl) {
                const selectors = [
                    '.cm-scroller',
                    '.CodeMirror-scroll',
                    '.markdown-source-view',
                    '.view-content'
                ];

                for (const selector of selectors) {
                    editorScrollEl = activeView.containerEl.querySelector(selector) as HTMLElement;
                    if (editorScrollEl) {
                        if (editorScrollEl.scrollHeight > editorScrollEl.clientHeight) {
                            this.editorScrollEl = editorScrollEl;
                            break;
                        }
                    }
                }
            }
        }

        // 方法2: 遍历所有 markdown leaf
        if (!editorScrollEl) {
            const markdownLeaves = this.app.workspace.getLeavesOfType('markdown');
            for (const leaf of markdownLeaves) {
                const view = leaf.view as any;
                if (!view || !view.containerEl) continue;

                // 查找所有可能的可滚动元素
                const allElements = view.containerEl.querySelectorAll('*');
                for (const el of Array.from(allElements)) {
                    const scrollEl = el as HTMLElement;
                    // 检查是否可滚动
                    if (scrollEl.scrollHeight > scrollEl.clientHeight + 10) {
                        // 找到一个可滚动元素，优先选择有特定 class 的
                        const className = scrollEl.className;
                        if (className && (
                            className.includes('scroller') ||
                            className.includes('scroll') ||
                            className.includes('source') ||
                            className.includes('editor')
                        )) {
                            editorScrollEl = scrollEl;
                            this.editorScrollEl = editorScrollEl;
                            break;
                        }
                    }
                }

                if (editorScrollEl) break;
            }
        }

        if (!editorScrollEl || !this.editorScrollEl) {
            new Notice('未找到编辑器，请确保编辑器已打开');
            this.syncScrollEnabled = false;
            this.syncScrollButton.removeClass('active');
            return;
        }

        // 调试信息
        console.log('找到编辑器滚动容器:', this.editorScrollEl.className, this.editorScrollEl);
        console.log('编辑器可滚动:', this.editorScrollEl.scrollHeight, '>', this.editorScrollEl.clientHeight);

        // 创建滚动处理函数
        this.editorScrollHandler = () => {
            if (!this.syncScrollEnabled || this.isScrolling) return;
            if (!this.editorScrollEl) return;

            this.isScrolling = true;

            const editorScrollRatio = this.editorScrollEl.scrollTop / (this.editorScrollEl.scrollHeight - this.editorScrollEl.clientHeight);
            this.previewEl.scrollTop = editorScrollRatio * (this.previewEl.scrollHeight - this.previewEl.clientHeight);

            setTimeout(() => {
                this.isScrolling = false;
            }, 50);
        };

        this.previewScrollHandler = () => {
            if (!this.syncScrollEnabled || this.isScrolling) return;
            if (!this.editorScrollEl) return;

            this.isScrolling = true;

            const previewScrollRatio = this.previewEl.scrollTop / (this.previewEl.scrollHeight - this.previewEl.clientHeight);
            this.editorScrollEl.scrollTop = previewScrollRatio * (this.editorScrollEl.scrollHeight - this.editorScrollEl.clientHeight);

            setTimeout(() => {
                this.isScrolling = false;
            }, 50);
        };

        // 添加事件监听器，使用 passive 以提高性能
        this.editorScrollEl.addEventListener('scroll', this.editorScrollHandler!, { passive: true });
        this.previewEl.addEventListener('scroll', this.previewScrollHandler!, { passive: true });

        new Notice('同步滚动已开启');
    }

    private removeSyncScroll() {
        const editorView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (editorView) {
            const editorScrollEl = editorView.containerEl.querySelector('.markdown-source-view');
            if (editorScrollEl && this.editorScrollHandler) {
                editorScrollEl.removeEventListener('scroll', this.editorScrollHandler);
            }
        }

        if (this.previewScrollHandler) {
            this.previewEl.removeEventListener('scroll', this.previewScrollHandler);
        }

        this.editorScrollHandler = null;
        this.previewScrollHandler = null;
    }

    onClose() {
        this.removeSyncScroll();
        return Promise.resolve();
    }
}
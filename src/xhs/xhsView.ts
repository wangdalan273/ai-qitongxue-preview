import { ItemView, WorkspaceLeaf, MarkdownRenderer, TFile, setIcon, Notice, Modal, App } from 'obsidian';
import { XhsConverter } from './xhsConverter';
import type { XhsTemplateManager } from './xhsTemplateManager';
import type { SettingsManager } from '../settings/settings';
import { XhsExportManager, XhsImageExportOptions } from './xhsExportManager';
import { XhsPublishPreviewModal } from './xhsPublishPreview';

export const VIEW_TYPE_XHS = 'xhs-preview';

export class XhsView extends ItemView {
    private previewEl: HTMLElement;
    private currentFile: TFile | null = null;
    private updateTimer: NodeJS.Timeout | null = null;
    private isPreviewLocked: boolean = false;
    private lockButton: HTMLButtonElement;
    private copyButton: HTMLButtonElement;
    private exportButton: HTMLButtonElement;
    private previewButton: HTMLButtonElement;
    private templateManager: XhsTemplateManager;
    private settingsManager: SettingsManager;
    private customTemplateSelect: HTMLElement;
    private fontSizeSelect: HTMLInputElement;
    private wordCountEl: HTMLElement;

    constructor(
        leaf: WorkspaceLeaf,
        templateManager: XhsTemplateManager,
        settingsManager: SettingsManager
    ) {
        super(leaf);
        this.templateManager = templateManager;
        this.settingsManager = settingsManager;
    }

    getViewType() {
        return VIEW_TYPE_XHS;
    }

    getDisplayText() {
        return '小红书预览';
    }

    getIcon() {
        return 'heart';
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.classList.remove('view-content');
        container.classList.add('xhs-view-content');

        // 顶部工具栏
        const toolbar = container.createEl('div', { cls: 'xhs-toolbar' });
        const toolbarLeft = toolbar.createEl('div', { cls: 'xhs-toolbar-left' });
        const toolbarRight = toolbar.createEl('div', { cls: 'xhs-toolbar-right' });

        // 左侧：标题和字数统计
        const titleGroup = toolbarLeft.createEl('div', { cls: 'xhs-title-group' });
        titleGroup.createEl('span', { text: '小红书', cls: 'xhs-toolbar-title' });

        this.wordCountEl = titleGroup.createEl('span', { cls: 'xhs-word-count' });

        // 右侧：操作按钮
        this.copyButton = toolbarRight.createEl('button', {
            text: '复制内容',
            cls: 'xhs-copy-button'
        });

        this.copyButton.addEventListener('click', async () => {
            if (this.previewEl) {
                this.copyButton.disabled = true;
                this.copyButton.setText('复制中...');

                try {
                    await this.copyToClipboard();
                    this.copyButton.setText('复制成功');
                    new Notice('内容已复制到剪贴板');

                    setTimeout(() => {
                        this.copyButton.disabled = false;
                        this.copyButton.setText('复制内容');
                    }, 2000);
                } catch (error) {
                    this.copyButton.setText('复制失败');
                    new Notice('复制失败: ' + error);

                    setTimeout(() => {
                        this.copyButton.disabled = false;
                        this.copyButton.setText('复制内容');
                    }, 2000);
                }
            }
        });

        // 导出图片按钮
        this.exportButton = toolbarRight.createEl('button', {
            text: '导出图片',
            cls: 'xhs-export-button'
        });

        this.exportButton.addEventListener('click', async () => {
            if (this.previewEl) {
                // 显示导出设置模态框
                new XhsExportModal(this.app, async (options) => {
                    this.exportButton.disabled = true;
                    this.exportButton.setText('导出中...');

                    try {
                        const content = this.previewEl.querySelector('.xhs-content-container') as HTMLElement;
                        if (!content) {
                            throw new Error('没有可导出的内容');
                        }
                        await XhsExportManager.exportToImage(content, options);
                        this.exportButton.setText('导出成功');

                        setTimeout(() => {
                            this.exportButton.disabled = false;
                            this.exportButton.setText('导出图片');
                        }, 2000);
                    } catch (error) {
                        this.exportButton.setText('导出失败');
                        new Notice('导出失败: ' + error);

                        setTimeout(() => {
                            this.exportButton.disabled = false;
                            this.exportButton.setText('导出图片');
                        }, 2000);
                    }
                }).open();
            }
        });

        // 发布预览按钮
        this.previewButton = toolbarRight.createEl('button', {
            text: '发布预览',
            cls: 'xhs-preview-button'
        });

        this.previewButton.addEventListener('click', () => {
            if (this.previewEl) {
                const content = this.previewEl.querySelector('.xhs-content-container') as HTMLElement;
                if (content) {
                    new XhsPublishPreviewModal(this.app, content).open();
                }
            }
        });

        // 底部工具栏
        const bottomBar = container.createEl('div', { cls: 'xhs-bottom-bar' });
        const bottomControlsGroup = bottomBar.createEl('div', { cls: 'xhs-controls-group' });

        // 锁定按钮
        this.lockButton = bottomControlsGroup.createEl('button', {
            cls: 'xhs-lock-button',
            attr: { 'aria-label': '关闭实时预览' }
        });
        setIcon(this.lockButton, 'lock');
        this.lockButton.setAttribute('aria-label', '开启实时预览');
        this.lockButton.addEventListener('click', () => this.togglePreviewLock());

        // 创建自定义下拉选择器
        this.customTemplateSelect = this.createCustomSelect(
            bottomControlsGroup,
            'xhs-template-select',
            this.getTemplateOptions()
        );

        // 添加模板选择器的事件监听
        this.customTemplateSelect.querySelector('.custom-select')?.addEventListener('change', async (e: any) => {
            const value = e.detail.value;
            this.templateManager.setCurrentTemplate(value);
            await this.settingsManager.updateSettings({
                xhsTemplateId: value
            });
            this.templateManager.applyTemplate(this.previewEl);
        });

        // 字号调整
        const fontSizeGroup = bottomControlsGroup.createEl('div', { cls: 'xhs-font-size-group' });
        const decreaseButton = fontSizeGroup.createEl('button', {
            cls: 'xhs-font-size-btn',
            text: '-'
        });
        this.fontSizeSelect = fontSizeGroup.createEl('input', {
            cls: 'xhs-font-size-input',
            type: 'text',
            value: '15'
        });
        const increaseButton = fontSizeGroup.createEl('button', {
            cls: 'xhs-font-size-btn',
            text: '+'
        });

        // 从设置中恢复上次的选择
        const settings = this.settingsManager.getSettings();

        if (settings.xhsTemplateId) {
            const templateSelect = this.customTemplateSelect.querySelector('.selected-text');
            const templateDropdown = this.customTemplateSelect.querySelector('.select-dropdown');
            if (templateSelect && templateDropdown) {
                const options = this.getTemplateOptions();
                const selected = options.find(o => o.value === settings.xhsTemplateId);
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
            this.templateManager.setCurrentTemplate(settings.xhsTemplateId);
        } else {
            // 设置默认模板
            this.templateManager.setCurrentTemplate('xhs-cute');
        }

        if (settings.xhsFontSize) {
            this.fontSizeSelect.value = settings.xhsFontSize.toString();
            this.templateManager.setFontSize(settings.xhsFontSize);
        }

        // 更新字号调整事件
        const updateFontSize = async () => {
            const size = parseInt(this.fontSizeSelect.value);
            this.templateManager.setFontSize(size);
            await this.settingsManager.updateSettings({
                xhsFontSize: size
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
            if (currentSize < 24) {
                this.fontSizeSelect.value = (currentSize + 1).toString();
                updateFontSize();
            }
        });

        this.fontSizeSelect.addEventListener('change', updateFontSize);

        // 预览区域
        this.previewEl = container.createEl('div', { cls: 'xhs-preview-area' });

        // 帮助提示
        const helpButtonContainer = container.createEl('div', { cls: 'xhs-help-button-container' });
        const helpButton = helpButtonContainer.createEl('button', {
            cls: 'xhs-help-button',
            attr: { 'aria-label': '使用指南' }
        });
        setIcon(helpButton, 'help');
        helpButtonContainer.createEl('div', {
            cls: 'xhs-help-tooltip',
            text: `小红书预览指南：
1. 选择喜欢的模板
2. 调整字号大小
3. 使用 #话题标签 会自动识别
4. 标题会自动添加 emoji
5. 点击【复制内容】粘贴到小红书
6. 解锁按钮控制实时预览`
        });

        // 监听文档变化
        this.registerEvent(
            this.app.workspace.on('file-open', this.onFileOpen.bind(this))
        );

        this.registerEvent(
            this.app.vault.on('modify', this.onFileModify.bind(this))
        );

        // 检查当前打开的文件
        const currentFile = this.app.workspace.getActiveFile();
        await this.onFileOpen(currentFile);
    }

    private updateControlsState(enabled: boolean) {
        this.lockButton.disabled = !enabled;
        const templateSelect = this.customTemplateSelect.querySelector('.custom-select');
        if (templateSelect) {
            templateSelect.classList.toggle('disabled', !enabled);
            templateSelect.setAttribute('style', `pointer-events: ${enabled ? 'auto' : 'none'}`);
        }
        this.fontSizeSelect.disabled = !enabled;
        this.copyButton.disabled = !enabled;

        const fontSizeButtons = this.containerEl.querySelectorAll('.xhs-font-size-btn');
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
                cls: 'xhs-empty-message'
            });
            this.updateControlsState(false);
            this.updateWordCount(0);
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
        const lockStatus = this.isPreviewLocked ? '开启实时预览' : '关闭实时预览';
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

        XhsConverter.formatContent(this.previewEl);
        this.templateManager.applyTemplate(this.previewEl);

        // 更新字数统计
        const wordCount = XhsConverter.getWordCount(this.previewEl);
        this.updateWordCount(wordCount);

        // 根据滚动位置决定是否自动滚动
        if (isAtBottom) {
            requestAnimationFrame(() => {
                this.previewEl.scrollTop = this.previewEl.scrollHeight;
            });
        } else {
            const heightDiff = this.previewEl.scrollHeight - prevHeight;
            this.previewEl.scrollTop = scrollPosition + heightDiff;
        }
    }

    private updateWordCount(count: number) {
        const maxWords = 1000;
        const isOverLimit = count > maxWords;
        this.wordCountEl.textContent = `${count}/${maxWords}字`;
        this.wordCountEl.classList.toggle('over-limit', isOverLimit);

        if (isOverLimit) {
            this.wordCountEl.setAttribute('style', 'color: #ff2442;');
        } else {
            this.wordCountEl.removeAttribute('style');
        }
    }

    private async copyToClipboard(): Promise<void> {
        const content = this.previewEl.querySelector('.xhs-content-container');
        if (!content) {
            throw new Error('没有可复制的内容');
        }

        // 创建纯文本版本用于复制
        const clone = content.cloneNode(true) as HTMLElement;

        // 移除话题标签区域（会作为标签单独复制）
        clone.querySelectorAll('.xhs-hashtag-section').forEach(el => el.remove());

        // 移除正文中的话题标签（避免重复）
        clone.querySelectorAll('.xhs-hashtag').forEach(el => el.remove());

        // 获取文本内容
        let text = clone.innerText || '';

        // 添加话题标签到末尾
        const hashtagSection = content.querySelector('.xhs-hashtag-section');
        if (hashtagSection) {
            const tags = hashtagSection.querySelectorAll('.xhs-hashtag-tag');
            const tagTexts = Array.from(tags).map(tag => tag.textContent?.trim() || '').filter(t => t);
            if (tagTexts.length > 0) {
                text += '\n\n' + tagTexts.join(' ');
            }
        }

        await navigator.clipboard.writeText(text);
    }

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

        let autoCloseTimer: number | null = null;

        options.forEach(option => {
            const item = dropdown.createEl('div', {
                cls: 'select-item',
                text: option.label
            });

            item.dataset.value = option.value;
            item.addEventListener('click', () => {
                if (autoCloseTimer !== null) {
                    clearTimeout(autoCloseTimer);
                    autoCloseTimer = null;
                }
                dropdown.querySelectorAll('.select-item').forEach(el =>
                    el.classList.remove('selected'));
                item.classList.add('selected');
                selectedText.textContent = option.label;
                select.dataset.value = option.value;
                dropdown.classList.remove('show');
                select.dispatchEvent(new CustomEvent('change', {
                    detail: { value: option.value }
                }));
            });
        });

        if (options.length > 0) {
            selectedText.textContent = options[0].label;
            select.dataset.value = options[0].value;
            dropdown.querySelector('.select-item')?.classList.add('selected');
        }

        select.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpening = !dropdown.classList.contains('show');

            if (autoCloseTimer !== null) {
                clearTimeout(autoCloseTimer);
                autoCloseTimer = null;
            }

            dropdown.classList.toggle('show');

            if (isOpening) {
                autoCloseTimer = window.setTimeout(() => {
                    dropdown.classList.remove('show');
                    autoCloseTimer = null;
                }, 2500);
            }
        });

        document.addEventListener('click', () => {
            if (autoCloseTimer !== null) {
                clearTimeout(autoCloseTimer);
                autoCloseTimer = null;
            }
            dropdown.classList.remove('show');
        });

        return container;
    }

    private getTemplateOptions() {
        const templates = this.templateManager.getAllTemplates();
        return templates.length > 0
            ? templates.map(t => ({ value: t.id, label: t.name }))
            : [{ value: 'xhs-cute', label: '可爱粉' }];
    }

    onClose() {
        return Promise.resolve();
    }
}

// 导出设置模态框
class XhsExportModal extends Modal {
    private onSubmit: (options: XhsImageExportOptions) => void;
    private formatSelect: HTMLSelectElement;
    private qualityInput: HTMLInputElement;
    private scaleSelect: HTMLSelectElement;
    private presetSizeSelect: HTMLSelectElement;

    constructor(
        app: App,
        onSubmit: (options: XhsImageExportOptions) => void
    ) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        this.contentEl.empty();
        this.contentEl.addClass('xhs-export-modal');

        this.titleEl.setText('导出图片设置');

        // 格式选择
        this.contentEl.createEl('div', { text: '图片格式：', cls: 'xhs-export-label' });
        this.formatSelect = this.contentEl.createEl('select', { cls: 'xhs-export-select' });
        this.formatSelect.createEl('option', { value: 'png', text: 'PNG（无损）' });
        this.formatSelect.createEl('option', { value: 'jpeg', text: 'JPEG（较小文件）' });

        // 质量选择（仅 JPEG）
        const qualityContainer = this.contentEl.createEl('div', { cls: 'xhs-export-row' });
        qualityContainer.createEl('label', { text: 'JPEG 质量：', cls: 'xhs-export-label' });
        this.qualityInput = qualityContainer.createEl('input', { cls: 'xhs-export-slider' });
        this.qualityInput.type = 'range';
        this.qualityInput.min = '0.1';
        this.qualityInput.max = '1.0';
        this.qualityInput.step = '0.05';
        this.qualityInput.value = '0.95';
        this.qualityInput.addClass('xhs-export-slider');
        const qualityValue = qualityContainer.createEl('span', { text: '95%', cls: 'xhs-export-value' });
        this.qualityInput.addEventListener('input', () => {
            qualityValue.textContent = Math.round(parseFloat(this.qualityInput.value) * 100) + '%';
        });

        // 缩放比例
        this.contentEl.createEl('div', { text: '导出分辨率（影响图片清晰度）：', cls: 'xhs-export-label' });
        this.scaleSelect = this.contentEl.createEl('select', { cls: 'xhs-export-select' });
        this.scaleSelect.createEl('option', { value: '1', text: '1x（标准）' });
        this.scaleSelect.createEl('option', { value: '2', text: '2x（高清）- 推荐' });
        this.scaleSelect.createEl('option', { value: '3', text: '3x（超高清）' });
        this.scaleSelect.value = '2';

        // 预设尺寸
        this.contentEl.createEl('div', { text: '预设尺寸（小红书推荐）：', cls: 'xhs-export-label' });
        this.presetSizeSelect = this.contentEl.createEl('select', { cls: 'xhs-export-select' });
        this.presetSizeSelect.createEl('option', { value: 'auto', text: '自动（保持原始比例）' });

        const presetSizes = XhsExportManager.getPresetSizes();
        presetSizes.forEach(size => {
            this.presetSizeSelect.createEl('option', {
                value: `${size.width}x${size.height}`,
                text: `${size.name} (${size.width}x${size.height})`
            });
        });

        // 按钮
        const buttonContainer = this.contentEl.createEl('div', { cls: 'xhs-export-buttons' });
        const cancelBtn = buttonContainer.createEl('button', { text: '取消' });
        const submitBtn = buttonContainer.createEl('button', { text: '导出', cls: 'mod-cta' });

        cancelBtn.addEventListener('click', () => this.close());
        submitBtn.addEventListener('click', () => this.handleSubmit());
    }

    private handleSubmit() {
        const options: XhsImageExportOptions = {
            format: this.formatSelect.value as 'png' | 'jpeg',
            quality: parseFloat(this.qualityInput.value),
            scale: parseInt(this.scaleSelect.value)
        };

        // 处理预设尺寸
        const presetSize = this.presetSizeSelect.value;
        if (presetSize !== 'auto') {
            const [width, height] = presetSize.split('x').map(Number);
            options.width = width;
            options.height = height;
        }

        this.onSubmit(options);
        this.close();
    }

    onClose() {
        this.contentEl.empty();
    }
}

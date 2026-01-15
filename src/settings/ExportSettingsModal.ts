import { App, Modal, Setting } from 'obsidian';
import { ExportOptions } from '../exportManager';

export class ExportSettingsModal extends Modal {
	private options: ExportOptions;
	private onConfirm: (options: ExportOptions) => void;

	constructor(
		app: App,
		defaultOptions: ExportOptions,
		onConfirm: (options: ExportOptions) => void
	) {
		super(app);
		this.options = { ...defaultOptions };
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('mp-export-settings-modal');

		// 标题
		contentEl.createEl('h2', {
			text: '导出设置',
			cls: 'mp-export-modal-title'
		});

		// 导出格式
		new Setting(contentEl)
			.setName('导出格式')
			.setDesc('选择导出的 HTML 格式')
			.addDropdown(dropdown => dropdown
				.addOption('full', '完整 HTML 文档')
				.addOption('content-only', '仅内容片段')
				.setValue(this.options.format)
				.onChange(value => {
					this.options.format = value as 'full' | 'content-only';
				}));

		// 自定义标题
		new Setting(contentEl)
			.setName('文档标题')
			.setDesc('为导出的文档设置自定义标题（留空使用文件名）')
			.addText(text => text
				.setPlaceholder('输入标题...')
				.setValue(this.options.title || '')
				.onChange(value => {
					this.options.title = value;
				}));

		// 包含样式
		new Setting(contentEl)
			.setName('包含样式')
			.setDesc('在导出的 HTML 中包含基础 CSS 样式')
			.addToggle(toggle => toggle
				.setValue(this.options.includeStyles)
				.onChange(value => {
					this.options.includeStyles = value;
				}));

		// 内联图片
		new Setting(contentEl)
			.setName('内联图片')
			.setDesc('将图片转换为 Data URL 嵌入 HTML（文件会更大，但更便携）')
			.addToggle(toggle => toggle
				.setValue(this.options.inlineImages)
				.onChange(value => {
					this.options.inlineImages = value;
				}));

		// 包含元数据
		new Setting(contentEl)
			.setName('包含元数据')
			.setDesc('在文档开头包含标题、导出时间等元数据')
			.addToggle(toggle => toggle
				.setValue(this.options.includeMetadata)
				.onChange(value => {
					this.options.includeMetadata = value;
				}));

		// 按钮组
		const buttonContainer = contentEl.createDiv({
			cls: 'mp-export-modal-buttons'
		});

		const cancelButton = buttonContainer.createEl('button', {
			text: '取消',
			cls: 'mp-export-modal-btn mp-export-modal-btn-cancel'
		});

		const exportButton = buttonContainer.createEl('button', {
			text: '导出',
			cls: 'mp-export-modal-btn mp-export-modal-btn-confirm'
		});

		// 事件处理
		cancelButton.addEventListener('click', () => {
			this.close();
		});

		exportButton.addEventListener('click', () => {
			this.onConfirm(this.options);
			this.close();
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

import { App, TFile, Notice } from 'obsidian';

export interface ExportOptions {
	includeStyles: boolean;           // 是否包含样式
	inlineImages: boolean;            // 是否内联图片（Data URL）
	includeMetadata: boolean;         // 是否包含文档元数据
	format: 'full' | 'content-only';  // 导出格式
	title?: string;                   // 自定义标题
}

export class ExportManager {
	private static app: App;

	public static initialize(app: App) {
		this.app = app;
	}

	/**
	 * 导出预览内容为 HTML 文件
	 */
	public static async exportToHtml(
		element: HTMLElement,
		file: TFile | null,
		options: ExportOptions
	): Promise<void> {
		try {
			// 1. 克隆元素并处理图片
			const clone = element.cloneNode(true) as HTMLElement;

			if (options.inlineImages) {
				await this.processImages(clone);
			}

			// 2. 获取内容区域
			const contentSection = clone.querySelector('.mp-content-section');
			if (!contentSection) {
				throw new Error('找不到内容区域');
			}

			// 3. 清理 HTML
			const cleanContent = this.cleanupHtml(contentSection as HTMLElement);

			// 4. 生成完整 HTML 文档
			const htmlDocument = this.generateHtmlDocument(cleanContent, file, options);

			// 5. 保存文件
			await this.saveHtmlFile(htmlDocument, file, options);

			new Notice('导出成功');
		} catch (error) {
			console.error('导出失败:', error);
			new Notice('导出失败: ' + (error as Error).message);
		}
	}

	/**
	 * 处理图片（复用 CopyManager 的逻辑）
	 */
	private static async processImages(container: HTMLElement): Promise<void> {
		const images = container.querySelectorAll('img');
		const imageArray = Array.from(images);

		for (const img of imageArray) {
			try {
				const response = await fetch(img.src);
				const blob = await response.blob();

				if (blob.type === 'image/svg+xml' || img.src.startsWith('data:image/svg+xml')) {
					// SVG 转 PNG
					const pngDataUrl = await this.svgToPngDataUrl(blob);
					img.src = pngDataUrl;
				} else {
					img.src = await this.blobToDataUrl(blob);
				}
			} catch (error) {
				console.error('图片转换失败:', error);
			}
		}
	}

	/**
	 * SVG 转 PNG（复用 CopyManager 的逻辑）
	 */
	private static async svgToPngDataUrl(blob: Blob): Promise<string> {
		const svgText = await blob.text();
		const parser = new DOMParser();
		const doc = parser.parseFromString(svgText, 'image/svg+xml');
		const svg = doc.documentElement;

		let width = parseFloat(svg.getAttribute('width') || '');
		let height = parseFloat(svg.getAttribute('height') || '');

		if ((!width || !height) && svg.getAttribute('viewBox')) {
			const viewBox = svg.getAttribute('viewBox')!.split(/\s+/);
			if (viewBox.length === 4) {
				width = parseFloat(viewBox[2]);
				height = parseFloat(viewBox[3]);
			}
		}

		if (!width || !height) {
			width = 1200;
			height = 800;
		}

		const serializedSvg = new XMLSerializer().serializeToString(svg);
		const url = URL.createObjectURL(new Blob([serializedSvg], { type: 'image/svg+xml' }));

		return await new Promise((resolve, reject) => {
			const image = new Image();
			image.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d');
				if (!ctx) {
					URL.revokeObjectURL(url);
					reject(new Error('Failed to create canvas context'));
					return;
				}
				ctx.drawImage(image, 0, 0, width, height);
				const dataUrl = canvas.toDataURL('image/png');
				URL.revokeObjectURL(url);
				resolve(dataUrl);
			};
			image.onerror = () => {
				URL.revokeObjectURL(url);
				reject(new Error('Failed to render SVG to canvas'));
			};
			image.src = url;
		});
	}

	/**
	 * Blob 转 Data URL
	 */
	private static async blobToDataUrl(blob: Blob): Promise<string> {
		return await new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	}

	/**
	 * 清理 HTML（复用 CopyManager 的逻辑）
	 */
	private static cleanupHtml(element: HTMLElement): string {
		const clone = element.cloneNode(true) as HTMLElement;

		// 移除所有的 data-* 属性
		clone.querySelectorAll('*').forEach(el => {
			Array.from(el.attributes).forEach(attr => {
				if (attr.name.startsWith('data-')) {
					el.removeAttribute(attr.name);
				}
			});
		});

		// 移除所有的 class 和 id 属性
		clone.querySelectorAll('*').forEach(el => {
			el.removeAttribute('class');
			el.removeAttribute('id');
		});

		const serializer = new XMLSerializer();
		return serializer.serializeToString(clone);
	}

	/**
	 * 生成完整的 HTML 文档
	 */
	private static generateHtmlDocument(
		content: string,
		file: TFile | null,
		options: ExportOptions
	): string {
		const title = options.title || (file?.basename || '未命名文档');
		const timestamp = new Date().toLocaleString('zh-CN');

		let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(title)}</title>
`;

		// 添加样式
		if (options.includeStyles) {
			html += `    <style>
        /* 基础样式 */
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fcfcfc;
        }

        .metadata {
            margin-bottom: 2em;
        }

        .metadata h1 {
            margin: 0 0 0.5em 0;
            font-size: 2em;
            color: #333;
        }

        .metadata p {
            margin: 0.3em 0;
            color: #666;
            font-size: 0.9em;
        }

        /* 内容区域样式 */
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1em auto;
        }

        p {
            margin: 1em 0;
        }

        h1, h2, h3, h4, h5, h6 {
            margin: 1.5em 0 0.5em;
            font-weight: 600;
            color: #333;
        }

        blockquote {
            margin: 1em 0;
            padding-left: 1em;
            border-left: 4px solid #ddd;
            color: #666;
        }

        code {
            background-color: #f4f4f4;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: "Monaco", "Menlo", monospace;
            font-size: 0.9em;
        }

        pre {
            background-color: #f4f4f4;
            padding: 1em;
            border-radius: 6px;
            overflow-x: auto;
        }

        pre code {
            background-color: transparent;
            padding: 0;
        }

        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 8px 12px;
            text-align: left;
        }

        th {
            background-color: #f4f4f4;
            font-weight: 600;
        }

        a {
            color: #5b9bd5;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        hr {
            border: none;
            border-top: 1px solid #ddd;
            margin: 2em 0;
        }

        ul, ol {
            padding-left: 2em;
            margin: 1em 0;
        }

        li {
            margin: 0.5em 0;
        }
    </style>
`;
		}

		html += `</head>
<body>
`;

		// 添加元数据
		if (options.includeMetadata && options.format === 'full') {
			html += `    <div class="metadata">
        <h1>${this.escapeHtml(title)}</h1>
        <p class="timestamp">导出时间: ${timestamp}</p>
        ${file ? `<p class="source">来源: ${this.escapeHtml(file.path)}</p>` : ''}
    </div>
    <hr>
`;
		}

		// 添加内容
		if (options.format === 'full') {
			html += `    <div class="content">
        ${content}
    </div>
`;
		} else {
			html += `    ${content}
`;
		}

		html += `</body>
</html>`;

		return html;
	}

	/**
	 * 保存 HTML 文件
	 */
	private static async saveHtmlFile(
		html: string,
		file: TFile | null,
		options: ExportOptions
	): Promise<void> {
		// 生成文件名
		const basename = file?.basename || '未命名文档';
		const filename = `${basename}.html`;

		// 创建 Blob
		const blob = new Blob([html], { type: 'text/html;charset=utf-8' });

		// 创建下载链接
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.style.display = 'none';

		// 触发下载
		document.body.appendChild(a);
		a.click();

		// 清理
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	/**
	 * HTML 转义
	 */
	private static escapeHtml(text: string): string {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}
}

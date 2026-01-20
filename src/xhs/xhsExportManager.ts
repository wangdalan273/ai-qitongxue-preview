import { Notice } from 'obsidian';

export interface XhsImageExportOptions {
    format: 'png' | 'jpeg';
    quality: number;
    scale: number;
    width?: number;
    height?: number;
}

export class XhsExportManager {
    /**
     * 将 HTML 元素导出为图片
     */
    static async exportToImage(
        element: HTMLElement,
        options: XhsImageExportOptions = {
            format: 'png',
            quality: 0.95,
            scale: 2
        }
    ): Promise<void> {
        try {
            // 创建临时容器
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.top = '0';
            container.style.left = '0';
            container.style.background = 'white';
            container.style.padding = '20px';
            container.style.width = (options.width || 500) + 'px';
            container.style.zIndex = '-9999';

            // 克隆内容
            const clone = element.cloneNode(true) as HTMLElement;

            // 简化样式 - 只保留关键样式
            this.simplifyStyles(clone);

            container.appendChild(clone);
            document.body.appendChild(container);

            // 等待渲染
            await new Promise(resolve => setTimeout(resolve, 100));

            // 使用 html2canvas 库（如果已加载）或使用备用方法
            if ((window as any).html2canvas) {
                await this.exportWithHtml2Canvas(container, options);
            } else {
                await this.exportWithCanvasAPI(container, options);
            }

            // 清理
            document.body.removeChild(container);

            new Notice('图片导出成功');
        } catch (error) {
            console.error('导出失败:', error);
            throw new Error('导出失败: ' + (error as Error).message);
        }
    }

    /**
     * 简化样式，移除复杂的 CSS
     */
    private static simplifyStyles(element: HTMLElement): void {
        const allElements = element.querySelectorAll('*');

        // 移除所有 class 和复杂的 style
        allElements.forEach(el => {
            // 保留基本显示样式
            const computed = window.getComputedStyle(el);
            const display = computed.display;
            const flexDirection = computed.flexDirection;

            // 清空所有样式
            (el as HTMLElement).style.cssText = '';

            // 只设置必要的样式
            if (display !== 'inline') {
                (el as HTMLElement).style.display = display;
            }
            if (display === 'flex') {
                (el as HTMLElement).style.flexDirection = flexDirection;
                (el as HTMLElement).style.gap = '8px';
            }
        });

        // 为容器设置基本样式
        element.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        element.style.lineHeight = '1.6';
        element.style.color = '#333';
    }

    /**
     * 使用 html2canvas 导出
     */
    private static async exportWithHtml2Canvas(
        container: HTMLElement,
        options: XhsImageExportOptions
    ): Promise<void> {
        const html2canvas = (window as any).html2canvas;

        const canvas = await html2canvas(container, {
            scale: options.scale,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });

        await this.downloadCanvas(canvas, options);
    }

    /**
     * 使用原生 Canvas API 导出（备用方法）
     */
    private static async exportWithCanvasAPI(
        container: HTMLElement,
        options: XhsImageExportOptions
    ): Promise<void> {
        const rect = container.getBoundingClientRect();
        const scale = options.scale || 2;

        const canvas = document.createElement('canvas');
        canvas.width = rect.width * scale;
        canvas.height = rect.height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('无法创建 Canvas 上下文');
        }

        ctx.scale(scale, scale);

        // 填充白色背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);

        // 绘制文本内容
        await this.drawElement(ctx, container, 0, 0);

        await this.downloadCanvas(canvas, options);
    }

    /**
     * 递归绘制元素到 Canvas
     */
    private static async drawElement(
        ctx: CanvasRenderingContext2D,
        element: HTMLElement,
        x: number,
        y: number
    ): Promise<number> {
        let currentY = y;
        const computed = window.getComputedStyle(element);
        const padding = 10;

        // 绘制文本节点
        if (element.nodeType === Node.TEXT_NODE) {
            const text = element.textContent?.trim();
            if (text) {
                ctx.fillStyle = '#333';
                ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText(text, x + padding, currentY + 20);
                currentY += 25;
            }
            return currentY;
        }

        // 绘制子元素
        for (const child of Array.from(element.children)) {
            if (child instanceof HTMLElement) {
                const tagName = child.tagName.toLowerCase();

                if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
                    ctx.fillStyle = '#ff2442';
                    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                    const text = child.textContent?.trim() || '';
                    ctx.fillText(text, x + padding, currentY + 30);
                    currentY += 45;
                } else if (tagName === 'p') {
                    ctx.fillStyle = '#333';
                    ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                    const text = child.textContent?.trim() || '';
                    const lines = this.wrapText(ctx, text, 450);
                    for (const line of lines) {
                        ctx.fillText(line, x + padding, currentY + 20);
                        currentY += 25;
                    }
                    currentY += 10;
                } else if (tagName === 'img') {
                    const img = child as HTMLImageElement;
                    if (img.complete && img.naturalWidth > 0) {
                        const imgWidth = Math.min(450, img.naturalWidth);
                        const imgHeight = (imgWidth / img.naturalWidth) * img.naturalHeight;
                        ctx.drawImage(img, x + padding, currentY, imgWidth, imgHeight);
                        currentY += imgHeight + 10;
                    }
                } else {
                    currentY = await this.drawElement(ctx, child, x, currentY);
                }
            }
        }

        return currentY;
    }

    /**
     * 文本换行
     */
    private static wrapText(
        ctx: CanvasRenderingContext2D,
        text: string,
        maxWidth: number
    ): string[] {
        const words = text.split('');
        const lines: string[] = [];
        let currentLine = '';

        for (const char of words) {
            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }

    /**
     * 下载 Canvas 为图片
     */
    private static async downloadCanvas(
        canvas: HTMLCanvasElement,
        options: XhsImageExportOptions
    ): Promise<void> {
        const mimeType = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const dataUrl = canvas.toDataURL(mimeType, options.quality);

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `xiaohongshu_${Date.now()}.${options.format}`;
        a.style.display = 'none';

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
    }

    /**
     * 获取预设尺寸选项
     */
    static getPresetSizes(): Array<{ name: string; width: number; height: number }> {
        return [
            { name: '方形 (1:1)', width: 1080, height: 1080 },
            { name: '竖版 (4:5)', width: 1080, height: 1350 },
            { name: '竖版长 (3:4)', width: 1080, height: 1440 },
            { name: '标准竖版 (9:16)', width: 1080, height: 1920 },
        ];
    }
}

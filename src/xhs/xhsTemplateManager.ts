import { App } from 'obsidian';
import type { SettingsManager } from '../settings/settings';

export interface XhsTemplate {
    id: string;
    name: string;
    description: string;
    styles: {
        container: string;
        hashtag: {
            container: string;
            tag: string;
            icon: string;
            label: string;
        };
        emoji: {
            size: string;
            spacing: string;
        };
        title: {
            emojiPrefix: string;
            shortLength: string;
        };
        paragraph: string;
        code: {
            block: string;
            inline: string;
        };
        list: {
            container: string;
            item: string;
        };
        quote: string;
        image: string;
        link: string;
        emphasis: {
            strong: string;
            em: string;
        };
    };
    config: {
        maxWords: number;
        defaultImageRatio: '4:3' | '1:1';
    };
}

export class XhsTemplateManager {
    private templates: Map<string, XhsTemplate> = new Map();
    private currentTemplate: XhsTemplate;
    private currentFont: string = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    private currentFontSize: number = 15;
    private app: App;
    private settingsManager: SettingsManager;

    constructor(app: App, settingsManager: SettingsManager) {
        this.app = app;
        this.settingsManager = settingsManager;
    }

    public async loadTemplates() {
        // 动态导入模板
        const { templates } = await import('./templates');
        for (const [id, template] of Object.entries(templates)) {
            this.templates.set(id, template as XhsTemplate);
        }
    }

    public setCurrentTemplate(id: string): boolean {
        const template = this.templates.get(id);
        if (template) {
            this.currentTemplate = template;
            return true;
        }
        console.error('小红书模板未找到:', id);
        return false;
    }

    public setFont(fontFamily: string) {
        this.currentFont = fontFamily;
    }

    public setFontSize(size: number) {
        this.currentFontSize = size;
    }

    public getCurrentTemplate(): XhsTemplate {
        return this.currentTemplate;
    }

    public getAllTemplates(): XhsTemplate[] {
        return Array.from(this.templates.values());
    }

    public applyTemplate(element: HTMLElement, template?: XhsTemplate): void {
        const styles = template ? template.styles : this.currentTemplate.styles;

        // 应用容器样式
        const container = element.querySelector('.xhs-content-container') as HTMLElement;
        if (container) {
            container.setAttribute('style', `${styles.container}; font-family: ${this.currentFont};`);
        }

        // 应用标题样式
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
            element.querySelectorAll(tag).forEach(el => {
                // 应用 emoji 前缀样式
                const emojiPrefix = el.querySelector('.emoji-prefix');
                if (emojiPrefix) {
                    emojiPrefix.setAttribute('style', styles.emoji.size);
                }
            });
        });

        // 应用段落样式
        element.querySelectorAll('p').forEach(el => {
            if (!el.parentElement?.closest('p') && !el.parentElement?.closest('blockquote')) {
                el.setAttribute('style', `${styles.paragraph}; font-family: ${this.currentFont}; font-size: ${this.currentFontSize}px;`);
            }
        });

        // 应用列表样式
        element.querySelectorAll('ul, ol').forEach(el => {
            el.setAttribute('style', styles.list.container);
        });
        element.querySelectorAll('li').forEach(el => {
            el.setAttribute('style', `${styles.list.item}; font-family: ${this.currentFont}; font-size: ${this.currentFontSize}px;`);
        });

        // 应用引用样式
        element.querySelectorAll('blockquote').forEach(el => {
            el.setAttribute('style', `${styles.quote}; font-family: ${this.currentFont}; font-size: ${this.currentFontSize}px;`);
        });

        // 应用代码样式
        element.querySelectorAll('pre').forEach(el => {
            el.setAttribute('style', styles.code.block);
        });
        element.querySelectorAll('code:not(pre code)').forEach(el => {
            el.setAttribute('style', styles.code.inline);
        });

        // 应用链接样式
        element.querySelectorAll('a').forEach(el => {
            el.setAttribute('style', styles.link);
        });

        // 应用强调样式
        element.querySelectorAll('strong').forEach(el => {
            el.setAttribute('style', styles.emphasis.strong);
        });
        element.querySelectorAll('em').forEach(el => {
            el.setAttribute('style', styles.emphasis.em);
        });

        // 应用图片样式
        element.querySelectorAll('img').forEach(el => {
            el.setAttribute('style', styles.image);
        });

        // 应用话题标签样式
        const hashtagSection = element.querySelector('.xhs-hashtag-section') as HTMLElement;
        if (hashtagSection) {
            hashtagSection.setAttribute('style', styles.hashtag.container);
        }
        element.querySelectorAll('.xhs-hashtag').forEach(el => {
            el.setAttribute('style', styles.hashtag.tag);
        });
        element.querySelectorAll('.hashtag-icon').forEach(el => {
            el.setAttribute('style', styles.hashtag.icon);
        });
        element.querySelectorAll('.xhs-hashtag-label').forEach(el => {
            el.setAttribute('style', styles.hashtag.label);
        });
    }
}

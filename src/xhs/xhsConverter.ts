import { App } from 'obsidian';

export class XhsConverter {
    private static app: App;
    private static hashtagPattern = /#([^\s#]+)/g;

    static initialize(app: App) {
        this.app = app;
    }

    static formatContent(element: HTMLElement): void {
        // 创建容器
        const container = document.createElement('div');
        container.className = 'xhs-content-container';
        while (element.firstChild) {
            container.appendChild(element.firstChild);
        }
        element.appendChild(container);

        // 处理标题（添加 emoji 前缀）
        this.processTitles(container);

        // 处理话题标签
        this.processHashtags(container);

        // 处理图片
        this.processImages(container);
    }

    private static processTitles(container: HTMLElement): void {
        // 处理 H1 标题，添加 emoji 前缀（如果还没有）
        container.querySelectorAll('h1').forEach(h1 => {
            if (!h1.querySelector('.emoji-prefix')) {
                // 检查是否已有 emoji
                const textContent = h1.textContent?.trim() || '';
                const hasEmoji = /^[\u{1F300}-\u{1F9FF}]/u.test(textContent);

                if (!hasEmoji) {
                    const prefix = document.createElement('span');
                    prefix.className = 'emoji-prefix';
                    prefix.textContent = '✨';
                    h1.prepend(prefix);
                }
            }
        });
    }

    private static processHashtags(container: HTMLElement): void {
        const hashtags = new Set<string>();

        // 收集所有文本节点中的话题标签
        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // 跳过代码块和已有标签
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    if (parent.tagName === 'CODE' ||
                        parent.tagName === 'PRE' ||
                        parent.closest('.xhs-hashtag-section')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const textNodesToReplace: { node: Text; replacements: { text: string; element: HTMLElement }[] }[] = [];

        let node: Node | null;
        while ((node = walker.nextNode())) {
            const textNode = node as Text;
            const text = textNode.textContent;
            if (!text) continue;

            const replacements: { text: string; element: HTMLElement }[] = [];
            let lastIndex = 0;
            let match;

            // 重置正则表达式的 lastIndex
            this.hashtagPattern.lastIndex = 0;

            while ((match = this.hashtagPattern.exec(text)) !== null) {
                const [fullMatch, tag] = match;
                const tagText = fullMatch;

                // 添加匹配前的普通文本
                if (match.index > lastIndex) {
                    replacements.push({ text: text.slice(lastIndex, match.index), element: null as any });
                }

                // 创建话题标签元素
                const span = document.createElement('span');
                span.className = 'xhs-hashtag';
                span.textContent = tagText;
                replacements.push({ text: tagText, element: span });

                // 记录话题标签
                hashtags.add(tagText);

                lastIndex = match.index + fullMatch.length;
            }

            // 添加剩余文本
            if (lastIndex < text.length) {
                replacements.push({ text: text.slice(lastIndex), element: null as any });
            }

            if (replacements.length > 0) {
                textNodesToReplace.push({ node: textNode, replacements });
            }
        }

        // 替换文本节点
        for (const { node, replacements } of textNodesToReplace) {
            const fragment = document.createDocumentFragment();
            for (const replacement of replacements) {
                if (replacement.element) {
                    fragment.appendChild(replacement.element);
                } else if (replacement.text) {
                    fragment.appendChild(document.createTextNode(replacement.text));
                }
            }
            node.parentNode?.replaceChild(fragment, node);
        }

        // 在容器末尾创建话题标签区域
        if (hashtags.size > 0) {
            const hashtagSection = document.createElement('div');
            hashtagSection.className = 'xhs-hashtag-section';

            const label = document.createElement('div');
            label.className = 'xhs-hashtag-label';
            label.textContent = '话题标签';
            hashtagSection.appendChild(label);

            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'hashtag-tags-container';

            for (const tag of hashtags) {
                const tagEl = document.createElement('div');
                tagEl.className = 'xhs-hashtag-tag';
                tagEl.innerHTML = `<span class="hashtag-icon">#</span><span class="hashtag-text">${tag.slice(1)}</span>`;
                tagsContainer.appendChild(tagEl);
            }

            hashtagSection.appendChild(tagsContainer);
            container.appendChild(hashtagSection);
        }
    }

    private static processImages(container: HTMLElement): void {
        // 处理内部嵌入的图片
        container.querySelectorAll('span.internal-embed[alt][src]').forEach(async (el) => {
            const originalSpan = el as HTMLElement;
            const src = originalSpan.getAttribute('src');
            const alt = originalSpan.getAttribute('alt');

            if (!src) return;

            try {
                const linktext = src.split('|')[0];
                const file = this.app.metadataCache.getFirstLinkpathDest(linktext, '');
                if (file) {
                    const absolutePath = this.app.vault.adapter.getResourcePath(file.path);
                    const newImg = document.createElement('img');
                    newImg.src = absolutePath;
                    newImg.alt = alt || '';
                    newImg.className = 'xhs-image';
                    originalSpan.parentNode?.replaceChild(newImg, originalSpan);
                }
            } catch (error) {
                console.error('小红书图片处理失败:', error);
            }
        });

        // 为现有图片添加样式
        container.querySelectorAll('img').forEach(img => {
            if (!img.classList.contains('xhs-image')) {
                img.classList.add('xhs-image');
            }
        });
    }

    static getWordCount(element: HTMLElement): number {
        // 计算字数（排除话题标签区域）
        const clone = element.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('.xhs-hashtag-section').forEach(el => el.remove());
        return clone.textContent?.trim().length || 0;
    }
}

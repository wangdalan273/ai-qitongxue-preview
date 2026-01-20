import { Modal, App } from 'obsidian';

export class XhsPublishPreviewModal extends Modal {
    private content: HTMLElement;

    constructor(app: App, content: HTMLElement) {
        super(app);
        this.content = content;
    }

    onOpen() {
        this.contentEl.empty();
        this.contentEl.addClass('xhs-publish-preview-modal');
        this.titleEl.setText('发布预览 - 小红书');

        // 创建预览容器
        const previewContainer = this.contentEl.createEl('div', {
            cls: 'xhs-phone-preview'
        });

        // 手机外壳
        const phoneFrame = previewContainer.createEl('div', {
            cls: 'xhs-phone-frame'
        });

        // 手机屏幕
        const phoneScreen = phoneFrame.createEl('div', {
            cls: 'xhs-phone-screen'
        });

        // 状态栏
        const statusBar = phoneScreen.createEl('div', {
            cls: 'xhs-status-bar'
        });
        statusBar.innerHTML = `
            <span class="status-time">12:00</span>
            <div class="status-icons">
                <span class="icon-signal">📶</span>
                <span class="icon-wifi">📡</span>
                <span class="icon-battery">🔋</span>
            </div>
        `;

        // 小红书导航栏
        const navBar = phoneScreen.createEl('div', {
            cls: 'xhs-navbar'
        });
        navBar.innerHTML = `
            <span class="nav-back">‹</span>
            <span class="nav-title">笔记详情</span>
            <span class="nav-more">⋯</span>
        `;

        // 内容区域
        const scrollContent = phoneScreen.createEl('div', {
            cls: 'xhs-scroll-content'
        });

        // 克隆并处理内容
        const clonedContent = this.content.cloneNode(true) as HTMLElement;
        this.processContentForPreview(clonedContent);

        const contentArea = scrollContent.createEl('div', {
            cls: 'xhs-content-area'
        });
        contentArea.appendChild(clonedContent);

        // 用户信息
        const userInfo = scrollContent.createEl('div', {
            cls: 'xhs-user-info'
        });
        userInfo.innerHTML = `
            <div class="user-avatar">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23ff2442'/%3E%3Ctext x='50' y='70' text-anchor='middle' font-size='50' fill='white'%3E👤%3C/text%3E%3C/svg%3E" alt="avatar">
            </div>
            <div class="user-details">
                <div class="user-name">我的小红书</div>
                <div class="publish-time">刚刚发布</div>
            </div>
            <button class="follow-btn">关注</button>
        `;

        // 互动数据
        const interactionBar = scrollContent.createEl('div', {
            cls: 'xhs-interaction-bar'
        });
        interactionBar.innerHTML = `
            <div class="interaction-item">
                <span class="interaction-icon">❤️</span>
                <span class="interaction-count">1.2k</span>
            </div>
            <div class="interaction-item">
                <span class="interaction-icon">⭐</span>
                <span class="interaction-count">856</span>
            </div>
            <div class="interaction-item">
                <span class="interaction-icon">💬</span>
                <span class="interaction-count">234</span>
            </div>
            <div class="interaction-item">
                <span class="interaction-icon">↗️</span>
                <span class="interaction-count">分享</span>
            </div>
        `;

        // 底部导航栏
        const bottomNav = phoneScreen.createEl('div', {
            cls: 'xhs-bottom-nav'
        });
        bottomNav.innerHTML = `
            <div class="nav-item active">🏠</div>
            <div class="nav-item">🎥</div>
            <div class="nav-item">➕</div>
            <div class="nav-item">💬</div>
            <div class="nav-item">👤</div>
        `;

        // 说明文字
        const tips = this.contentEl.createEl('div', {
            cls: 'xhs-preview-tips',
            text: '💡 这是预览效果，实际发布后效果可能略有不同'
        });
    }

    /**
     * 处理内容以适应预览
     */
    private processContentForPreview(element: HTMLElement): void {
        // 移除话题标签区域（会在下面重新添加）
        element.querySelectorAll('.xhs-hashtag-section').forEach(el => el.remove());

        // 移除正文中的话题标签
        element.querySelectorAll('.xhs-hashtag').forEach(el => {
            el.replaceWith(el.textContent || '');
        });

        // 在末尾添加话题标签预览
        const hashtagSection = document.createElement('div');
        hashtagSection.className = 'xhs-hashtag-preview';

        // 收集所有话题标签
        const hashtags = new Set<string>();
        element.querySelectorAll('p, li').forEach(el => {
            const text = el.textContent || '';
            const matches = text.match(/#[^\s#]+/g);
            if (matches) {
                matches.forEach(tag => hashtags.add(tag));
            }
        });

        if (hashtags.size > 0) {
            const label = document.createElement('div');
            label.className = 'hashtag-preview-label';
            label.textContent = '话题标签';
            hashtagSection.appendChild(label);

            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'hashtag-preview-tags';
            hashtags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'hashtag-preview-tag';
                tagEl.textContent = tag;
                tagsContainer.appendChild(tagEl);
            });
            hashtagSection.appendChild(tagsContainer);
        }

        element.appendChild(hashtagSection);
    }

    onClose() {
        this.contentEl.empty();
    }
}

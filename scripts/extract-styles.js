const fs = require('fs');
const path = require('path');

const zhutiDir = path.join(__dirname, '../zhuti');
const templatesDir = path.join(__dirname, '../src/templates');

const themes = [
    { file: '字节范.html', id: 'byte-style', name: '字节范' },
    { file: '苹果范.html', id: 'apple-style', name: '苹果范' },
    { file: '运动风.html', id: 'sport-style', name: '运动风' },
    { file: '中国风.html', id: 'chinese-style', name: '中国风' },
    { file: '赛博朋克.html', id: 'cyberpunk', name: '赛博朋克' }
];

function extractStyle(tag, html) {
    const regex = new RegExp(`<${tag}[^>]*style="([^"]*)"`, 'i');
    const match = html.match(regex);
    return match ? match[1] : '';
}

function extractCodeStyle(html) {
    const regex = /<pre[^>]*style="([^"]*)"/i;
    const match = html.match(regex);
    return match ? match[1] : '';
}

function extractInlineCodeStyle(html) {
    const regex = /<code[^>]*style="([^"]*)"(?![^<]*<\/code>)/i;
    const match = html.match(regex);
    return match ? match[1] : '';
}

function extractBlockquoteStyle(html) {
    const regex = /<blockquote[^>]*style="([^"]*)"/i;
    const match = html.match(regex);
    return match ? match[1] : '';
}

function extractTableStyles(html) {
    const tableMatch = html.match(/<table[^>]*style="([^"]*)"/i);
    const thMatch = html.match(/<th[^>]*style="([^"]*)"/i);
    const tdMatch = html.match(/<td[^>]*style="([^"]*)"/i);

    return {
        container: tableMatch ? tableMatch[1] : '',
        header: thMatch ? thMatch[1] : '',
        cell: tdMatch ? tdMatch[1] : ''
    };
}

function extractListStyles(html) {
    const ulMatch = html.match(/<ul[^>]*style="([^"]*)"/i);
    const liMatch = html.match(/<li[^>]*style="([^"]*)"/i);
    const olMatch = html.match(/<ol[^>]*style="([^"]*)"/i);

    return {
        container: ulMatch ? ulMatch[1] : (olMatch ? olMatch[1] : ''),
        item: liMatch ? liMatch[1] : ''
    };
}

function extractLinkStyle(html) {
    const regex = /<a[^>]*style="([^"]*)"/i;
    const match = html.match(regex);
    return match ? match[1] : '';
}

function extractImageStyle(html) {
    const regex = /<img[^>]*style="([^"]*)"/i;
    const match = html.match(regex);
    return match ? match[1] : '';
}

function extractHrStyle(html) {
    const regex = /<hr[^>]*style="([^"]*)"/i;
    const match = html.match(regex);
    return match ? match[1] : '';
}

function extractEmphasisStyles(html) {
    const strongMatch = html.match(/<strong[^>]*style="([^"]*)"/i);
    const emMatch = html.match(/<em[^>]*style="([^"]*)"/i);

    return {
        strong: strongMatch ? strongMatch[1] : '',
        em: emMatch ? emMatch[1] : ''
    };
}

function findH1Style(html) {
    // Find H1 with "这是一级标题 H1" pattern
    const regex = /<h1[^>]*style="([^"]*)"[^>]*>这是一级标题 H1/i;
    const match = html.match(regex);
    if (match) return match[1];

    // Fallback: any H1 with content style
    const fallbackRegex = /<h1[^>]*style="([^"]*)"[^>]*>[^<]/i;
    const fallbackMatch = html.match(fallbackRegex);
    return fallbackMatch ? fallbackMatch[1] : '';
}

function findH2Style(html) {
    const regex = /<h2[^>]*style="([^"]*)"[^>]*>这是二级标题 H2/i;
    const match = html.match(regex);
    if (match) return match[1];

    const fallbackRegex = /<h2[^>]*style="([^"]*)"[^>]*>[^<]/i;
    const fallbackMatch = html.match(fallbackRegex);
    return fallbackMatch ? fallbackMatch[1] : '';
}

function findH3Style(html) {
    const regex = /<h3[^>]*style="([^"]*)"[^>]*>这是三级标题 H3/i;
    const match = html.match(regex);
    if (match) return match[1];

    const fallbackRegex = /<h3[^>]*style="([^"]*)"[^>]*>[^<]/i;
    const fallbackMatch = html.match(fallbackRegex);
    return fallbackMatch ? fallbackMatch[1] : '';
}

function findH4Style(html) {
    const regex = /<h4[^>]*style="([^"]*)"[^>]*>/i;
    const match = html.match(regex);
    return match ? match[1] : '';
}

function findH5Style(html) {
    const regex = /<h5[^>]*style="([^"]*)"[^>]*>/i;
    const match = html.match(regex);
    return match ? match[1] : '';
}

function findH6Style(html) {
    const regex = /<h6[^>]*style="([^"]*)"[^>]*>/i;
    const match = html.match(regex);
    return match ? match[1] : '';
}

function findParagraphStyle(html) {
    // Look for paragraph with "这是普通段落文本" pattern
    const regex = /<p[^>]*style="([^"]*)"[^>]*>这是普通段落文本/i;
    const match = html.match(regex);
    if (match) return match[1];

    // Fallback to first paragraph with style
    const fallbackRegex = /<p[^>]*style="([^"]*)"[^>]*>[^<]/i;
    const fallbackMatch = html.match(fallbackRegex);
    return fallbackMatch ? fallbackMatch[1] : '';
}

themes.forEach(theme => {
    const htmlPath = path.join(zhutiDir, theme.file);
    const html = fs.readFileSync(htmlPath, 'utf-8');

    const template = {
        id: theme.id,
        name: theme.name,
        styles: {
            container: '',
            title: {
                h1: {
                    base: findH1Style(html),
                    content: '',
                    after: ''
                },
                h2: {
                    base: findH2Style(html),
                    content: '',
                    after: ''
                },
                h3: {
                    base: findH3Style(html),
                    content: '',
                    after: ''
                },
                base: {
                    base: findH4Style(html) || findH5Style(html) || findH6Style(html),
                    content: '',
                    after: ''
                }
            },
            paragraph: findParagraphStyle(html),
            list: extractListStyles(html),
            code: {
                header: {
                    container: '',
                    dot: '',
                    colors: []
                },
                block: extractCodeStyle(html),
                inline: extractInlineCodeStyle(html)
            },
            quote: extractBlockquoteStyle(html),
            image: extractImageStyle(html),
            link: extractLinkStyle(html),
            emphasis: extractEmphasisStyles(html),
            table: extractTableStyles(html),
            hr: extractHrStyle(html),
            footnote: {
                ref: '',
                backref: ''
            }
        }
    };

    const outputPath = path.join(templatesDir, `${theme.id}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(template, null, 2), 'utf-8');
    console.log(`Generated: ${theme.id}.json`);
});

console.log('All themes processed successfully!');

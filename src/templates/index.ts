// 使用 require 导入 JSON 文件以避免 TypeScript 的 JSON 模块解析问题
const defaultTemplate = require('./default.json');
const minimalTemplate = require('./minimal.json');
const scarletTemplate = require('./scarlet.json');
const orangeTemplate = require('./orange.json');
const elegantTemplate = require('./elegant.json');
const darkTemplate = require('./dark.json');
const academicTemplate = require('./academic.json');
const yebanTemplate = require('./yeban.json');
const yebanOrangeTemplate = require('./yeban-orange.json');
const darkgreenTemplate = require('./darkgreen.json');
const brownTemplate = require('./brown.json');
const blueLightTemplate = require('./blue-light.json');
const orangeVitalityTemplate = require('./orange-vitality.json');
const modernDarkTemplate = require('./modern-dark.json');
const magazineModernTemplate = require('./magazine-modern.json');
const literaryJournalTemplate = require('./literary-journal.json');
const cyberNeonTemplate = require('./cyber-neon.json');
const forestGreenTemplate = require('./forest-green.json');
const scheme1Template = require('./scheme1.json');

// 来自花生编辑器的 13 种主题
const wechatDefaultTemplate = require('./wechat-default.json');
const latepostDepthTemplate = require('./latepost-depth.json');
const wechatFtTemplate = require('./wechat-ft.json');
const wechatAnthropicTemplate = require('./wechat-anthropic.json');
const wechatTechTemplate = require('./wechat-tech.json');
const wechatElegantTemplate = require('./wechat-elegant.json');
const wechatDeepreadTemplate = require('./wechat-deepread.json');
const wechatNytTemplate = require('./wechat-nyt.json');
const wechatJonyiveTemplate = require('./wechat-jonyive.json');
const wechatMediumTemplate = require('./wechat-medium.json');
const wechatAppleTemplate = require('./wechat-apple.json');
const kenyaEmptinessTemplate = require('./kenya-emptiness.json');
const hischeEditorialTemplate = require('./hische-editorial.json');
const andoConcreteTemplate = require('./ando-concrete.json');
const gaudiOrganicTemplate = require('./gaudi-organic.json');

export const templates = {
    default: defaultTemplate,
    minimal: minimalTemplate,
    scarlet: scarletTemplate,
    orange: orangeTemplate,
    elegant: elegantTemplate,
    dark: darkTemplate,
    academic: academicTemplate,
    yeban: yebanTemplate,
    'yeban-orange': yebanOrangeTemplate,
    darkgreen: darkgreenTemplate,
    brown: brownTemplate,
    'blue-light': blueLightTemplate,
    'orange-vitality': orangeVitalityTemplate,
    'modern-dark': modernDarkTemplate,
    'magazine-modern': magazineModernTemplate,
    'literary-journal': literaryJournalTemplate,
    'forest-green': forestGreenTemplate,
    'scheme1': scheme1Template,
    // 来自花生编辑器的 13 种主题
    'wechat-default': wechatDefaultTemplate,
    'latepost-depth': latepostDepthTemplate,
    'wechat-ft': wechatFtTemplate,
    'wechat-anthropic': wechatAnthropicTemplate,
    'wechat-tech': wechatTechTemplate,
    'wechat-elegant': wechatElegantTemplate,
    'wechat-deepread': wechatDeepreadTemplate,
    'wechat-nyt': wechatNytTemplate,
    'wechat-jonyive': wechatJonyiveTemplate,
    'wechat-medium': wechatMediumTemplate,
    'wechat-apple': wechatAppleTemplate,
    'kenya-emptiness': kenyaEmptinessTemplate,
    'hische-editorial': hischeEditorialTemplate,
    'ando-concrete': andoConcreteTemplate,
    'gaudi-organic': gaudiOrganicTemplate,
};
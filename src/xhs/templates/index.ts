// 使用 require 导入 JSON 文件以避免 TypeScript 的 JSON 模块解析问题
const cuteTemplate = require('./cute.json');
const minimalTemplate = require('./minimal.json');
const vibrantTemplate = require('./vibrant.json');

export const templates = {
    'xhs-cute': cuteTemplate,
    'xhs-minimal': minimalTemplate,
    'xhs-vibrant': vibrantTemplate,
};

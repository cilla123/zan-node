import fs from 'fs';
import path from 'path';
import defaultsDeep from 'lodash/defaultsDeep';
import env from './nunjucks/env';
import AutoEscapeExtension from './nunjucks/extensions/autoescape';

// 添加扩展
env.addExtension('AutoEscapeExtension', new AutoEscapeExtension(env));

export default function (config) {
    
    const loadJs = function (key, vendor = false, crossorigin = false, ifAsync = false) {
        const keys = key.split('.');
        const realKey = vendor ? key : keys.length > 1 ? keys[1] : keys[0];
        const VERSION_MAP = config.VERSION_MAP;
        const realVersionJs = keys.length > 1 ? VERSION_MAP[keys[0]] : VERSION_MAP['version_js'];
        const src = (config.NODE_ENV === 'development' && !vendor)
            ? `/${realKey}.js`
            : (vendor ? `${config.CDN_PATH}/${realKey}` : `${config.CDN_PATH}/${realVersionJs[realKey]}`);
        let scriptStr = `<script onerror="_cdnFallback(this)" src="${src}" charset="utf-8"`;
        scriptStr += ifAsync ? ' async ' : '';
        scriptStr += crossorigin ? ' crossorigin="anonymous" ' : '';
        scriptStr += '></script>';

        return scriptStr;
    };
    const loadCss = function (key, vendor = false, media = 'screen') {
        const keys = key.split('.');
        const realKey = vendor ? key : keys.length > 1 ? keys[1] : keys[0];
        const VERSION_MAP = config.VERSION_MAP;
        const realVersionCss = (keys.length > 1 ? VERSION_MAP[keys[0]] : VERSION_MAP['version_css']) || {};
        const src = (config.NODE_ENV === 'development' && !vendor)
            ? `/${realKey}.css`
            : (vendor ? `${config.CDN_PATH}/${realKey}` : `${config.CDN_PATH}/${realVersionCss[realKey]}`);
        const linkStr = `<link rel="stylesheet" href="${src}" media="${media}">`;

        return linkStr;
    };
    const inlineJs = function (key) {
        let result = '<script>';
        const SERVER_ROOT = config.SERVER_ROOT;
        result += fs.readFileSync(path.resolve(SERVER_ROOT, `../${key}`), 'utf-8');
        result += '</script>';
        return result;
    };
    const inlineCss = function (key) {
        let result = '<style>';
        result += fs.readFileSync(path.resolve(config.SERVER_ROOT, `../${key}`), 'utf-8');
        result += '</style>';
        return result;
    };
    env.addGlobal('loadCss', loadCss);
    env.addGlobal('loadStyle', loadCss);
    env.addGlobal('loadJs', loadJs);
    env.addGlobal('loadScript', loadJs);
    env.addGlobal('inlineJs', inlineJs);
    env.addGlobal('inlineCss', inlineCss);

    return async (ctx, next) => {
        const config = ctx.app.config;
        ctx.render = function (name, context = {}) {
            const state = ctx.getState();
            const globalState = defaultsDeep({
                env: config.NODE_ENV,
                version: config.ZAN_VERSION
            }, context._global, ctx.getGlobal());
            const wrapContext = defaultsDeep({}, context, state);
            delete wrapContext.global;
            wrapContext._global = JSON.stringify(globalState);

            ctx.body = env.render(name, wrapContext);
        };
        await next();
    };
};

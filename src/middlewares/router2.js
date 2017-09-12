import fs from 'fs';
import path from 'path';
import debug from 'debug';
import camelCase from 'lodash/camelCase';
import isPlainObject from 'lodash/isPlainObject';
import isFunction from 'lodash/isFunction';
import remove from 'lodash/remove';

const routerDebug = debug('zan:router');

function getAllControllers(basePath, controllers = {}) {
    const items = fs.readdirSync(basePath)
        .filter((item) => {
            return item.indexOf('.') !== 0
        });

    for (let i = 0; i < items.length; i++) {
        let absolutePath = path.join(basePath, items[i]);
        let stat = fs.statSync(absolutePath);
        if (stat.isDirectory()) {
            getAllControllers(absolutePath, controllers);
        } else if (stat.isFile() && items[i].indexOf('.js') === items[i].length - 3) {
            let requireContent = require(absolutePath);
            let key = absolutePath.split('controllers/')[1];

            if (isFunction(requireContent)) {
                controllers[key] = {
                    controller: new requireContent()
                };
            } else if (isPlainObject(requireContent) && requireContent.default) {
                if (isFunction(requireContent.default)) {
                    controllers[key] = {
                        controller: new requireContent.default()
                    };
                } else {
                    controllers[key] = {
                        controller: requireContent.default
                    };
                }
            } else {
                controllers[key] = {
                    controller: requireContent
                };
            }
        }
    }

    return controllers;
};

/**
 * .json 结尾的表示接口请求
 * .html 或无后缀的表示页面请求
 */
module.exports = (config) => {
    let controllers = getAllControllers(config.CONTROLLERS_PATH);
    routerDebug(controllers);

    return async (ctx, next) => {
        const requestPath = ctx.path;
        const method = ctx.method;
        let requestDesc = {
            method: method
        };
        if (/.json$/.test(requestPath)) {
            let pathArr = requestPath.slice(0, -5).split('/').slice(1);
            pathArr = remove(pathArr, (item) => {
                return item !== '';
            });
            if (pathArr.length === 1) {
                requestDesc.file = 'index.js';
                requestDesc.funcName = camelCase(`${method} ${pathArr[0]} json`);
            } else if (pathArr.length >= 2) {
                requestDesc.file = pathArr.slice(0, -1).join('/') + '.js';
                requestDesc.funcName = camelCase(`${method} ${pathArr.slice(-1)} json`);
            }
        } else {
            let pathArr = requestPath.replace('.html', '').split('/').slice(1);
            pathArr = remove(pathArr, (item) => {
                return item !== '';
            });
            if (requestPath === '/' && method === 'GET') {
                requestDesc.file = 'index.js';
                requestDesc.funcName = 'getIndexHtml';
            } else if (pathArr.length === 1) {
                requestDesc.file = 'index.js';
                requestDesc.funcName = camelCase(`${method} ${pathArr[0]} html`);
            } else if (pathArr.length >= 2) {
                requestDesc.file = pathArr.slice(0, -1).join('/') + '.js';
                requestDesc.funcName = camelCase(`${method} ${pathArr.slice(-1)} html`);
            }
        }
        
        routerDebug(requestDesc);
        if (controllers[requestDesc.file] && controllers[requestDesc.file].controller[requestDesc.funcName]) {
            await controllers[requestDesc.file].controller[requestDesc.funcName](ctx, next);
        } else {
            await next();
        }
    };
};

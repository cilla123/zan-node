'use strict';

var _favicon = require('../middlewares/favicon');

var _favicon2 = _interopRequireDefault(_favicon);

var _static = require('../middlewares/static');

var _static2 = _interopRequireDefault(_static);

var _koaHelmet = require('koa-helmet');

var _koaHelmet2 = _interopRequireDefault(_koaHelmet);

var _code = require('../middlewares/code');

var _code2 = _interopRequireDefault(_code);

var _config = require('../middlewares/config');

var _config2 = _interopRequireDefault(_config);

var _state = require('../middlewares/state');

var _state2 = _interopRequireDefault(_state);

var _return = require('../middlewares/return');

var _return2 = _interopRequireDefault(_return);

var _seo = require('../middlewares/seo');

var _seo2 = _interopRequireDefault(_seo);

var _render = require('../middlewares/render');

var _render2 = _interopRequireDefault(_render);

var _log = require('../middlewares/log');

var _log2 = _interopRequireDefault(_log);

var _body = require('../middlewares/body');

var _body2 = _interopRequireDefault(_body);

var _xss = require('../middlewares/xss');

var _xss2 = _interopRequireDefault(_xss);

var _mixin = require('../middlewares/mixin');

var _mixin2 = _interopRequireDefault(_mixin);

var _loader = require('../middlewares/loader');

var _loader2 = _interopRequireDefault(_loader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (config) {
    return [{
        name: 'mixin',
        fn: _mixin2.default
    }, {
        name: 'favicon',
        fn: (0, _favicon2.default)(config.FAVICON_PATH)
    }, {
        name: 'static',
        fn: (0, _static2.default)(config.STATIC_PATH)
    }, {
        name: 'helmet',
        fn: (0, _koaHelmet2.default)({
            dnsPrefetchControl: false,
            noSniff: false,
            ieNoOpen: false,
            frameguard: false
        })
    }, {
        name: 'code',
        fn: (0, _code2.default)(config.CODE_PATH)
    }, {
        name: 'config',
        fn: (0, _config2.default)({
            path: config.CONFIG_PATH,
            NODE_ENV: config.NODE_ENV
        })
    }, {
        name: 'state',
        fn: _state2.default
    }, {
        name: 'return',
        fn: _return2.default
    }, {
        name: 'seo',
        fn: (0, _seo2.default)({
            path: config.SEO_PATH
        })
    }, {
        name: 'loader',
        fn: (0, _loader2.default)({
            NODE_ENV: config.NODE_ENV,
            CDN_PATH: config.CDN_PATH
        })
    }, {
        name: 'render',
        fn: (0, _render2.default)({
            viewPath: config.VIEW_PATH,
            extraConfig: config.VIEW_EXTRA_DATA
        })
    }, {
        name: 'log',
        fn: (0, _log2.default)()
    }, {
        name: 'body',
        fn: (0, _body2.default)()
    }, {
        name: 'xss',
        fn: (0, _xss2.default)({
            WHITELISTS: config.XSS_WHITELISTS
        })
    }];
};
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _parse = require('./parse');

var _parse2 = _interopRequireDefault(_parse);

var _stringify = require('./stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var JSON5 = {
    parse: _parse2.default,
    stringify: _stringify2.default
};

exports.default = module.exports = JSON5;
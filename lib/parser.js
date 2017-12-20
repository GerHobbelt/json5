'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _stream = require('stream');

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Parser =
/**
 *
 * @param {string|Buffer|stream.Readable} source
 * @param {string?} encoding
 */
function Parser(source) {
    var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'utf8';

    _classCallCheck(this, Parser);

    if (!Buffer.isEncoding(encoding)) {
        throw new Error('encoding must be a valid encoding');
    }

    this._buffer = '';

    if (source instanceof String) {
        this._buffer = String(source);
    } else if (typeof source === 'string') {
        this._buffer = source;
    } else if (Buffer.isBuffer(source)) {
        this._buffer = Buffer.from(source, encoding);
    } else if (isReadable(source)) {
        this._stream = source;
    } else {
        throw TypeError('source must be a string, Buffer, or Readable stream');
    }

    this._pos = 0;
};

exports.default = Parser;


function isReadable(stream) {
    return stream !== null && (typeof stream === 'undefined' ? 'undefined' : _typeof(stream)) === 'object' && typeof stream.pipe === 'function' && typeof stream._read === 'function' && _typeof(stream._readableState) === 'object';
}
module.exports = exports['default'];
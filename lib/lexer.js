'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stream = require('stream');

var _stream2 = _interopRequireDefault(_stream);

var _string_decoder = require('string_decoder');

var _util = require('./util');

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Lexer = function (_stream$Transform) {
    _inherits(Lexer, _stream$Transform);

    /**
     *
     * @param {string} encoding
     */
    function Lexer() {
        var encoding = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'utf8';

        _classCallCheck(this, Lexer);

        var _this = _possibleConstructorReturn(this, (Lexer.__proto__ || Object.getPrototypeOf(Lexer)).call(this, {
            readableObjectMode: true
        }));

        if (!Buffer.isEncoding(encoding)) {
            throw new Error('encoding must be a valid encoding');
        }

        _this._decoder = new _string_decoder.StringDecoder(encoding);
        return _this;
    }

    /**
     *
     * @param {Buffer} chunk
     * @param {string} encoding
     * @param {Function} callback
     */


    _createClass(Lexer, [{
        key: '_transform',
        value: function _transform(chunk, encoding, callback) {
            this._source = this._decoder.write(chunk);
            this._pos = 0;
            this._lex();
        }

        /**
         *
         * @param {Function} callback
         */

    }, {
        key: '_flush',
        value: function _flush(callback) {
            this._ended = true;
        }
    }, {
        key: '_lex',
        value: function _lex() {
            for (;;) {
                this._c = this._peekChar();
                switch (this._c) {
                    case '\t':
                    case '\v':
                    case '\f':
                    case ' ':
                    case '\xA0':
                    case '\uFEFF':
                    case '\n':
                    case '\r':
                    case '\u2028':
                    case '\u2029':
                        this._readChar();
                        continue;

                    case '/':
                        this._readChar();
                        return this._comment();

                    case undefined:
                        this._readChar();
                        return this._ended ? 'eof' : null;
                }

                if (util.isSpaceSeparator(this._c)) {
                    this._readChar();
                    continue;
                }
            }
        }
    }, {
        key: '_comment',
        value: function _comment() {}

        /**
         * @returns {string}
         */

    }, {
        key: '_peekChar',
        value: function _peekChar() {
            return this._source[this._pos];
        }

        /**
         * @returns {string}
         */

    }, {
        key: '_readChar',
        value: function _readChar() {
            return this._c = this._source[this._pos++];
        }
    }]);

    return Lexer;
}(_stream2.default.Transform);

exports.default = Lexer;
module.exports = exports['default'];
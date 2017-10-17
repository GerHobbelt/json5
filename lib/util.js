'use strict';

var _unicode = require('../lib/unicode');

var _unicode2 = _interopRequireDefault(_unicode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
    isSpaceSeparator: function isSpaceSeparator(c) {
        return _unicode2.default.Space_Separator.test(c);
    },
    isIdStartChar: function isIdStartChar(c) {
        return c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c === '$' || c === '_' || _unicode2.default.ID_Start.test(c);
    },
    isIdContinueChar: function isIdContinueChar(c) {
        return c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c >= '0' && c <= '9' || c === '$' || c === '_' || c === '\u200C' || c === '\u200D' || _unicode2.default.ID_Continue.test(c);
    },
    isDigit: function isDigit(c) {
        return (/[0-9]/.test(c)
        );
    },
    isHexDigit: function isHexDigit(c) {
        return (/[0-9A-Fa-f]/.test(c)
        );
    }
};
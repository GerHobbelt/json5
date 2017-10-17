import stream from 'stream'
import {StringDecoder} from 'string_decoder'

import * as util from './util'

export default class Lexer extends stream.Transform {
    /**
     *
     * @param {string} encoding
     */
    constructor (encoding = 'utf8') {
        super({
            readableObjectMode: true,
        })

        if (!Buffer.isEncoding(encoding)) {
            throw new Error('encoding must be a valid encoding')
        }

        this._decoder = new StringDecoder(encoding)
    }

    /**
     *
     * @param {Buffer} chunk
     * @param {string} encoding
     * @param {Function} callback
     */
    _transform (chunk, encoding, callback) {
        this._source = this._decoder.write(chunk)
        this._pos = 0
        this._lex()
    }

    /**
     *
     * @param {Function} callback
     */
    _flush (callback) {
        this._ended = true
    }

    _lex () {
        for (;;) {
            this._c = this._peekChar()
            switch (this._c) {
            case '\t':
            case '\v':
            case '\f':
            case ' ':
            case '\u00A0':
            case '\uFEFF':
            case '\n':
            case '\r':
            case '\u2028':
            case '\u2029':
                this._readChar()
                continue

            case '/':
                this._readChar()
                return this._comment()

            case undefined:
                this._readChar()
                return this._ended ? 'eof' : null
            }

            if (util.isSpaceSeparator(this._c)) {
                this._readChar()
                continue
            }
        }
    }

    _comment () {

    }

    /**
     * @returns {string}
     */
    _peekChar () {
        return this._source[this._pos]
    }

    /**
     * @returns {string}
     */
    _readChar () {
        return (this._c = this._source[this._pos++])
    }
}

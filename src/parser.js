import stream from 'stream'

export default class Parser {
    /**
     *
     * @param {string|Buffer|stream.Readable} source
     * @param {string?} encoding
     */
    constructor (source, encoding = 'utf8') {
        if (!Buffer.isEncoding(encoding)) {
            throw new Error('encoding must be a valid encoding')
        }

        this._buffer = ''

        if (source instanceof String) {
            this._buffer = String(source)
        } else if (typeof source === 'string') {
            this._buffer = source
        } else if (Buffer.isBuffer(source)) {
            this._buffer = Buffer.from(source, encoding)
        } else if (isReadable(source)) {
            this._stream = source
        } else {
            throw TypeError('source must be a string, Buffer, or Readable stream')
        }

        this._pos = 0
    }
}

function isReadable (stream) {
    return (
        stream !== null &&
        typeof stream === 'object' &&
        typeof stream.pipe === 'function' &&
        typeof stream._read === 'function' &&
        typeof stream._readableState === 'object'
    )
}

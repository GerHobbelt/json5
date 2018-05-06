const assert = require('assert')
const child = require('child_process')
const fs = require('fs')
const path = require('path')
const tap = require('tap')
const pkg = require('../package.json')

const cliPath = path.resolve(__dirname, '../lib/cli.js')

tap.test('CLI', t => {
    t.test('converts JSON5 to JSON from stdin to stdout', t => {
        const proc = child.spawn(process.execPath, [cliPath, '-c'])
        let output = ''
        proc.stdout.on('data', data => {
            output += data
        })

        proc.stdout.on('end', () => {
            assert.strictEqual(output, '{"a":1,"b":2}')
            t.end()
        })

        fs.createReadStream(path.resolve(__dirname, 'test.json5')).pipe(proc.stdin)
    })

    t.test('reads from the specified file', t => {
        const proc = child.spawn(
            process.execPath,
            [
                cliPath,
                '-c',
                '-o-',
                path.resolve(__dirname, 'test.json5'),
            ]
        )

        let output = ''
        proc.stdout.on('data', data => {
            output += data
        })

        proc.stdout.on('end', () => {
            assert.strictEqual(output, '{"a":1,"b":2}')
            t.end()
        })
    })

    t.test('indents output with the number of spaces specified', t => {
        const proc = child.spawn(
            process.execPath,
            [
                cliPath,
                path.resolve(__dirname, 'test.json5'),
                '-s',
                '4',
                '-o-',
            ]
        )

        let output = ''
        proc.stdout.on('data', data => {
            output += data
        })

        proc.stdout.on('end', () => {
            assert.strictEqual(output, '{\n    a: 1,\n    b: 2,\n}\n')
            t.end()
        })
    })

    t.test('indents output with tabs when specified', t => {
        const proc = child.spawn(
            process.execPath,
            [
                cliPath,
                path.resolve(__dirname, 'test.json5'),
                '-s',
                't',
                '-o-',
            ]
        )

        let output = ''
        proc.stdout.on('data', data => {
            output += data
        })

        proc.stdout.on('end', () => {
            assert.strictEqual(output, '{\n\ta: 1,\n\tb: 2,\n}\n')
            t.end()
        })
    })

    t.test('outputs JSON to the specified file', t => {
        const proc = child.spawn(
            process.execPath,
            [
                cliPath,
                '-c',
                path.resolve(__dirname, 'test.json5'),
                '-o',
                path.resolve(__dirname, 'output.json'),
            ]
        )

        proc.on('exit', () => {
            assert.strictEqual(
                fs.readFileSync(
                    path.resolve(__dirname, 'output.json'),
                    'utf8'
                ),
                '{"a":1,"b":2}'
            )
            t.end()
        })

        t.tearDown(() => {
            try {
                fs.unlinkSync(path.resolve(__dirname, 'output.json'))
            } catch (err) {}
        })
    })

    t.test('outputs JSON5 to the specified file', t => {
        const proc = child.spawn(
            process.execPath,
            [
                cliPath,
                path.resolve(__dirname, 'test2.json'),
            ]
        )

        proc.on('exit', () => {
            assert.strictEqual(
                fs.readFileSync(
                    path.resolve(__dirname, 'test2.json5'),
                    'utf8'
                ),
                '{a:1,b:2,c:\'d\'}'
            )
            t.end()
        })

        t.tearDown(() => {
            try {
                fs.unlinkSync(path.resolve(__dirname, 'test2.json5'))
            } catch (err) {}
        })
    })

    t.test('validates valid JSON5 files', t => {
        const proc = child.spawn(
            process.execPath,
            [
                cliPath,
                path.resolve(__dirname, 'test.json5'),
                '-v',
            ]
        )

        proc.on('exit', code => {
            assert.strictEqual(code, 0)
            t.end()
        })
    })

    t.test('validates valid JSON5 from stdin', t => {
        const proc = child.spawn(process.execPath, [cliPath, '-v'])
        let output = ''
        proc.stdout.on('data', data => {
            output += data
        })

        proc.stdout.on('end', () => {
            assert.strictEqual(output, '\t\u001b[32;1minput is valid.\u001b[0m\n')
            t.end()
        })

        fs.createReadStream(path.resolve(__dirname, 'test.json5')).pipe(proc.stdin)
    })

    t.test('validates invalid JSON5 files', t => {
        const proc = child.spawn(
            process.execPath,
            [
                cliPath,
                path.resolve(__dirname, 'invalid.json5'),
                '-v',
            ]
        )

        let error = ''
        proc.stderr.on('data', data => {
            error += data
        })

        proc.stderr.on('end', () => {
            assert.strictEqual(error, "JSON5: invalid character 'a' at 1:1\n")
        })

        proc.on('exit', code => {
            assert.strictEqual(code, 1)
            t.end()
        })
    })

    t.test('outputs the version number when specified', t => {
        const proc = child.spawn(process.execPath, [cliPath, '-V'])

        let output = ''
        proc.stdout.on('data', data => {
            output += data
        })

        proc.stdout.on('end', () => {
            assert.strictEqual(output, pkg.version + '\n')
            t.end()
        })
    })

    t.test('outputs usage information when specified', t => {
        const proc = child.spawn(process.execPath, [cliPath, '-h'])

        let output = ''
        proc.stdout.on('data', data => {
            output += data
        })

        proc.stdout.on('end', () => {
            assert(/Usage/.test(output))
            t.end()
        })
    })

    t.test('is backward compatible with v0.5.1', t => {
        const proc = child.spawn(
            process.execPath,
            [
                cliPath,
                '-c',
                path.resolve(__dirname, 'test.json5'),
            ]
        )

        proc.on('exit', () => {
            assert.strictEqual(
                fs.readFileSync(
                    path.resolve(__dirname, 'test.json'),
                    'utf8'
                ),
                '{"a":1,"b":2}'
            )
            t.end()
        })

        t.tearDown(() => {
            try {
                fs.unlinkSync(path.resolve(__dirname, 'test.json'))
            } catch (err) {}
        })
    })

    t.end()
})

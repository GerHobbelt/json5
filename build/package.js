const fs = require('fs')
const path = require('path')

const JSON5 = require('../lib')

const pkg = require('../package.json')

let pkg5 = '// This is a generated file. Do not edit.\n'
pkg5 += pkg5 = JSON5.stringify(pkg, null, 2)

fs.writeFileSync(path.resolve(__dirname, '..', 'package.json5'), pkg5)


// Also update version refs in README:
let md = fs.readFileSync(path.resolve(__dirname, '..', 'README.md'), 'utf8');

md = md
.replace(/(@gerhobbelt\/json5@)[0-9.-]+/g, (m, m1) => `${m1}${pkg.version}`)

fs.writeFileSync(path.resolve(__dirname, '..', 'README.md'), md)

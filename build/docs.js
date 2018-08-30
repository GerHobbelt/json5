const fs = require('fs')
const path = require('path')
const {Parser, HtmlRenderer} = require('commonmark')

const docsDir = 'docs'
const title = 'JSON5 — JSON for Humans'

const header = `<!DOCTYPE html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/github.min.css">
<link rel="stylesheet" href="index.css">
<title>${title}</title>
`

const footer = `
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js"></script>
<script>
hljs.configure({languages: ['html', 'javascript']})
hljs.initHighlightingOnLoad()
</script>
`

if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir)
}

const md = fs.readFileSync('README.md', 'utf8')

const parser = new Parser()
const renderer = new HtmlRenderer()

const html = renderer.render(parser.parse(md))

fs.writeFileSync(path.resolve(docsDir, 'index.html'), header + html + footer)

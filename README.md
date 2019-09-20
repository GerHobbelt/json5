# JSON5 – JSON for Humans

[![GitHub Repository][github-badge]][github-url]
[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage Status][coveralls-badge]][coveralls-url]
[![Dependency Status][david-badge]][david-url]




>
> # Notice
>
> This repository contains a fork maintained by GerHobbelt. The original JSON5 work is available at [json5/json5](https://github.com/json5/json5).
>
> For an overview of all changes \(fixes and features\), see the section [What's New or Different?](#user-content-whats-new-or-different) further below.
>



The JSON5 Data Interchange Format (JSON5) is a superset of [JSON] that aims to
alleviate some of the limitations of JSON by expanding its syntax to include
some productions from [ECMAScript 5.1].

This JavaScript library is a derivative of the official reference implementation for JSON5
parsing and serialization libraries, where this derivative includes a few extra features: 
these extras are marked with 🎷🍓 in the feature list further below.

[Build Status]: https://travis-ci.org/GerHobbelt/json5

[Coverage Status]: https://coveralls.io/github/GerHobbelt/json5

[JSON]: https://tools.ietf.org/html/rfc8259

[ECMAScript 5.1]: https://www.ecma-international.org/ecma-262/5.1/




## Why

JSON isn’t the friendliest to *write*. Keys need to be quoted, objects and
arrays can’t have trailing commas, and comments aren’t allowed — even though
none of these are the case with regular JavaScript today.

That was fine when JSON’s goal was to be a great data format, but JSON’s usage
has expanded beyond *machines*. JSON is now used for writing [configs][ex1],
[manifests][ex2], even [tests][ex3] — all by *humans*.

[ex1]: http://plovr.com/docs.html
[ex2]: https://www.npmjs.org/doc/files/package.json.html
[ex3]: http://code.google.com/p/fuzztester/wiki/JSONFileFormat

There are other formats that are human-friendlier, like YAML, but changing
from JSON to a completely different format is undesirable in many cases.
JSON5’s aim is to remain close to JSON and JavaScript.


## Summary of Features

The following ECMAScript 5.1 features, which are not supported in JSON, have
been extended to JSON5.


### Objects

- Object keys may be an ECMAScript 5.1 _[IdentifierName]_.
- Objects may have a single trailing comma.


### Arrays

- Arrays may have a single trailing comma.


### Strings

- Strings may be single quoted.
- Strings may span multiple lines by escaping new line characters.
- Strings may include character escapes.
- 🎷🍓 Strings may be [ES2015-style \`...\` multiline string template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).
- 🎷🍓 Strings may be ["heredoc" strings](https://en.wikipedia.org/wiki/Here_document).

Note the restrictions mentioned below in the section about enhanced string formats.


### Numbers

- Numbers may be hexadecimal.
- Numbers may have a leading or trailing decimal point.
- Numbers may be [IEEE 754] positive infinity, negative infinity, and NaN.
- Numbers may begin with an explicit plus sign.


## RegExp instances (and derived classes)

- 🎷🍓 [RegExp class](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) instances
  are serialized as regular objects with at least these attributes: 
  
  + `re` ([`=RegExp.toString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/toString)
  + `source` ([`=RegExp.source`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/source))
  + `flags` ([`=RegExp.flags`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/flags))
  
  Any [browsable attributes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys) added to the instance will be included in the JSON5 output.


## Error instances (and derived classes)

- 🎷🍓 [Error class](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) instances
  are serialized as regular objects with at least these attributes: 
  
  + `name` ([`=Error.name`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/name)
  + `message` ([`=Error.message`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message))
  
  Any [browsable attributes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys) added to the instance will be included in the JSON5 output.


### Comments

- Single and multi-line comments are allowed.


### White Space

- Additional white space characters are allowed.

[IdentifierName]: https://www.ecma-international.org/ecma-262/5.1/#sec-7.6

[IEEE 754]: http://ieeexplore.ieee.org/servlet/opac?punumber=4610933


## Short Example

```js
{
  // comments
  unquoted: 'and you can quote me on that',
  singleQuotes: 'I can use "double quotes" here',
  lineBreaks: "Look, Mom! \
No \\n's!",
  hexadecimal: 0xdecaf,
  leadingDecimalPoint: .8675309, andTrailing: 8675309.,
  positiveSign: +1,
  trailingComma: 'in objects', andIn: ['arrays',],
  "backwardsCompatible": "with JSON",
}
```


## Specification

For a detailed explanation of the JSON5 format, please read the [official
specification](https://json5.github.io/json5-spec/).


## Installation

### Node.js

```sh
npm install @gerhobbelt/json5
```

```js
const JSON5 = require('@gerhobbelt/json5')
```


### Browsers

```html
<script src="https://unpkg.com/@gerhobbelt/json5@2.1.0-49"></script>
```

This will create a global `JSON5` variable.


## API

The JSON5 API is compatible with the [JSON API].

[JSON API]:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON


### `JSON5.parse()`

Parses a JSON5 string, constructing the JavaScript value or object described by
the string. An optional reviver function can be provided to perform a
transformation on the resulting object before it is returned.


#### Syntax

    JSON5.parse(text[, reviver])


#### Parameters

- `text`: The string to parse as JSON5.
- `reviver`: If a function, this prescribes how the value originally produced by
  parsing is transformed, before being returned.

  `reviver` callback function arguments: `(key, value)`, where

  + `this`: references the JavaScript object containing the key/value pair.
  + `key`: a string representing the attribute `value`.
  + `value`: the value of the `this[key]` attribute, as parsed by JSON5.
  
  The `reviver()` function returns the (possibly altered/'revived') `value`.
  
  When `reviver()` returns `undefined`, the attribute (`this[key]`) is *deleted* 
  from the object.
  
  The root of the parsed JSON5 object tree is also passed into `reviver()` as an
  attribute with key `''` (empty string), thus allowing `reviver()` to postprocess
  every part of the parsed JSON5 input.
  
  Note that `reviver()` is called as part of the JSON5 parse *postprocess* and thus 
  CANNOT be used to encode alternate behaviour when encountering duplicate keys in
  an input object or other parse errors: JSON5 first performs a full parse, before
  invoking `reviver()` on each of the regenerated elements.


#### Return value

The object corresponding to the given JSON5 text.


### `JSON5.stringify()`

Converts a JavaScript value to a JSON5 string, optionally replacing values if a
replacer function is specified, or optionally including only the specified
properties if a replacer array is specified.


#### Syntax

    JSON5.stringify(value[, replacer[, space[, circularRefHandler]]])
    JSON5.stringify(value[, options])


#### Parameters

- `value`: The value to convert to a JSON5 string.
- `replacer`: A function that alters the behavior of the stringification
  process, or an array of String and Number objects that serve as a whitelist
  for selecting/filtering the properties of the value object to be included in
  the JSON5 string. If this value is null or not provided, all properties of the
  object are included in the resulting JSON5 string.
- `space`: A String or Number object that's used to insert white space into the
  output JSON5 string for readability purposes. If this is a Number, it
  indicates the number of space characters to use as white space; this number is
  capped at 10 (if it is greater, the value is just 10). Values less than 1
  indicate that no space should be used. If this is a String, the string (or the
  first 10 characters of the string, if it's longer than that) is used as white
  space. If this parameter is not provided (or is null), no white space is used.
  If white space is used, trailing commas will be used in objects and arrays.
- `circularRefHandler`: 🎷🍓 A callback function which is invoked for every element
  which would otherwise cause `JSON5.stringify()` to throw a 
  `"converting circular structure to JSON5"` *TypeError* exception.

  The callback returns the value to stringify in its stead. When this value
  happens to contain circular references itself, then these will be detected
  by `JSON5.stringify()` and encoded as `'[!circular ref inside circularRefHandler!]'`
  string values instead.

  Callback function arguments: `(value, circusPos, stack, keyStack, key, err)`, where

  + `value`: The circular reference value.
  + `circusPos`: Index into the `stack[]` and `keyStack[]` arrays, indicating the
    parent object which is referenced by the `value` circular reference value.
  + `stack`: The stack of parents (objects, arrays) for this value. The first entry
    (index 0) is the root `value`. The array is a snapshot (shallow clone) to ensure 
    user code can simply store this reference value directly [without risking
    JSON5-internal closure problems which would ensue when we wouldn't have provided
    you with a snapshot/clone](https://stackoverflow.com/questions/750486/javascript-closure-inside-loops-simple-practical-example).
  + 'keyStack': The stack of keys, one for each parent, which describe the path
    to the offending circular reference value for the root `value` down. The first entry
    (index 0) is the root `value`. Useful when you wish to display a diagnostic 
    which lists the traversal path through the object hierarchy in the root value
    towards the circular reference `value` at hand, for instance.  
    The array is a snapshot (shallow clone) to ensure 
    user code can simply store this reference value directly [without risking
    JSON5-internal closure problems which would ensue when we wouldn't have provided
    you with a snapshot/clone](https://stackoverflow.com/questions/750486/javascript-closure-inside-loops-simple-practical-example).
  + `key`: Direct parent key of the current `value`. Same as `keyStack[keyStack.length - 1]`.
  + `err`: The TypeError produced by `JSON5.stringify()`: provided here so your
    user-defined callback code can deside to throw that circular reference error
    anyway.  
- `options`: An object with the following properties:
  - `replacer`: Same as the `replacer` parameter.
  - `space`: Same as the `space` parameter.
  - `quote`: A String representing the quote character to use when serializing
    strings. When not explicitly specified, JSON5 will heuristically determine 
	the quote to use for each string value to minimize the number of character
	escapes (and thus minimize output size).
  - `circularRefHandler`: 🎷🍓 A callback function which is invoked for every element
    which would otherwise cause `JSON5.stringify()` to throw a 
    `"converting circular structure to JSON5"` *TypeError* exception. See the 
    `circularRefHandler` argument description above for more info.
  - `noES6StringOutput`: 🎷🍓 when set to `true` (or a truthy value) 
    `JSON5.stringify()` will not output ('`') backtick-encoded 
    ES6 string literals; instead the strings will be output in JSON5 Standard 
	single- or double-quoted escaped string values. You may set this option to 
	output JSON5 files which will be conpatible with other Standard JSON5 readers.


#### Return value

A JSON5 string representing the value.


### Node.js `require()` JSON5 files

When using Node.js, you can `require()` JSON5 files by adding the following
statement.

```js
require('json5/lib/register')
```

Then you can load a JSON5 file with a Node.js `require()` statement. For
example:

```js
const config = require('./config.json5')
```

**NOTE**: 🎷🍓 This, of course, assumes the `require`d JSON5 file DOES NOT contain "heredoc" formatted
string content!


## CLI

Since JSON is more widely used than JSON5, this package includes a CLI for
converting JSON5 to JSON and for validating the syntax of JSON5 documents.


### Installation

```sh
npm install --global @gerhobbelt/json5
```


### Usage

```sh
json5 [options] <file>
```

If `<file>` is not provided, then STDIN is used.


#### Options:

- `-s`, `--space`: The number of spaces to indent or `t` for tabs
- `-o`, `--out-file [file]`: Output to the specified file, otherwise STDOUT. (🎷🍓 If `-` is given as the `file` name, STDOUT is used.)
- `-v`, `--validate`: Validate JSON5 but do not output JSON
- `-V`, `--version`: Output the version number
- `-h`, `--help`: Output usage information


## Contributing

### Development

```sh
git clone https://github.com/GerHobbelt/json5
cd json5
npm install
```

When contributing code, please write relevant tests and run `npm test` and `npm
run lint` before submitting pull requests. Please use an editor that supports
[EditorConfig](http://editorconfig.org/).


### Issues

To report bugs or request features regarding the JSON5 data format, please
submit an issue to the [official specification
repository](https://github.com/json5/json5-spec).

To report bugs or request features regarding the JavaScript implementation of
JSON5, please submit an issue to this repository.






## Contributors

[Githubbers](http://github.com/GerHobbelt/json5/contributors)





## 🎷🍓 What's New or Different?

Here's a comprehensive list of features and fixes compared to the [original](https://github.com/json5/json5)

* 🎷🍓 added support for [ES2015-style \`...\` multiline string template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), e.g.

  ```
  { str: `multiline
          example
          string value!` 
  }
  ```
  
  **Notes on this enhanced string format**:
  
  + While [The Template Literals Spec](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals)
    says otherwise, we still DO NOT support octal escapes in JSON5 '`'-delimited *multiline
    strings*, as these ARE NOT identical to JavaScript 'template strings' as we DO NOT
    intend to support the `${...}` template variable expansion feature either!
  
    The *multiline string literals* are available to ease writing JSON5 content 
	by hand (or generator) where the string content spans multiple lines and/or 
	contains various quote characters, thus minimizing the need for escaping 
	content.
  
  + Any MAC or WINDOWS style line ends are transformed to standard UNIX line ends, 
    i.e. these transformations are done automatically by JSON5: 
	
	- CRLF -> LF
	- CR -> LF
  
* 🎷🍓 added support for [heredoc string](https://en.wikipedia.org/wiki/Here_document) values, 
  which must start with `<<` immediately followed by a marker, e.g. `EOT` or 
  some other alphanumeric identifier, which, when used on a line alone, will 
  signal the end of the 'heredoc' string. 

  For example:

  ```
  { str: <<EOT
          multiline EOT
          example \n
          string value!
  EOT
  }
  ```
  
  will have encoded the literal string
  
  ```
          multiline EOT
          example \n
          string value!
  ```

  i.e. none of the content of the heredoc will be treated as escaped! (The `\n` in 
  there would thus read as JavaScript string `"\\n"`.)

  **Notes on this enhanced string format**:
  
  + When parsing heredoc values, we must extract the EOT marker before anything 
    else. Once we've done that, we skip the first newline and start 
	scanning/consuming heredoc content until we hit the EOT marker on a line 
	by itself, sans whitespace.
  
  + We accept 2 or more(!) `<` characters to mark the start of a heredoc chunk.
  
  + We accept any non-whitespace character sequence as heredoc EOT marker.
    
  + By convention we do not accept 'formatting whitespace/indentation' before the EOT
    marker on the same line.
    
	The *content* of the heredoc starts after the first CR/LF;
    we DO NOT tolerate trailing whitespace or any other cruft immediately 
	following the EOT marker!
  
  + JSON5 scans for a lone heredoc EOT marker to terminate the string content; 
    until we find one, everything is literal string content.

  + heredoc content DOES NOT process escape sequences: everything is passed on as-is!

  + The content ENDS *before* the last CR/LF before the lone EOT marker; 
    i.e. the EOT marker must exist
    on a line by itself, without any preceeding or trailing whitespace.
	
  + If the JSON5 field is followed by more data, the separator (comma, bracket, ...) 
    must exist on the line *past* the EOT marker line: the EOT must be 
	clearly 'alone' in there, e.g.:
	
	```
	{ str: <<EOT
	multiline EOT
	example \n
	string value!
	EOT
	, extra: 42
	}
	```
  
  + CR / CRLF / LF MAC/Windows/UNIX line ends in the content ARE NOT transformed.
  
    This differs from the 'multiline string literal' type described above, 
	where all line endings are automatically converted to UNIX style '\n'.
	Hence one may consider heredoc as a *binary data* format.
  
* 🎷🍓 `JSON5.stringify()` comes with a *fourth* argument: an optional callback method 
  which will be invoked for each value in the value-to-stringify which would cause 
  a 'cyclical reference' error to be thrown otherwise. 
  
  The user-specified callback can deliver an alternative value to encode in its stead 
  or throw the error exception after all.

  See the API documentation further above.
  
* 🎷🍓 Duplicate the same key in an object causes a syntax error when parsing JSON5 input. 
  (This can happen, for instance, when you feed manually edited JSON5 content 
  to `JSON5.parse()` or when processing JSON5 content which has been (incorrectly) 
  merged by arbitrary text diff/patch tools.)




## License

MIT. See [LICENSE.md](https://github.com/json5/json5/blob/master/LICENSE.md) for
details.



## Credits

[Assem Kishore](https://github.com/aseemk) founded this project.

[Michael Bolin](http://bolinfest.com/) independently arrived at and published
some of these same ideas with awesome explanations and detail. Recommended
reading: [Suggested Improvements to JSON](http://bolinfest.com/essays/json.html)

[Douglas Crockford](http://www.crockford.com/) of course designed and built
JSON, but his state machine diagrams on the [JSON website](http://json.org/), as
cheesy as it may sound, gave us motivation and confidence that building a new
parser to implement these ideas was within reach! The original
implementation of JSON5 was also modeled directly off of Doug’s open-source
[json_parse.js] parser. We’re grateful for that clean and well-documented
code.

[json_parse.js]:
https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js

[Max Nanasy](https://github.com/MaxNanasy) has been an early and prolific
supporter, contributing multiple patches and ideas.

[Andrew Eisenberg](https://github.com/aeisenberg) contributed the original
`stringify` method.

[Jordan Tucker](https://github.com/jordanbtucker) has aligned JSON5 more closely
with ES5, wrote the official JSON5 specification, completely rewrote the
codebase from the ground up, and is actively maintaining this project.



## Related material

Packages and documents discussing material which attempts to solve the same
or a very similar problem: 

machine-readable (and -writable) structured data
which is easy for humans to *read* and *write*.

### Packages

- HJSON: http://hjson.org/ / https://github.com/hjson/hjson
- JSONext: https://github.com/jordanbtucker/jsonext
- cJSON: https://github.com/kof/node-cjson

### Documents

- https://github.com/json5/json5/issues/190 / https://github.com/hjson/hjson/issues/87






[github-badge]: https://img.shields.io/badge/github-json5%2Fjson5-blue.svg
[github-url]: https://github.com/json5/json5
[npm-badge]: https://img.shields.io/npm/v/@gerhobbelt/json5.svg
[npm-url]: https://npmjs.com/package/@gerhobbelt/json5
[travis-badge]: https://api.travis-ci.org/GerHobbelt/json5.svg
[travis-url]: https://travis-ci.org/GerHobbelt/json5
[coveralls-badge]:https://coveralls.io/repos/GerHobbelt/json5/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/GerHobbelt/json5?branch=master
[david-badge]: https://david-dm.org/GerHobbelt/json5.svg
[david-url]: https://david-dm.org/GerHobbelt/json5


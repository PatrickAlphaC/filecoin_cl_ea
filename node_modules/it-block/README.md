# it-block

[![Dependency Status](https://david-dm.org/alanshaw/it-block.svg?style=flat-square)](https://david-dm.org/alanshaw/it-block) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> Transform input into equally-sized chunks as output

An async iterators version of [block-stream](https://npmjs.org/package/block-stream).

## Install

```sh
npm install it-block
```

## Usage

### Example

```js
const block = require('it-block')
const pipe = require('it-pipe')

const chr = s => '\\x' + pad(s.charCodeAt(0).toString(16), 2)
const pad = (s, n) => Array(n - s.length + 1).join('0') + s

pipe(
  process.stdin,
  block({ size: 16 }),
  async source => {
    for await (const buf of source) {
      const str = buf.toString().replace(/[\x00-\x1f]/g, chr)
      console.log('buf[' + buf.length + ']=' + str)
    }
  }
)
```

```console
$ echo {c,d,f}{a,e,i,o,u}{t,g,r} | node example/stream.js
buf[16]=cat cag car cet
buf[16]=ceg cer cit cig
buf[16]=cir cot cog cor
buf[16]=cut cug cur dat
buf[16]=dag dar det deg
buf[16]=der dit dig dir
buf[16]=dot dog dor dut
buf[16]=dug dur fat fag
buf[16]=far fet feg fer
buf[16]=fit fig fir fot
buf[16]=fog for fut fug
buf[16]=fur\x0a\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00
```

## API

```js
const block = require('it-block')
```

### `const b = block(opts)`
### `const b = block(size, opts)`

Create a new [transform](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#transform-it) `b` that yields chunks of length `size`/`opts.size`.

**Note**: chunks that are output are [`BufferList`](https://www.npmjs.com/package/bl) objects NOT `Buffer`s.

When `opts.noPad` is `true`, do not zero-pad the last chunk.

## License

MIT

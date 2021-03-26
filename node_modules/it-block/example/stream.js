'use strict'

const block = require('../')
const pipe = require('it-pipe')

const chr = s => '\\x' + pad(s.charCodeAt(0).toString(16), 2)
const pad = (s, n) => Array(n - s.length + 1).join('0') + s

pipe(
  process.stdin,
  block({ size: 16 }),
  async source => {
    for await (const buf of source) {
      const str = buf.toString().replace(/[\x00-\x1f]/g, chr) // eslint-disable-line
      console.log('buf[' + buf.length + ']=' + str)
    }
  }
)

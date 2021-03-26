const BufferList = require('bl/BufferList')

module.exports = (size, options) => {
  if (typeof size === 'object') {
    options = size
    size = options.size
  } else {
    options = options || {}
  }

  if (!size) throw new Error('block size is required')

  return source => {
    return (async function * () {
      let buffer = new BufferList()
      let started = false

      for await (const chunk of source) {
        started = true
        buffer = buffer.append(chunk)

        while (buffer.length >= size) {
          if (buffer.length === size) {
            yield buffer
            buffer = new BufferList()
            break
          }

          yield buffer.shallowSlice(0, size)
          buffer = buffer.shallowSlice(size)
        }
      }

      if (started && buffer.length) {
        if (options.noPad) {
          yield buffer
        } else {
          yield buffer.append(Buffer.alloc(size - buffer.length))
        }
      }
    })()
  }
}

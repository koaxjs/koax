
# koax

[![Build status][travis-image]][travis-url]
[![Git tag][git-image]][git-url]
[![NPM version][npm-image]][npm-url]
[![Code style][standard-image]][standard-url]

Powerful and testable control flow inspired by co, koa and redux and in pursuit of free monads.

Koax makes it easy to build a modular recursive interpreter through the use of middleware and yields. The middleware's signature looks like: `middleware (action, next, ctx)`. This works similar to the way redux middleware works - you can return a result or defer to the next middleware by returning `next()`. Middleware can be functions or generators. If it is a generator, it can leverage `yield` to `dispatch` values back through the middleware stack, with special support for generators, functors, promises, and thunks.

## Installation

    $ npm install koax

## Usage

```js
import koax from 'koax'

let dispatch = koax([
  function * (action, next) {
    if (action === 'fetch') return yield Promise.resolve('google')
    return next()
  },
  function * (action, next) {
    if (action === 'foo') return 'foo ' + (yield 'fetch')
    return 'qux'
  }
])

dispatch('fetch').then((res) => res) // => 'google'
dispatch('bar').then((res) => res) // => 'qux'
dispatch('foo').then((res) => res) // => 'foo google'

```

## API

### koax(middleware)

- `middleware` - and array of middleware

**Returns:** a dispatch function

### middleware(action, next, ctx)

- `action` - an action that middleware can process (preferably treat as immutable)
- `next` - a function that passes execution to next middleware (can `yield` or `return`)
- `ctx` - a global persistent mutable object (be careful - used for things like state)

**Returns:** whatever your heart desires or `next()` to defer to the next middleware

```js

function * middleware (action, next, ctx) {
  // return a simple value
  if (action.type === 'FOO') return 'bar'
  // dispatch FETCH and return its result
  if (action.type === 'QUX') return yield {type: 'FETCH', payload: 'google'}
  // pass execution to next middleware
  return next()
}
```

### next()

`next` is simply a function that calls the next middleware with `action`, `next`, and `ctx` already bound. Since koax handles (yield *s) generators that are yielded or returned, each middleware can be either a function or generator and they will work as expected.

## License

MIT

[travis-image]: https://img.shields.io/travis/koaxjs/koax.svg?style=flat-square
[travis-url]: https://travis-ci.org/koaxjs/koax
[git-image]: https://img.shields.io/github/tag/koaxjs/koax.svg
[git-url]: https://github.com/koaxjs/koax
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat
[standard-url]: https://github.com/feross/standard
[npm-image]: https://img.shields.io/npm/v/koax.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koax

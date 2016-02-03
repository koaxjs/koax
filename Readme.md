
# koax

[![Build status][travis-image]][travis-url]
[![Git tag][git-image]][git-url]
[![NPM version][npm-image]][npm-url]
[![Code style][standard-image]][standard-url]

Powerful and testable control flow inspired by co, koa and redux and in pursuit of free monads.

Koax makes it easy to build a modular recursive interpreter through the use of middleware and yields. Middleware let's us build modular composable units for the interpreter. While yield is leveraged to recursively dispatch actions back through the middleware stack.

## Installation

    $ npm install koax

## Usage

```js
import koax from 'koax'

let app = koax()

app.use(function * (action, next) {
  if (action === 'fetch') return yield Promise.resolve('google')
  return next()
})

app.use(function * (action, next) {
  if (action === 'foo') return 'foo ' + (yield 'fetch')
  return 'qux'
})

app('fetch').then((res) => res) // => 'google'
app('bar').then((res) => res) // => 'qux'
app('foo').then((res) => res) // => 'foo google'

```

## API

### koax()

**Returns:** a koax app

### .use(middleware)

- `middleware` - add middleware to koax app

**Returns:** koax app

### .bind(ctx)

- `ctx` - bind koax app to a `ctx` - `ctx` can be accessed with `this` in all middleware

**Returns:** koax app

## Concepts

### middleware(action, next)

- `action` - an action that middleware can process (preferably treat as immutable)
- `next` - a function that passes execution to next middleware (can `yield` or `return`)

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

`next` is simply a function that calls the next middleware with `action` and `next` already bound. Since koax handles generators that are yielded or returned, each middleware can be either a function or generator and they will work as expected.

### yield

Yield dispatches actions to the top of the middleware stack. Koax will handle "yieldables" (as defined by co) specially, with the intent of making them feel similar co. Objects are excluded from "yieldables" in koax, because object is the primary type used for standard actions.

In addition to the standard "yieldables", koax can more generally process functors ...


### Functors
Functors implement map.

An array is a functor. A plain object is not. This is good because, we don't want koax to do anything special with plain objects. We can however, coerce plain objects into functors, letting you define custom behavior for "yieldables". Here's an example:

```js
import koax from 'koax'
import fetchW, {fetch} from '@koax/fetch'
import ObjectF from '@f/obj-functor'

let app = koax()

app.use(fetchW)

dispatch(function * () {
  yield ObjectF({
    google: fetch('google.com'),
    facebook: fetch('facebook.com')
  }) // => {google: google, facebook: facebook}
})
```

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

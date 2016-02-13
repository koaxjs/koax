
# koax

[![Build status][travis-image]][travis-url]
[![Git tag][git-image]][git-url]
[![NPM version][npm-image]][npm-url]
[![Code style][standard-image]][standard-url]

Powerful and testable control flow inspired by co, koa and redux and in pursuit of free monads.

This is my 3rd attempt at a free monad style library. The first two ([redux-gen](//github.com/joshrtay/redux-gen) and [redux-flo](github.com/redux-effects/redux-flo)) were attempts at making redux good at control flow. I really like redux middleware. Recursive dispatch and the functional nature of the middleware allowed for the creation of powerful interpreters. But ultimately, things are just easier with generator middleware.

Koax makes it easy to build complex interpreters for `yield`. You define your interpreter as a stack of middleware. Middleware looks very similar to koa middleware - receiving an action and a next function. Whenever an action is 'yielded' in either the middleware stack or in a dispatched generator, that action is reprocessed by the middleware stack. This allows you to completely customize the behavior of yield.

There are a couple ways of thinking about koax. You can think of it as **co**, with customizable "yieldables". Or you can think of it as similar to **koa** decoupled from http requests. But it's really a combination of the two. I'll add some examples to demonstrate how powerful this model is.

Koax comes with a built-in suite of middleware:

- [promise](//github.com/koaxjs/promise) - promise yielding
- [thunk](//github.com/koaxjs/thunk) - thunk yielding
- [channels](//github.com/koaxjs/channels) - csp control flow
- [timing](//github.com/koaxjs/timing) - delay and timeout
- [fork](//github.com/koaxjs/fork) - async execution

The action creators for these middleware are exposed by koax. They include: `take`, `put`, `close`, `fork`, `join`, `cancel`, `delay`, `timeout`, and `interval`.

## Installation

    $ npm install koax

## Usage

```js
import koax, {delay} from 'koax'

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

app(function * () {
  yield delay(50)
  yield 'fetch' // => 'google'
  yield delay(50)
  yield 'bar' // => 'qux'
  return 'woot'
}).then(res => res) // => 'woot'

```

## API

### koax()

**Returns:** a koax app

### .use(middleware)

- `middleware` - add middleware to koax app

**Returns:** koax app

### .bind(ctx)

- `ctx` - bind koax app to a `ctx` - `ctx` can be accessed with the third argument in all middleware

**Returns:** koax app

## Concepts

### middleware(action, next, ctx)

- `action` - an action that middleware can process (preferably treat as immutable)
- `next` - a function that passes execution to next middleware (can `yield` or `return`)
- `ctx` - global shared context for all middleware

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
import {fetch, fetchEffect} from '@koax/fetch'
import ObjectF from '@f/obj-functor'

let app = koax()

app.use(fetchEffect)

app(function * () {
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

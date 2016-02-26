
# koax

[![Build status][travis-image]][travis-url]
[![Git tag][git-image]][git-url]
[![NPM version][npm-image]][npm-url]
[![Code style][standard-image]][standard-url]

Simple, powerful and composable interpreters and apps. Inspired by co, koa, and redux.

The goal of koax is to make it easy to build large apps where effects are decoupled from application logic. This makes apps easier to test, reason about, and inspect.

There are three primary concepts in koax: `actions`, `koaxes`, and `interpreters`. Actions are typed payloads of data. Koaxes are generators that receive a single action as input and only yield effect actions. An intepreter processes effect actions.

At the outer most level, koax apps all basically have the same form, where app is a koax and the interpeter is built from a koax.

```js
interpet(app(action))
```

A koax is created by composing koax middleware.

```js
import koax from 'koax'
import fetch from '@koax/fetch'
import aws from '@koax/aws'

let effects = koax()
  .use(fetch)
  .use(aws)
  ...
```

Koax middleware looks like koa middleware, with three params: `action`, `next`, and `ctx`.

```js
function (action, next, ctx) {
  if (action.type === FETCH) {
    return fetch(action.payoad.ur, action.payload.params)
  }
  return next()
}
```

We create an interpreter by passing a koax to the interperter.

```js
import {interpreter} from 'koax'

let interpet = intepreter(effects)
```

The interpeter adds default effects middleware useful for control flow. These include:

- [promise](//github.com/koaxjs/promise) - promise yielding
- [thunk](//github.com/koaxjs/thunk) - thunk yielding
- [timing](//github.com/koaxjs/timing) - delay and timeout
- [fork](//github.com/koaxjs/fork) - async execution

The action creators for these middleware are exposed by koax. They include: `fork`, `delay`, `join`, and `cancel`.

Now we can create our app and process it using the interpreter. Remember we want our app to be a koax. We can create it using koax to compose middleware or with a simple generator

```js
function * app (evt) {
  if (evt.type === REQUEST && evt.method ==== 'generator') {
    return yield aws('DynamoDB', 'getItem', {Key: evt.payload, TableName: 'Stuff')
  } else if (evt.type === REQUEST && evt.method ==== 'set') {
    return yield aws('DynamoDB', 'setItem', {Item: evt.payload, TableName: 'Stuff'})
  }
}
```



## Installation

    $ npm install koax



## API

### koax() (default)

**Returns:** a koax app

### .use(middleware)

- `middleware` - add middleware to koax app

**Returns:** koax app

### interpreter(koax)

- `koax` - a koax interpeter stack

**Returns:** a function that interprets data passed to it. data can be an action or a koax app.

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

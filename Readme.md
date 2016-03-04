
# koax

[![Build status][travis-image]][travis-url]
[![Git tag][git-image]][git-url]
[![NPM version][npm-image]][npm-url]
[![Code style][standard-image]][standard-url]

Build apps by decoupling effects from application logic. Inspired by co, koa, redux and cycle.

The basic idea is that your `main` can `yield` effects to your interperter stack. Actions are dispatched to main by either dispatching directly or by adding drivers to the effects stack, which dispatch to main.

The basic building block of a koax app is a `koax`. A `koax` is a generator that processes actions and is composed of `koax` middleware.

At the outer most level, koax apps should basically have the same form.

```js
import {run} from 'koax'
import effects from './effects'
import main from './app'

let dispatch = run(effects, main)
```

Effects and main are composed of koax middleware.

```js
import koax from 'koax'
import {fetchEffect} from '@koax/fetch'
import {awsEffect} from '@koax/aws'

let effects = koax()
  .use(fetchEffect())
  .use(awsEffect())
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

Effects will be added to the interpreter stack, which includes default control flow middlware:

- [promise](//github.com/koaxjs/promise) - promise yielding
- [thunk](//github.com/koaxjs/thunk) - thunk yielding
- [timing](//github.com/koaxjs/timing) - delay
- [fork](//github.com/koaxjs/fork) - async execution

The action creators for these middleware are exposed by koax. They include: `fork`, `delay`, `join`, and `cancel`.

Now we can create our main and process it using the interpreter. Remember we want our app to be a koax. We can create it using koax to compose middleware or with a simple generator

```js
function * main (evt) {
  if (evt.type === REQUEST && evt.method ==== 'get') {
    return yield aws('DynamoDB', 'getItem', {Key: evt.payload, TableName: 'Stuff')
  } else if (evt.type === REQUEST && evt.method ==== 'set') {
    return yield aws('DynamoDB', 'setItem', {Item: evt.payload, TableName: 'Stuff'})
  }
}
```

Putting it all together (again)...

```js

let dispatch = run(effects, main)
dispatch({type: REQUEST, method: 'get'}).then(res => res) // results
```

## Installation

    $ npm install koax

## Router

A router example.

app.js
```js
import koax from 'koax'
import {route, request} from '@koax/route'
import {fetchEffect} from '@koax/fetch'
import {awsEffect, aws} from '@koax/aws'

import {get} from '@koax/fetch-json'


exports.effects = koax()
  .use(fetchEffect())
  .use(awsEffect())

exports.main = koax()
  .use(route('/pets.get', getPets))
  .use(route('/pets.add', addPet))

function * getPets ({params}) {
  return yield aws('DynamoDB', 'getItem', {Key: {owner: params.owner}, TableName: 'Pets'})
}

function * addPet({param}) {
  yield aws('DynamoDB', 'updateItem', {})
}

```

For an http server, we could do:

server.js
```js
import {run} from 'koax'
import {effects, main} from './app'
import {koaEffect} from '@koax/koa'

effects.use(koaEffect())

// since koaEffect is a source, requests will be dispatched to main
run(effects, main)
```

Or for a lambda function, we could simply do:

lambda.js
```js
import {run} from 'koax'
import {effects, main} from './app'

exports.handler = run(effects, main)
```

## API

### koax() (default)

**Returns:** a koax middleware stack

### .use(middleware)

- `middleware` - add middleware to koax app

**Returns:** koax app

### run(effects, main, ctx)

- `effects` - effects processing stack
- `main` - main function or generator, signature: `main(action)`
- `ctx` - ctx to pass to effects and main middleware

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

`yield` dispatches actions to the interpreter. The interpreter is composed of the default control flow middleware and the effects stack.

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

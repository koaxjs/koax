/**
 * Imports
 */

import test from 'tape'
import koax, {fork, delay, run} from '../src'
import elapsed from '@f/elapsed-time'
import driver, {BOOT} from '@koax/driver'

/**
 * Tests
 */

test('should dispatch', (t) => {
  t.plan(2)

  let app = koax()

  app.use(function * (action, next) {
    if (action === 'foo') return 'bar'
    return next()
  })

  let dispatch = run(app)

  dispatch('foo').then((res) => t.equal(res, 'bar'))
  dispatch('qux').then((res) => t.equal(res, 'qux'))
})

test('should be mountable', (t) => {
  t.plan(3)

  let root = koax()

  let child1 = koax()
  child1.use(function * (action, next) {
    if (action === 'foo') return 'bar'
    return next()
  })
  let child2 = koax()
  child2.use(function * (action, next) {
    if (action === 'qux') return 'bat'
    return next()
  })

  root.use(child1)
  root.use(child2)

  let dispatch = run(root)

  dispatch('foo').then((res) => t.equal(res, 'bar'))
  dispatch('qux').then((res) => t.equal(res, 'bat'))
  dispatch('woot').then((res) => t.equal(res, 'woot'))
})

test('should be able to access context from deeply nested middleware', (t) => {
  t.plan(3)

  let root = koax()

  let child1 = koax()
  child1.use(function * (action, next) {
    if (action === 'foo') return 'bar'
    return next()
  })
  let child2 = koax()
  child2.use(function * (action, next, ctx) {
    if (action === 'qux') return 'bat' + ctx.fetched
    return next()
  })
  child1.use(child2)
  root.use(child1)

  let dispatch = run(root, {fetched: 'google'})

  dispatch('foo').then((res) => t.equal(res, 'bar'))
  dispatch('qux').then((res) => t.equal(res, 'batgoogle'))
  dispatch('woot').then((res) => t.equal(res, 'woot'))
})

test('should reolve yielded promise', (t) => {
  t.plan(2)

  let app = koax()
  app.use(function * (action, next) {
    if (action === 'foo') return yield Promise.resolve('bar')
    return 'qux'
  })

  app = run(app)

  app('foo').then(function (res) {
    t.equal(res, 'bar')
  })

  app('bar').then(function (res) {
    t.equal(res, 'qux')
  })
})

test('should resolve yielded action promise', (t) => {
  t.plan(3)

  let app = koax()
  app.use(function * (action, next) {
    if (action === 'fetch') return yield Promise.resolve('google')
    return next()
  })
  app.use(function * (action, next) {
    if (action === 'foo') return 'foo ' + (yield 'fetch')
    return 'qux'
  })

  app = run(app)

  app('foo').then(function (res) {
    t.equal(res, 'foo google')
  })

  app('fetch').then(function (res) {
    t.equal(res, 'google')
  })

  app('bar').then(function (res) {
    t.equal(res, 'qux')
  })
})

test('should resolve yielded action thunk', (t) => {
  t.plan(3)

  let app = koax()
  app.use(function * (action, next) {
    if (action === 'fetch') return yield thunk
    return next()
  })
  app.use(function * (action, next) {
    if (action === 'foo') return 'foo ' + (yield 'fetch')
    return 'qux'
  })

  app = run(app)

  function thunk (cb) {
    cb(null, 'google')
  }

  app('foo').then(function (res) {
    t.equal(res, 'foo google')
  })

  app('fetch').then(function (res) {
    t.equal(res, 'google')
  })

  app('bar').then(function (res) {
    t.equal(res, 'qux')
  })
})

test('should have fork support', (t) => {
  t.plan(3)

  let finished = false

  let app = run(koax())

  app(function * () {
    yield fork(getBar)
    return 'woot'
  }).then(function (val) {
    t.equal(val, 'woot')
    finished = true
  }).catch(function (err) {
    console.log('err', err)
  })

  function * getBar () {
    let res = yield new Promise(function (resolve) {
      setTimeout(function () {
        resolve('foo')
      }, 5)
    })
    t.equal(res, 'foo')
    t.equal(finished, true)
    return 'bar'
  }
})

test('should have delay support', (t) => {
  let dispatch = run(koax())
  let time = elapsed()
  time()
  dispatch(function * () {
    yield delay(50)
  }).then(function () {
    t.ok(time() >= 50)
    t.end()
  })
})

test('should run dispatched actions through main', (t) => {
  t.plan(2)

  let dispatch = run(koax(), function * main (action) {
    yield delay(100)
    if (action.type === 'woot')
      return 'foo'
    else
      return 'bar'
  })

  dispatch({type: 'woot'}).then(val => t.equal('foo', val))
  dispatch({type: 'what'}).then(val => t.equal('bar', val))
})

test('should run pushed actions through main', (t) => {
  t.plan(2)

  let {drive, push} = driver()

  let effects = koax()
    .use(function (action, next) {
      if (action.type === BOOT) {
        return drive(function (val) {
          return {type: 'PUSH', payload: val}
        })
      }
      return next()
    })

  let dispatch = run(effects, function * main (action) {
    yield delay(100)
    if (action.type === 'PUSH')
      return 'foo ' + action.payload
    else
      return 'bar'
  })

  push(1).then(val => t.equal('foo 1', val))
  dispatch({type: 'what'}).then(val => t.equal('bar', val))
})

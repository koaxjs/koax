/**
 * Imports
 */

import test from 'tape'
import koax, {take, put, fork, join, delay} from '../src'
import elapsed from '@f/elapsed-time'

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

  app('foo').then((res) => t.equal(res, 'bar'))
  app('qux').then((res) => t.equal(res, 'qux'))

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

  root('foo').then((res) => t.equal(res, 'bar'))
  root('qux').then((res) => t.equal(res, 'bat'))
  root('woot').then((res) => t.equal(res, 'woot'))
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

  root.bind({fetched: 'google'})

  root('foo').then((res) => t.equal(res, 'bar'))
  root('qux').then((res) => t.equal(res, 'batgoogle'))
  root('woot').then((res) => t.equal(res, 'woot'))
})


test('should reolve yielded promise', (t) => {
  t.plan(2)

  let app = koax()
  app.use(function * (action, next) {
    if (action === 'foo') return yield Promise.resolve('bar')
    return 'qux'
  })

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

  function thunk(cb) {
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

test('should have channles support', (t) => {
  t.plan(1)

  let app = koax()

  app(function * () {
    let res = yield take('ch')
    t.equal(res, 42)
  })

  app(function * () {
    yield put('ch', 42)
  })
})

test('should have fork support', (t) => {
  t.plan(3)

  let finished = false

  let app = koax()

  app(function * () {
    yield fork(getBar)
    return 'woot'
  }).then(function (val) {
    t.equal(val, 'woot')
    finished = true
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
  let dispatch = koax()
  let time = elapsed()
  time()
  dispatch(function * () {
    yield delay(50)
  }).then(function () {
    t.ok(time() > 50)
    t.end()
  })
})

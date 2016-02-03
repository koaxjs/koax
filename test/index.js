/**
 * Imports
 */

import test from 'tape'
import koax from '../src'

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

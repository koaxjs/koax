/**
 * Imports
 */

import test from 'tape'
import koax from '../src'

/**
 * Tests
 */

test('should handle action', (t) => {
  t.plan(3)
  let dispatch = koax([
    function (action, next) {
      if (action === 'foo') return 'bar'
      if (action === 'qux') return next()
    }
  ])

  dispatch('foo').then(function (res) {
    t.equal(res, 'bar')
  })

  dispatch('qux').then(function (res) {
    t.equal(res, 'qux')
  })

  dispatch('woot').then(function (res) {
    t.equal(res, undefined)
  })
})

test('should dispatch yielded action', (t) => {
  t.plan(3)
  let dispatch = koax([
    function * (action, next) {
      if (action === 'foo') return 'foo ' + (yield 'bar')
      if (action === 'bar') return 'qux'
      else return 'woot'
    }
  ])

  dispatch('bar').then(function (res) {
    t.equal(res, 'qux')
  })

  dispatch('zoot').then(function (res) {
    t.equal(res, 'woot')
  })

  dispatch('foo').then(function (res) {
    t.equal('foo qux', res)
  })
})

test('should reolve yielded promise', (t) => {
  t.plan(2)
  let dispatch = koax([
    function * (action, next) {
      if (action === 'foo') return yield Promise.resolve('bar')
      return 'qux'
    }
  ])

  dispatch('foo').then(function (res) {
    t.equal(res, 'bar')
  })

  dispatch('bar').then(function (res) {
    t.equal(res, 'qux')
  })
})

test('should resolve yielded action promise', (t) => {
  t.plan(3)
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

  dispatch('foo').then(function (res) {
    t.equal(res, 'foo google')
  })

  dispatch('fetch').then(function (res) {
    t.equal(res, 'google')
  })

  dispatch('bar').then(function (res) {
    t.equal(res, 'qux')
  })
})

test('should resolve array of action promisises', (t) => {
  t.plan(3)
  let dispatch = koax([
    function * (action, next) {
      if (action === 'fetch') return yield Promise.resolve('google')
      return next()
    },
    function * (action, next) {
      if (action === 'post') return yield Promise.resolve('updated')
      return next()
    },
    function * (action, next) {
      if (action === 'foo') return yield ['fetch', 'post']
      return 'qux'
    }
  ])

  dispatch('foo').then(function (res) {
    t.deepEqual(res, ['google', 'updated'])
  })

  dispatch('fetch').then(function (res) {
    t.equal(res, 'google')
  })

  dispatch('post').then(function (res) {
    t.equal(res, 'updated')
  })
})

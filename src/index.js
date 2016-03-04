/**
 * Imports
 */

import middleware from '@f/middleware'
import compose from '@f/compose'
import identity from '@f/identity'
import isObject from '@f/is-object'
import koaxRun from '@koax/run'
import koaxCompose from '@koax/compose'
import promise from '@koax/promise'
import thunk from '@koax/thunk'
import {forkEffect, fork, join, cancel} from '@koax/fork'
import {timingEffect, delay} from '@koax/timing'
import {boot, NEXT} from '@koax/driver'

/**
 * Create a koax app
 * @return {Function}
 */

let koax = () => middleware(koaxCompose)

/**
 * Create an interpter
 * @param {Function} kx a koax stack
 * @param {Object} ctx a gloabl context
 * @return {Function} an interpreter
 */

let run = (effects, main, ctx) => {
  if (isObject(main)) {
    ctx = main
    main = null
  }

  main = main || identity
  ctx = ctx || {}

  let interpreter = middleware(koaxRun(ctx))

  interpreter.use(promise)
    .use(thunk)
    .use(timingEffect)
    .use(forkEffect(interpreter))

  if (effects) {
    interpreter.use(effects)
  }

  let dispatch = compose(interpreter, main)
  interpreter.use(function (action, next) {
    if (action.type === NEXT) {
      return dispatch(action.payload)
    }
    return next()
  })
  interpreter(boot(ctx))
  return dispatch
}

/**
 * Exports
 */

export default koax
export {run, fork, join, delay, cancel}

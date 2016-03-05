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

  ctx = ctx || {}

  let interpreter = middleware(koaxRun(ctx))

  interpreter.use(promise)
    .use(thunk)
    .use(timingEffect)
    .use(forkEffect(interpreter))

  if (effects) {
    interpreter.use(effects)
  }

  if (!main) {
    return interpreter
  } else {
    return compose(interpreter, main)
  }
}

/**
 * Exports
 */

export default koax
export {run, fork, join, delay, cancel}

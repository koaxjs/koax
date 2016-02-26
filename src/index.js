/**
 * Imports
 */

import run from '@koax/run'
import compose from '@koax/compose'
import promise from '@koax/promise'
import thunk from '@koax/thunk'
import {forkEffect, fork, join, cancel} from '@koax/fork'
import {timingEffect, delay} from '@koax/timing'
import {boot} from '@koax/boot'
import middleware from '@f/middleware'


/**
 * Create a koax app
 * @return {Function}
 */

let koax = () => middleware(compose)

/**
 * Create an interpter
 * @param {Function} kx a koax stack
 * @param {Object} ctx a gloabl context
 * @return {Function} an interpreter
 */

let interpreter = (kx, ctx) => {
  let i = middleware(run(ctx))

  i.use(promise)
    .use(thunk)
    .use(timingEffect)
    .use(forkEffect(i))
    .use(kx)

  let booted = false
  return function (action, next) {
    if (!booted) {
      booted = true
      i(boot())
    }
    return i(action, next)
  }
}

/**
 * Exports
 */

export default koax
export {interpreter, fork, join, delay, cancel}

/**
 * Imports
 */

import run from '@koax/run'
import defaults from '@koax/default'
import compose from '@koax/compose'
import {taskRunner} from '@koax/fork'
import middleware from '@f/middleware'

/**
 * ware
 */

function koax () {
  let app  = middleware(maybeBind)

  // use bind instead of maybeBind for middleware composition
  app.bind = function (ctx) {
    return app.replace(finalize(ctx))
  }

  return app

  // bind if root koax, otherwise compose
  function maybeBind (mw) {
    let composed
    return function (action, next, ctx) {
      if (!composed) {
        if (!ctx) {
          composed = finalize(ctx)(mw)
        } else {
          composed = compose(mw)
        }
      }
      return composed(action, next, ctx)
    }
  }
}


let finalize = ctx => middleware => {
  ctx = ctx || {}
  middleware.unshift(defaults)
  return run(middleware, ctx)
}



/**
 * Exports
 */

export default koax

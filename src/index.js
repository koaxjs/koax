/**
 * Imports
 */

import bind from '@koax/bind'
import compose from '@koax/compose'
import middleware from '@f/middleware'

/**
 * ware
 */

function koax () {
  let app  = middleware(maybeBind)

  // use bind instead of maybeBind for middleware composition
  app.bind = function (ctx) {
    return app.replace(bind(ctx))
  }

  return app

  // bind if root koax, otherwise compose
  function maybeBind (middleware) {
    let composed
    return function (action, next, ctx) {
      if (!composed) {
        if (!ctx) {
          composed = bind(ctx)(middleware)
        } else {
          composed = compose(middleware)
        }
      }
      return composed(action, next, ctx)
    }
  }
}



/**
 * Exports
 */

export default koax

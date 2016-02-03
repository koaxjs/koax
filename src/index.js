/**
 * Imports
 */

import bind from '@koax/bind'
import compose from '@koax/compose'
import middleware from '@f/middleware'
import isGlobal from '@f/is-global'

/**
 * ware
 */

function koax () {
  let app  = middleware(maybeBind)

  // use bind instead of maybeBind for middleware composition
  app.bind = function (ctx) {
    return app.replace(bind.bind(null, ctx))
  }

  return app

  // bind if root koax, otherwise compose
  function maybeBind (middleware) {
    let composed
    return function (action, next) {
      if (!composed) {
        if (isGlobal(this)) {
          composed = bind(middleware)
        } else {
          composed = compose(middleware)
        }
      }
      return composed.call(this, action, next)
    }
  }
}



/**
 * Exports
 */

export default koax

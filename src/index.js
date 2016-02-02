/**
 * Imports
 */

import compose from 'koax-compose'
import toPromise from '@f/to-promise'
import map from '@f/map'
import isIterator from '@f/is-iterator'
import isGenerator from '@f/is-generator'
import isPromise from '@f/is-promise'
import isFunctor from '@f/is-functor'
import isFunction from '@f/is-function'

/**
 * koax
 */

function koax (middleware) {
  let composed = compose(middleware)
  return dispatch

  function dispatch (action) {
    if (isFunctor(action) || isGenerator(action) || isIterator(action)) {
      return toPromise(map(dispatch, action))
    } else if (isPromise(action) || isFunction(action)) {
      return toPromise(action)
    } else {
      return dispatch(composed(action))
    }
  }
}

/**
 * Exports
 */

export default koax

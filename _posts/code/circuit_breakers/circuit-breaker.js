const CLOSED = Symbol('CLOSED')
const OPEN = Symbol('OPEN')
const HALF_OPEN = Symbol('HALF_OPEN')

const MSG = 'Functionality disabled due to previous errors.'

module.exports = (asyncFn, gracePeriodMs = 3000, threshold = 1, message = MSG) => {
  let state = CLOSED
  let failures = 0
  let openedAt

  function handleSuccess(value) {
    if(state !== CLOSED) {
      state = CLOSED
      failures = 0
    }
    return value
  }
  
  function handleFailure(error) {
    if(state === HALF_OPEN || state === CLOSED) {
      failures += 1
      if(failures >= threshold) {
        state = OPEN
        openedAt = Date.now()
      }
    }
    throw error
  }
  
  function tryReset() {
    if(state === OPEN && openedAt && Date.now() - openedAt > gracePeriodMs) {
      state = HALF_OPEN
      return true
    }
  }
  
  return function () {
    if(state === CLOSED || state === HALF_OPEN || tryReset()) {
      return asyncFn.apply(asyncFn.this, arguments).then(handleSuccess, handleFailure)
    } else {
      return Promise.reject(new Error(message))
    }
  }
}
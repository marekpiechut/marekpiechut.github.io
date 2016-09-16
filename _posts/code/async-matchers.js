module.exports = {
  equal: (expected) => (actual) => expect(actual).toEqual(expected),
  
  fail: fail
}
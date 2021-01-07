export function makeRandomString () {
  return new Date().getTime().toString(16) + Math.floor(65536 * Math.random()).toString(16)
}

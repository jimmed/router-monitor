module.exports = function wrapError (message, error) {
  error.message = `${message}: ${error.message}`

  return error
}

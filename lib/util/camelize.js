module.exports = function camelize(str) {
  return str.trim()
    .replace(/^[a-z]+/i, start => start.toLowerCase())
    .replace(/\s+([a-z]+)/gi, (_, word) =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
}

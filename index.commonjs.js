exports.download = require('./commonjs/download').default
exports.generate = require('./commonjs/generate').default
exports.minify = require('./commonjs/minify').default
exports.version = require('./commonjs/version').default
// Deprecated export: `compress` (now called `minify`).
exports.compress = require('./commonjs/minify').default

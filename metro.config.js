const { getDefaultConfig } = require('expo/metro-config');

// The "@" alias is resolved by babel-plugin-module-resolver (babel.config.js)
// and by tsconfig paths for type checking. Metro has no `resolver.alias` option.
module.exports = getDefaultConfig(__dirname);

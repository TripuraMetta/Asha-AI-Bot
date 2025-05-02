const webpack = require('webpack');

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    url: require.resolve('url'),
    util: require.resolve('util'),
    crypto: require.resolve('crypto-browserify'),
    os: require.resolve('os-browserify/browser'),
    path: require.resolve('path-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
    vm: require.resolve('vm-browserify'),
    net: false,
    tls: false,
    fs: false,
    dns: false,
    process: require.resolve('process/browser.js'), // Explicit .js
  });
  config.resolve.fallback = fallback;
  config.resolve.extensions = [...config.resolve.extensions, '.js']; // Ensure .js is included
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser.js', // Explicit .js
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ]);
  return config;
};
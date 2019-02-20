const { resolve } = require('path');

module.exports = {
  entry: {
    'request-reply-directlinejs': './lib/index.js'
  },
  mode: 'production',
  output: {
    filename: '[name].js',
    libraryTarget: 'umd',
    path: resolve(__dirname, 'dist')
  }
};

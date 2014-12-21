var path = require('path');

module.exports = {
  entry: './src/conway',
  output: {
    path: path.join(__dirname, 'build')
  },
  module: {
    loaders: [
      {test: /\.styl$/, loader: 'style!css!autoprefixer!stylus'},
      {test: /\.js$/, loader: 'jsx?harmony&es5&stripTypes'},
      {test: /\.cells$/, loaders: ['json', require.resolve('./src/cells-loader.js')]}
    ]
  }
};

var path = require('path');

module.exports = {
  entry: './src/conway.jsx',
  output: {
    path: path.join(__dirname, 'build')
  },
  module: {
    loaders: [
      {test: /\.styl$/, loader: 'style!css!autoprefixer!stylus'},
      {test: /\.jsx$/, loader: 'jsx?harmony&es5&stripTypes'},
      {test: /\.cells$/, loaders: ['json', require.resolve('./src/cells-loader.js')]}
    ]
  }
};

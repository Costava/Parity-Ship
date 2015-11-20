var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: './src/scripts/main.js',
  output: {
    path: path.join(__dirname, 'dist/scripts'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      },
    ]
  }
};

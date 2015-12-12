// Thank you to James K Nelson for his helpful resources
//  http://jamesknelson.com/using-es6-in-the-browser-with-babel-6-and-webpack/
//  https://github.com/jamesknelson/webpack-black-triangle

var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: './src/scripts/main',
  output: {
    path: path.join(__dirname, 'dist/scripts'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: path.join(__dirname, 'src'),
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};

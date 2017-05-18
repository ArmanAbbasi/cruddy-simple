'use strict';

const path = require('path');

const webpackConfig = {
  entry: [path.join(__dirname, 'src/ui/index.jsx')],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
};

module.exports = webpackConfig;

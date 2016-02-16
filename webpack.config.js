module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index.js',
    libraryTarget: 'umd',
    library: 'ReactVideoJS',
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel-loader'},
      {test: /\.json$/, loader: 'json-loader'}
    ]
  },
  externals: {
    'react': 'react',
    'react-dom': 'react'
  },
  devtool: "source-map"
};

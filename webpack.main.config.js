const path = require('path');

module.exports = {
  entry: './src/main/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.node']
  },
  externals: {
    'better-sqlite3': 'commonjs2 better-sqlite3'
  }
};

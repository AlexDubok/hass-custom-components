/* eslint-disable */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: {
    sprinkle: './src/sprinkle.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: {
      name: 'Sprinkle',
      type: 'umd',
      export: ['SprinkleCard', 'MoreInfoSprinkle'],
    },
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
  },
  plugins: [
   ...(isProduction ? [] : [
      new HtmlWebpackPlugin({
        template: './src/index.html',
      })
    ])
  ],
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  optimization: {
    minimize: isProduction,
  },
  devServer: {
    static: './dist',
    port: 3000,
    open: true,
    hot: true,
  },
};

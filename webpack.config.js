//HTML
const HtmlWebpackPlugin = require('html-webpack-plugin');

//CSS
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const path = require('path');

const basePath = __dirname;
const distPath = 'dist';

module.exports = {
  //* Entry point
  entry: {
    app: './src/index.ts'
  },
  //* Output point
  output: {
    path: path.join(basePath, distPath),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "sass-loader",
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      scriptLoading: 'blocking',
      template: 'src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css'
    })
  ],
  resolve: {
    //* Order resolution
    extensions: [ '.ts', '.js' ]
  },
  watch: true
};
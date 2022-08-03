'use strict'

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Webpack = require('webpack')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// Bundler support for the Vuejs is added
// but for now, this monorepo template is not supporting Vuejs
// I shall be adding that in near future
const { VueLoaderPlugin } = require('vue-loader')

// Note: Manifest is not added for the generated build as this is only a library

/*
 * function to fetch the basic config for the webpack bundling
 *
 * Args:
 * infile     - the entry file for bundling
 * outfile    - the file to which the bundled code is dumped
 * globalName - this is a name which will be used when library is used via <script>.
 *              once set, this library can be used as Wibdow.<globalName>
 *
 * Returns: basic Webpack config (production)
 */
function webpackBaseConfig (infile, outfile, globalName) {
  return {
    mode: 'production',
    entry: {
      main: infile, // should be mentioned by the consumer of this module
    },
    output: {
      filename: outfile, // should be mentioned by the consumer of this module
      clean: true,
      library: {
        type: 'umd',
        name: globalName, // should be mentioned by the consumer of this module
      },
    },
    resolve: {
      extensions: ['*', '.js', '.jsx', '.vue'],
    },
    devtool: false, // this is set for the prod consideration.
    // loaders
    module: {
      rules: [
        // css
        {
          test: /\.(scss|css)$/i,
          // if in case, we are planning to use sass,
          // add the needed packages and update webpack as well
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        },
        // images
        {
          test: /\.(svg|ico|png|webp|gif|jpe?g)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/img/[name].[contenthash:8][ext]',
          },
        },
        // js for babel
        {
          test: /\.jsx?$/,
          // exclude node_modules & the test files & directories
          exclude: /node_modules|cypress|.*\.test\.jsx?$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.vue$/,
          use: {
            loader: 'vue-loader',
          },
        },
        // font files if in case we use any
        // create a resource
        {
          test: /\.(eot|ttf|woff2?)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/fonts/[name][contenthash:8][ext]',
          },
        },
      ],
    },
    // plugins
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      }),
      // plugin for Vue-loader for vue component
      new VueLoaderPlugin(),
      new Webpack.IgnorePlugin({
        // moment.js bundles large locale files by default
        // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
        // moment.js will be used for any datetime manipulate
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
      new CleanWebpackPlugin({
        // This plugin will automatically be disabled if the `output.path` is not set
        // As this is a default config for library, `output.path` wont be set
        verbose: true,
        cleanOnceBeforeBuildPatterns: ['**/*', '!stats.json'],
      }),
    ],
    performance: { // performance threshold
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
      hints: false,
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          extractComments: false,
        }),
        new CssMinimizerPlugin({
          parallel: true,
        }),
      ],
    },
  }
}

module.exports = webpackBaseConfig

/**
 * Build config for electron renderer process
 */
import baseConfig from './webpack.base'

import webpack from 'webpack'
import merge from 'webpack-merge'
import path from 'path'

import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import TerserPlugin from 'terser-webpack-plugin'
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv'

const env = 'production'
CheckNodeEnv(env)
console.log('NODE_ENV - Renderer: ' + env)

const ROOT_DIR = path.join(__dirname, '..')
const APP_DIR = path.join(ROOT_DIR, 'app')
const DIST_DIR = path.join(APP_DIR, 'dist')

export default merge.smart(baseConfig, {
  mode: env,
  devtool: 'source-map',
  entry: path.join(APP_DIR, 'index'),
  output: {
    path: DIST_DIR,
    publicPath: './dist/',
    filename: 'renderer.prod.js'
  },
  plugins: [
    /**
     * Create global constants which can be configured at compile time.
     * Useful for allowing different behaviour between development builds and release builds
     * NODE_ENV should be production so that modules do not perform certain development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: env
    }),
    new MiniCssExtractPlugin({
      filename: 'style.css'
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    })
  ],
  optimization: {
    minimizer: process.env.E2E_BUILD
      ? []
      : [
        new TerserPlugin({
          parallel: true,
          sourceMap: true,
          cache: true
        }),
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            map: {
              inline: false,
              annotation: true
            }
          }
        })
      ]
  },
  target: 'electron-renderer',
  module: {
    rules: [
      // Extract all .global.css to style.css as is
      {
        test: /\.global\.(c|le)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './'
            }
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          'less-loader'
        ]
      },
      // Pipe other styles through css modules and append to style.css
      {
        test: /^((?!\.global).)*\.(c|le)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]__[local]__[hash:base64:5]',
              sourceMap: true
            }
          },
          'less-loader'
        ]
      },
      // WOFF Font
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff'
          }
        }
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff'
          }
        }
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/octet-stream'
          }
        }
      },
      // EOT Font
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader'
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml'
          }
        }
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: 'url-loader'
      }
    ]
  }
})

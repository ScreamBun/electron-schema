/**
 * Build config for electron renderer process
 */
import webpack from 'webpack';
import merge from 'webpack-merge';
import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import TerserPlugin from 'terser-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';
import DeleteSourceMaps from '../internals/scripts/DeleteSourceMaps';

import baseConfig from './webpack.config.base';

const env = 'production';
CheckNodeEnv(env);
DeleteSourceMaps();

const ROOT_DIR = path.join(__dirname, '..');
const APP_DIR = path.join(ROOT_DIR, 'app');
const DIST_DIR = path.join(APP_DIR, 'dist', 'renderer');

export default merge.smart(baseConfig, {
  mode: env,
  devtool: process.env.DEBUG_PROD === 'true' ? 'source-map' : 'none',
  entry: path.join(APP_DIR, 'index'),
  output: {
    path: DIST_DIR,
    filename: 'renderer.prod.js'
  },
  plugins: [
    /**
     * Create global constants which can be configured at compile time
     * Useful for allowing different behaviour between development builds and release builds
     * NODE_ENV should be production so that modules do not perform certain development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: env,
      DEBUG_PROD: false
    }),
    new MiniCssExtractPlugin({
      filename: 'css/styles.css'
    }),
    new CopyWebpackPlugin([
      {
        // Theme Assets
        from: path.join(APP_DIR, 'resources', 'assets'),
        to: path.join(DIST_DIR, 'assets'),
        toType: 'dir'
      }
    ]),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    }),
    new CleanWebpackPlugin({
      dry: false
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        terserOptions: {
          output: {
            comments: false
          }
        }
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
  target: 'electron-preload',
  module: {
    rules: [
      {
        test: /\.(c|le)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false
            }
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                strictMath: true
              }
            }
          }
        ]
      },
      { // WOFF Font
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10 * 1024,
            mimetype: 'application/font-woff',
            fallback: {
              loader: 'file-loader',
              options: {
                name: 'fonts/[name].[ext]'
              }
            }
          }
        }
      },
      { // WOFF2 Font
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10 * 1024,
            mimetype: 'application/font-woff',
            fallback: {
              loader: 'file-loader',
              options: {
                name: 'fonts/[name].[ext]'
              }
            }
          }
        }
      },
      { // TTF Font
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10 * 1024,
            mimetype: 'application/octet-stream',
            fallback: {
              loader: 'file-loader',
              options: {
                name: 'fonts/[name].[ext]'
              }
            }
          }
        }
      },
      { // EOT Font
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[ext]'
          }
        }
      },
      { // SVG Font
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10 * 1024,
            mimetype: 'image/svg+xml',
            name: 'fonts/[name].[ext]'
          }
        }
      },
      { // Common Image Formats
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10 * 1024,
            fallback: {
              loader: 'file-loader',
              options: {
                name: 'img/[name].[ext]'
              }
            }
          }
        }
      }
    ]
  }
});

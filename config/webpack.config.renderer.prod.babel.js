/**
 * Build config for electron renderer process
 */
import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import merge from 'webpack-merge';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';
import DeleteSourceMaps from '../internals/scripts/DeleteSourceMaps';

import baseConfig from './webpack.config.base.renderer';

const NODE_ENV = 'production';
CheckNodeEnv(NODE_ENV);
DeleteSourceMaps();

const ROOT_DIR = path.join(__dirname, '..');
const APP_DIR = path.join(ROOT_DIR, 'app');
const DIST_DIR = path.join(APP_DIR, 'dist');

const minimizer = [];
if (!process.env.E2E_BUILD) {
  minimizer.push(
    new TerserPlugin({
      cache: true,
      parallel: true,
      sourceMap: true,
      terserOptions: {
        output: {
          comments: false
        }
      }
    })
  );
  minimizer.push(
    new OptimizeCSSAssetsPlugin({
      cssProcessorOptions: {
        map: {
          annotation: true,
          inline: false
        }
      }
    })
  );
}

const cssLoader = [
  {
    loader: MiniCssExtractPlugin.loader,
    options: {
      publicPath: './'
    }
  },
  {
    loader: 'css-loader',
    options: {
      importLoaders: 1,
      sourceMap: true
    }
  }
];

export default merge.smart(baseConfig, {
  mode: NODE_ENV,
  devtool: process.env.DEBUG_PROD === 'true' ? 'source-map' : 'none',
  plugins: [
    /**
     * Create global constants which can be configured at compile time
     * Useful for allowing different behavior between development builds and release builds
     * NODE_ENV should be production so that modules do not perform certain development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV
    }),
    new MiniCssExtractPlugin({
      filename: 'css/styles.css'
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    })
  ],
  optimization: {
    minimizer
  },
  target: 'electron-preload',
  module: {
    rules: [
      {  // Styles support - CSS
        test: /\.css$/,
        use: cssLoader
      },
      {  // LESS support - compile all .less files and pipe it to style.css
        test: /\.less$/,
        use: [
          ...cssLoader,
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                relativeUrls: true,
                sourceMap: true,
                strictMath: true
              }
            }
          }
        ]
      },
      {  // SASS support - compile all .sass/.scss files and pipe it to style.css
        test: /\.(scss|sass)$/,
        use: [
          ...cssLoader,
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  }
});

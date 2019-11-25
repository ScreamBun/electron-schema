/* eslint global-require: off, import/no-dynamic-require: off */

/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement
 *
 * https://webpack.js.org/concepts/hot-module-replacement/
 */
import baseConfig from './webpack.base'

import webpack from 'webpack'
import merge from 'webpack-merge'
import path from 'path'

import fs from 'fs'
import chalk from 'chalk'
import { spawn, execSync } from 'child_process'
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv'

const env = 'development'
CheckNodeEnv(env)
console.log('NODE_ENV - Renderer: ' + env)

const ROOT_DIR = path.join(__dirname, '..')
const APP_DIR = path.join(ROOT_DIR, 'app')
const DLL_DIR = path.join(ROOT_DIR, 'dll')
const DIST_DIR = path.join(APP_DIR, 'dist')

const port = process.env.PORT || 1212
const publicPath = `http://localhost:${port}/dist`
const manifest = path.resolve(DLL_DIR, 'renderer.json')
const requiredByDLLConfig = module.parent.filename.includes('webpack.config.renderer.dev.dll')

/**
 * Warn if the DLL is not built
 */
if (!requiredByDLLConfig && !(fs.existsSync(DLL_DIR) && fs.existsSync(manifest))) {
  console.log(
    chalk.black.bgYellow.bold('The DLL files are missing. Sit back while we build them for you with "yarn build-dll"')
  );
  execSync('yarn build-dll');
}

export default merge.smart(baseConfig, {
  mode: env,
  devtool: 'inline-source-map',
  entry: [
    ...(process.env.PLAIN_HMR ? [] : ['react-hot-loader/patch']),
    `webpack-dev-server/client?http://localhost:${port}/`,
    'webpack/hot/only-dev-server',
    require.resolve('../app/index')
  ],
  output: {
    publicPath: `http://localhost:${port}/dist/`,
    filename: 'renderer.dev.js'
  },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom'
    }
  },
  plugins: [
    requiredByDLLConfig
      ? null
      : new webpack.DllReferencePlugin({
        context: DLL_DIR,
        manifest: require(manifest),
        sourceType: 'var'
      }),
    new webpack.HotModuleReplacementPlugin({
      multiStep: true
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    /**
     * Create global constants which can be configured at compile time.
     * Useful for allowing different behaviour between development builds and release builds
     * NODE_ENV should be production so that modules do not perform certain development checks
     * By default, use 'development' as NODE_ENV. This can be overriden with
     * 'staging', for example, by changing the ENV variables in the npm scripts
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: env
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true
    })
  ],
  devServer: {
    port,
    publicPath,
    compress: true,
    noInfo: true,
    stats: 'errors-only',
    inline: true,
    lazy: false,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    contentBase: DIST_DIR,
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/,
      poll: 100
    },
    historyApiFallback: {
      verbose: true,
      disableDotRule: false
    },
    before() {
      if (process.env.START_HOT) {
        console.log('Starting Main Process...');
        spawn('npm', ['run', 'start-main-dev'], {
          shell: true,
          env: process.env,
          stdio: 'inherit'
        })
          .on('close', code => process.exit(code))
          .on('error', spawnError => console.error(spawnError));
      }
    }
  },
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.global\.(c|le)ss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'less-loader'
          }
        ]
      },
      {
        test: /^((?!\.global).)*\.(c|le)ss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
              localIdentName: '[name]__[local]__[hash:base64:5]'
            }
          },
          {
            loader: 'less-loader'
          }
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
  },
  node: {
    __dirname: false,
    __filename: false
  }
})

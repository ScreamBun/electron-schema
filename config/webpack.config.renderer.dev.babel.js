/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement - https://webpack.js.org/concepts/hot-module-replacement/
 */
import chalk from 'chalk';
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { TypedCssModulesPlugin } from 'typed-css-modules-webpack-plugin';
import webpack from 'webpack';
import merge from 'webpack-merge';

import Loaders from './webpack.loaders';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

import baseConfig from './webpack.config.base';

const NODE_ENV = 'development';

// When an ESLint server is running, we can't set the NODE_ENV so we'll check if it's
// at the dev webpack config is not accidentally run in a production environment
if (process.env.NODE_ENV === 'production') {
  CheckNodeEnv(NODE_ENV);
}

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(__dirname, 'dist');
const DLL_DIR = path.join(ROOT_DIR, 'dll');

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/dist`;
const manifest = path.resolve(DLL_DIR, 'renderer.json');
const requiredByDLLConfig = module.parent.filename.includes('webpack.config.renderer.dev.dll');

/**
 * Warn if the DLL is not built
 */
if (!requiredByDLLConfig && !(fs.existsSync(DLL_DIR) && fs.existsSync(manifest))) {
  const msg = 'The DLL files are missing. Sit back while we build them for you with "yarn build-dll"';
  console.log(chalk.black.bgYellow.bold(msg));
  execSync('yarn build-dll');
}

export default merge.smart(baseConfig, {
  mode: NODE_ENV,
  devtool: 'inline-source-map',
  entry: [
    ...(process.env.PLAIN_HMR ? [] : ['react-hot-loader/patch']),
    `webpack-dev-server/client?http://localhost:${port}/`,
    'webpack/hot/only-dev-server',
    require.resolve('../app/index.js')
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
    /**
     * Create global constants which can be configured at compile time
     * Useful for allowing different behaviour between development builds and release builds
     * NODE_ENV should be production so that modules do not perform certain development checks
     * By default, use 'development' as NODE_ENV. This can be overriden with
     * 'staging', for example, by changing the ENV variables in the npm scripts
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV
    }),
    requiredByDLLConfig ? null : new webpack.DllReferencePlugin({
      context: DLL_DIR,
      manifest: require(manifest),
      sourceType: 'var'
    }),
    new webpack.HotModuleReplacementPlugin({
      multiStep: true
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: true
    }),
    new TypedCssModulesPlugin({
      globPattern: 'app/**/*.{css,scss,sass}'
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
        test: /\.css$/,
        use: [
          'style-loader',
          Loaders.css,
        ]
      },
      {  // LESS support - compile all .less files and pipe it to style.css
        test: /\.less$/,
        use: [
          'style-loader',
          Loaders.css,
          Loaders.less
        ]
      },
      {  // SASS support - compile all .scss/sass files and pipe it to style.css
        test: /\.s[ac]ss$/,
        use: [
          'style-loader',
          Loaders.css,
          {
            loader: 'sass-loader'
          }
        ]
      },
      {  // WOFF Font
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: merge.smart(Loaders.url, {
          options: {
            mimetype: 'application/font-woff'
          }
        })
      },
      {  // WOFF2 Font
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: merge.smart(Loaders.url, {
          options: {
            mimetype: 'application/font-woff'
          }
        })
      },
      {  // TTF Font
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: merge.smart(Loaders.url, {
          options: {
            mimetype: 'application/octet-stream'
          }
        })
      },
      {  // EOT Font
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader'
      },
      { // SVG
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'svg-url-loader',
        options: {
          limit: 10 * 1024,
          noquotes: true,
          fallback: Loaders.file
        }
      },
      {  // Common Image Formats
        test: /\.(?:bmp|ico|gif|png|jpe?g|tiff|webp)$/,
        use: Loaders.url
      }
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  }
});

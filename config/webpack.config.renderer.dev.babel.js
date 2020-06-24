/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement - https://webpack.js.org/concepts/hot-module-replacement/
 */
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import webpack from 'webpack';
import merge from 'webpack-merge';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

import baseConfig from './webpack.config.base.renderer';

const NODE_ENV = 'development';

// When an ESLint server is running, we can't set the NODE_ENV so we'll check if it's
// at the dev webpack config is not accidentally run in a production environment
if (process.env.NODE_ENV === 'production') {
  CheckNodeEnv(NODE_ENV);
}

const ROOT_DIR = path.join(__dirname, '..');
const APP_DIR = path.join(ROOT_DIR, 'app');
const DIST_DIR = path.join(APP_DIR, 'dist');
const DLL_DIR = path.join(ROOT_DIR, 'dll');

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/dist`;
const manifest = path.resolve(DLL_DIR, 'renderer.json');
const requiredByDLLConfig = module.parent.filename.includes('webpack.config.renderer.dev.dll');

/**
 * Warn if the DLL is not built
 */
if (!requiredByDLLConfig && !(fs.existsSync(DLL_DIR) && fs.existsSync(manifest))) {
  console.log(
    chalk.black.bgYellow.bold(
      'The DLL files are missing. Sit back while we build them for you with "yarn build-dll"'
    )
  );
  execSync('yarn build-dll');
}

export default merge.smart(baseConfig, {
  mode: NODE_ENV,
  devtool: 'inline-source-map',
  entry: [
    ...(process.env.PLAIN_HMR ? [] : ['react-hot-loader/patch']),
    `webpack-dev-server/client?http://localhost:${port}/`,
    'webpack/hot/only-dev-server',
    require.resolve('../app/index.tsx')
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
     * Useful for allowing different behavior between development builds and release builds
     * NODE_ENV should be production so that modules do not perform certain development checks
     * By default, use 'development' as NODE_ENV. This can be overridden with
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
    })
  ],
  devServer: {
    port,
    publicPath,
    compress: true,
    noInfo: false,
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
  node: {
    __dirname: false,
    __filename: false
  }
});

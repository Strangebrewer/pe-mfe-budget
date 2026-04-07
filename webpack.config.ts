import type { Configuration } from 'webpack';
import 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import webpack from 'webpack';
import { createWebpackConfig, defaultShared } from '@bka-stuff/pe-mfe-utils';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_NAME = 'mfe_app_one';

const config = {
  ...createWebpackConfig({
    appName: APP_NAME,
    resolve: path.resolve,
    _dirname: __dirname,
    port: 3001,
  }),

    plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new webpack.container.ModuleFederationPlugin({
      name: APP_NAME,
      filename: 'remoteEntry.js',

      exposes: {
        './App': './src/App',
      },

      shared: defaultShared,
    }),
  ],
} as Configuration;

export default config;
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { Configuration } from 'webpack'
import 'webpack-dev-server'
import * as url from 'url'
import * as path from 'path'

export function getWebpackConfig(): Configuration {
  return {
    stats: 'minimal',
    mode: 'development',
    entry: './src/index.tsx',
    devtool: 'eval-cheap-module-source-map',
    module: {
      rules: [
        {
          test: /\.[tj]sx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      extensionAlias: {
        '.js': ['.ts', '.tsx', '.js'],
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.join(
          url.fileURLToPath(new URL('.', import.meta.url)),
          './index.html',
        ),
      }),
    ],
    devServer: {
      historyApiFallback: true,
      allowedHosts: ['.amazonaws.com'],
    },
  }
}

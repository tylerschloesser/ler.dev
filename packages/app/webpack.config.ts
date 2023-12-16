import CopyPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { Configuration } from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import 'webpack-dev-server'
import { WebpackManifestPlugin } from 'webpack-manifest-plugin'

export default (
  _env: unknown,
  argv: { mode: Configuration['mode'] },
) => {
  const prod = argv.mode !== 'development'
  const mode = prod ? 'production' : 'development'

  const config: Configuration = {
    stats: 'minimal',
    mode,
    entry: './src/index.tsx',
    devtool: prod
      ? 'source-map'
      : 'eval-cheap-module-source-map',
    output: {
      filename: '[name].[contenthash].js',
      chunkFilename: '[name].[contenthash].chunk.js',
      clean: true,
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true,
                  localIdentName:
                    '[local]--[hash:base64:5]',
                },
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [['postcss-preset-env']],
                },
              },
            },
            'sass-loader',
          ],
        },
        {
          test: /\.glsl$/,
          type: 'asset/source',
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      extensionAlias: {
        '.js': ['.ts', '.tsx', '.js'],
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: prod
          ? 'index.[contenthash].html'
          : 'index.html',
        template: './src/index.html',
      }),
      new WebpackManifestPlugin({}),
      // TODO move these to webpack imports
      new CopyPlugin({
        patterns: [{ from: 'public' }],
      }),
      ...(Boolean(process.env.ANALYZE)
        ? [new BundleAnalyzerPlugin()]
        : []),
    ],
    devServer: {
      historyApiFallback: true,
      allowedHosts: ['.amazonaws.com'],
    },
    ...(prod
      ? {
          optimization: {
            splitChunks: {
              chunks: 'all',
            },
          },
        }
      : {}),
  }

  return config
}

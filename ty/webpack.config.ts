import CopyPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { Configuration } from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { Configuration as DevServerConfiguration } from 'webpack-dev-server'
import { WebpackManifestPlugin } from 'webpack-manifest-plugin'

const prod = Boolean(process.env.PROD) || !Boolean(process.env.WEBPACK_SERVE)

const config: Configuration = {
  stats: 'minimal',
  mode: prod ? 'production' : 'development',
  entry: './src/index.tsx',
  devtool: prod ? 'source-map' : 'eval-cheap-module-source-map',
  output: {
    path: __dirname + '/dist',
    filename: 'index.[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    clean: true,
    publicPath: '',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: prod ? 'index.[contenthash].html' : 'index.html',
      template: './src/index.html',
    }),
    new WebpackManifestPlugin({}),
    // TODO move these to webpack imports
    new CopyPlugin({
      patterns: [{ from: 'public' }],
    }),
    ...(Boolean(process.env.ANALYZE) ? [new BundleAnalyzerPlugin()] : []),
  ],
  devServer: {
    historyApiFallback: true,
    allowedHosts: ['.amazonaws.com'],
  },
}

export default config

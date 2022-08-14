import HtmlWebpackPlugin from 'html-webpack-plugin'
import { Configuration } from 'webpack'
import { WebpackManifestPlugin } from 'webpack-manifest-plugin'

const config: Configuration = {
  stats: 'minimal',
  mode: 'development',
  entry: './src/index.tsx',
  devtool: 'eval-cheap-module-source-map',
  output: {
    path: __dirname + '/dist',
    filename: 'index.[contenthash].js',
    clean: true,
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
      filename: 'index.[contenthash].html',
      template: './src/index.html',
    }),
    new WebpackManifestPlugin({}),
  ],
}

export default config

var webpack = require('webpack')
var path = require('path')

module.exports = {

  devtool: 'eval-source-map',

  entry: {
    'app/markups/Viewing.Extension.Markup3D':
      './src/Viewing.Extension.Markup3D/Viewing.Extension.Markup3D.js',
    'app/markups/index':
        './src/markups/index.js',
    'app/index':
        './src/index.js'
  },

  output: {
    path: path.join(__dirname, '../model'),
    filename: "[name].js",
    libraryTarget: "umd",
    library: "[name]",
    watch: true
  },

  plugins: [

    new webpack.optimize.UglifyJsPlugin({
      compress: false,
      minimize: false,
      mangle: false
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    }),

    new webpack.ProvidePlugin({
      'window.jQuery': 'jquery',
      jQuery: 'jquery',
      _: 'lodash',
      $: 'jquery'
    })
  ],

  resolve: {
    extensions: ['', '.js', '.jsx', '.json', '.ts'],
    root: [
      path.resolve('./src/components')
    ]
  },

  module: {

    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          cacheDirectory: true,
          presets: ['es2015', 'stage-0', 'react'],
          plugins: ['transform-runtime']
        }
      },
      { test: /\.scss$/, loaders: ["style", "css", "sass"] },
      { test: /\.less$/, loader: "style!css!less" },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
      }
    ]
  }
}

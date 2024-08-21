// webpack.prod.js
const path = require("path");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const getStyleLoaders = (preProcessor) => {
  return [
    // 'style-loader', // 使用此标签会在index.html中创建一个style标签，把样式插入到style标签中
    MiniCssExtractPlugin.loader, // 使用此标签会在dist目录下创建一个css文件，把样式插入到link标签中  ==========> 胜出
    'css-loader', {
      // 考虑兼容性问题
      // 配合package.json的browserslist
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            "postcss-preset-env"
          ],
        }
      }
    },
    preProcessor
  ].filter(Boolean)
}


module.exports = {
  // 入口文件
  entry: './src/main.js',

  // 输出文件
  output: {
    path: path.resolve(__dirname, '../dist'), // 设定输出目录
    // path: undefined,  //开发模式，可以不用指定输出地址
    filename: "static/js/[name].js",// 动态导入名字
    chunkFilename: 'static/js/[name].chunk.js', // 指定分割代码的存放地址
    assetModuleFilename: 'static/media/[hash:10][ext][query]', // 存放图片，icon等文件地址
    clean: true, // 每次打包前清空dist目录
  },

  // 配置loader
  module: {
    // 配置规则
    rules: [
      // TODO 处理css文件
      {
        test: /\.css$/,
        use: getStyleLoaders()
      },
      {
        test: /\.less$/,
        use: getStyleLoaders('less-loader')
      },
      {
        test: /\.sass$/,
        use: getStyleLoaders('sass-loader')
      },
      {
        test: /\.scss$/,
        use: getStyleLoaders('scss-loader')
      },
      // 处理图片文件
      {
        test: /\.(png|jepg|jpg|webp|svg)$/,
        use: 'asset', //图片用内置的asset
        // 图片压缩
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 当小于10kb的时候就转换成base64的格式，因为会随着图片的增大而
          }
        }
      },
      // 处理其他资源（woff或者ttf）
      {
        test: /\.(woff2|ttf)$/,
        use: 'asset/resource' // asset可以转成base64，但是resource是原封不动的
      },
      // 处理js文件(ESlint,Babel),配合babel.config.js
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        // use: {
        //   loader: 'babel-loader',
        //   options: {
        //     presets: ['@babel/preset-env', '@babel/preset-react'],
        //   },
        // },
        options: {
          cacheDirectory: true,
          cacheCompression: false,
          plugins: [
            // "@babel/plugin-transform-runtime" // presets中包含了
          ],
        },
      }
    ]
  },

  // 插件
  plugins: [
    // ESLint 插件（配合.eslintrc.js）
    new ESLintWebpackPlugin({
      context: path.resolve(__dirname, '../src'),
      exclude: 'node_modules', // #################################排除不需要的资源（提高编译的速度）##############################
      cache: true, // #############################################开启缓存（提高编译速度)########################################
      cacheLocation: path.resolve(__dirname, '../node_modules/.cache/.eslintcache') // ###############存放缓存的目录#############
      // thread 进程开销较大
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html") // 就可以不用在html中手动引入js
    }),
    // CSS 提取，打包速度更快
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:10].css", // 当内容发送改变的时候才进行重新打包
      chunkFilename: "static/css/[name].[contenthash:10].chunk.css",
    }),
    // 将public下面的资源复制到dist目录去（除了index.html）
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "../public"),
          to: path.resolve(__dirname, "../dist"),
          toType: "dir",
          noErrorOnMissing: true, // 不生成错误
          globOptions: {
            // 忽略文件
            ignore: ["**/index.html"],
          },
          info: {
            // 跳过terser压缩js
            minimized: true,
          },
        },
      ],
    }),

  ],
  mode: 'production', // 设置为开发模式
  devtool: "source-map", // 只检测行的 ，##################提高代码的开发效果###########################################



  optimization: {
    // 压缩的操作
    minimizer: [
      new CssMinimizerPlugin(), // 压缩css
      new TerserWebpackPlugin(), // 压缩js
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 5 }],
              [
                "svgo",
                {
                  plugins: [
                    "preset-default",
                    "prefixIds",
                    {
                      name: "sortAttrs",
                      params: {
                        xmlnsOrder: "alphabetical",
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
    ],
    splitChunks: {
      chunks: "all" // 进行代码分割 ，将被多个引用的代码模块，或者import的模块，进行代码分割 =========> 可能会导致缓存失效，因为会导致chunk文件名改变
    },
    runtimeChunk: { // 解决代码分割导致的缓存失效问题，导入模块的间接失效
      name: entrypoint => `runtime-${entrypoint.name}.js`
    }
  },
  // 方便自动开启网站
  devServer: {
    host: 'localhost',
    port: 5000,
    open: true, // 是否自动
    hot: true // 是否开启HMR，热模块替换
  },
  resolve: {
    extensions: [".jsx", ".js", ".json"], // 自动补全文件扩展名，让jsx可以使用
  },
  performance: false, // 关闭性能分析，提示速度
}
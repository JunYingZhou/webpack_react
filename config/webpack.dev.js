const path = require('path');
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


const getStyleLoaders = (pre) => {
    return ['style-loader', 'css-loader', {
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
        pre
    ].filter(Boolean)
}

module.exports = {
    // 入口文件
    entry: './src/main.js',

    // 输出文件
    output: {
        path: path.resolve(__dirname, 'dist'), // 设定输出目录
        // path: undefined,  //开发模式，可以不用指定输出地址
        filename: "static/js/[name].js",// 动态导入名字
        chunkFilename: 'static/js/[name].chunk.js', // 指定分割代码的存放地址
        assetModuleFilename: 'static/media/[hash:10][ext][query]', // 存放图片，icon等文件地址
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
                test: /\.jsx$/,
                include: path.resolve(__dirname, '../src'), // ##########################只处理被包含的文件（提高编译速度）#################
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true, // loader的选项配置时间
                        cacheCompression: false // 取消缓存压缩，因为压缩会浪费时间
                        // 可配置对线程
                    }
                }
            },
        ]
    },

    // 插件
    plugins: [
        // ESLint 插件（配合.eslintrc.js）
        new EslintWebpackPlugin({
            context: path.resolve(__dirname,'../src'),
            exclude: 'node_modules', // #################################排除不需要的资源（提高编译的速度）##############################
            cache: true, // #############################################开启缓存（提高编译速度)########################################
            cacheLocation: path.resolve(__dirname, '../node_modules/.cache/.eslintcache') // ###############存放缓存的目录#############
            // thread 进程开销较大
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../public/index.html") // 就可以不用在html中手动引入js
        })
    ],
    mode: 'development', // 设置为开发模式
    devtool: "cheap-module-source-map", // 只检测行的 ，##################提高代码的开发效果###########################################
    optimization: {
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
    }
}
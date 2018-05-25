const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 生成打包分析图，用来观察性能
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
    resolve: {
        // 给出别名, 可以import别名， e.g. import 'MVVM', 而不是复杂的路径 e.g. import '../MVVM'
        alias: {
            MVVM: path.resolve(__dirname, 'src/Vendor/MVVM'),
        },
        // 可以在js文件中不用加扩展名，会尝试以下扩展名
        extensions: ['.js', '.css', '.json'],
    },
    entry: {
        index: path.resolve(__dirname, 'src/index.js'),
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].entry.bundle.js',
        chunkFilename: '[name].async.bundle.js',
    },
    // 生成map文件, 如果有错误，会报出在源文件中的位置而不是生成的bundle文件的位置
    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            REQUEST_API: JSON.stringify('test'),
        }),
        new HtmlWebpackPlugin({
            title: 'myapp',
            template: path.resolve(__dirname, 'src/index.ejs'),
            // 如果有错误，显示在页面中
            showErrors: true,
        }),
        new BundleAnalyzerPlugin(),
        // 按顺序依次打包
        // 1. 将子chunk的node_modules代码打包进父chunk(入口chunk: index)
        new webpack.optimize.CommonsChunkPlugin({
            children: true,
            async: false,
            minChunks(module) {
                return /node_modules/.test(module.context);
            },
        }),
        // 2. 将入口chunk的node_modules代码打包成vendor.bundle.js
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks(module) {
                return /node_modules/.test(module.context);
            },
        }),
        // 3. 将子chunk的公共代码打包进async-common并且采用异步加载
        new webpack.optimize.CommonsChunkPlugin({
            chidren: true,
            async: 'async-common',
            minChunks: 2,
        }),
        // 4. 新建一个manifest chunk, 不放入任何模块(minChunks:infinity).
        // 由于manifest是此时唯一的entry chunk，则runtime代码放入manifest。
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            minChunks: Infinity,
        }),
    ],
    devServer: {
        historyApiFallback: true,
        hot: true,
        inline: true,
        port: 8081,
    },
    module: {
        // loader的加载顺序是从右往左，从下往上
        rules: [
            {
                // 一个用以匹配 loaders 所处理文件的拓展名的正则表达式（必须）
                test: /\.(js|jsx|mjs)$/,
                // include/exclude：手动添加必须处理的文件（文件夹）或屏蔽不需要处理的文件（文件夹）（可选）
                exclude: /node_modules/,
                loader: ['babel-loader?cacheDirectory=true'],
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                // 让css模块化，暴露出一个以类名为属性的对象，并且区分local class和global class
                loaders: [
                    'style-loader',
                    'css-loader?modules&localIdentName=[name]---[local]---[hash:base64:5]&camelCase',
                ],
            },
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                use: {
                    loader: 'url-loader',
                    options: {
                        // 如果小于这个值，会以base64为出现在css中 e.g. 1KB
                        limit: 1024,
                        name: '[name].[hash:8].[ext]',
                    },
                },
            },
        ],
    },
};

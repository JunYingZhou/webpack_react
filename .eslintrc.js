module.exports = {
    extends: ['react-app'], // 继承 react-app 的代码检查
    parserOptions: {
        babelOptions: {
            presets: [
                // 解决页面报错问题
                ['babel-preset-react-app', false],
                'babel-preset-react-app/prod',
            ]
        }
    }
}

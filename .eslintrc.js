module.exports = {
    extends: ['react-app'], //继承react的代码检查
    parserOptions: {
        babelOptions: {
            preset: [
                //解决页面报错问题
                ['babel-preset-react-app',false],
                'babel-preset-react-app/prod',
            ]
        }
    }
}
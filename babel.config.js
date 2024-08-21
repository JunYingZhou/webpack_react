module.exports = {
    extends: [
      'eslint:recommended',
      'plugin:react/recommended'
    ],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    plugins: [
      'react',
    ],
    rules: {
      // 添加你的规则
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  };
  
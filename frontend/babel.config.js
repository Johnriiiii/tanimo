module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    ['@babel/plugin-transform-react-jsx', {
      runtime: 'automatic'
    }]
  ]
};
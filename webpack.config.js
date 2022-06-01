const path = require('path');

module.exports = {
  entry: './src/js/index.js',
  externals: {
    'jquery': 'jQuery',
    'Potree': 'Potree'
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'docs')
  },
};

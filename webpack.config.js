const path = require('path');

module.exports = {
  entry: './src/js/index.js',
  externals: {
    'Potree': 'Potree'
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'docs')
  },
};

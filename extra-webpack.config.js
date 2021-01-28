const singleSpaAngularWebpack = require('single-spa-angular/lib/webpack').default;
const webpack = require('webpack');
module.exports = (angularWebpackConfig, options) => {
  const singleSpaWebpackConfig = singleSpaAngularWebpack(angularWebpackConfig, options);
  singleSpaWebpackConfig.plugins.push( new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }));
  // Feel free to modify this webpack config however you'd like to
  return singleSpaWebpackConfig;
};

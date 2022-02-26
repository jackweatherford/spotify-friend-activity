const { ProvidePlugin } = require("webpack");

// Copy any file/folder into ./dist.
// Ref: https://webpack.js.org/plugins/copy-webpack-plugin/.
const CopyPlugin = require("copy-webpack-plugin");

// Webpack settings.
module.exports = {
  mode: "production",
  entry: {
    index: "./src/index.jsx",
    popup: "./src/components/Popup/index.jsx",
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/dist",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [["@babel/plugin-transform-react-jsx", { pragma: "h" }]],
          },
        },
      },
      {
        test: /\.scss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "./src/images", to: "./images" }],
    }),
    new ProvidePlugin({
      h: ["preact", "h"],
    }),
  ],
};

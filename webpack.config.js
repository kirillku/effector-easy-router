const path = require("path");

const exampleBuildPath = path.resolve(__dirname, "example/build");

module.exports = {
  mode: "development",
  entry: "./example/src/index.tsx",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    publicPath: "/",
    path: exampleBuildPath,
    filename: "bundle.js",
  },
  devServer: {
    contentBase: exampleBuildPath,
    historyApiFallback: true,
    port: 4000,
  },
};

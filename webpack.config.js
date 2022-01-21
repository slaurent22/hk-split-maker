/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const path = require("path");
const child_process = require("child_process");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

function git(command) {
  return child_process.execSync(`git ${command}`, { encoding: "utf8", }).trim();
}

module.exports = {
  entry: {
    index: "./src/index.tsx",
  },
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "babel-loader",
        options: {
          targets: "defaults",
          presets: [
            ["@babel/preset-env", {
              targets: "defaults",
              bugfixes: true,
              useBuiltIns: "usage",
              corejs: {
                version: require("./package-lock.json")
                  .packages["node_modules/core-js"].version,
                proposals: true,
              },
              forceAllTransforms: true,
            }],
            ["@babel/preset-typescript", {
              allowDeclareFields: true,
            }],
            ["@babel/preset-react", {
              runtime: "classic",
              useBuiltIns: true,
            }]
          ],
        },
        exclude: /node_modules/,
      },
      {
        test: /\.txt$/,
        use: [
          {
            loader: path.resolve("loaders/text-loader.js"),
          }
        ],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      }, {
        test: /\.ttf$/,
        use: ["file-loader"],
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "HK Split Maker",
      favicon: "./src/asset/image/favicon.png",
      meta: {
        twitter_card: {
          name: "twitter:card",
          content: "summary",
        },
        twitter_site: {
          name: "twitter:site",
          content: "@hksplitmaker",
        },
        twitter_title: {
          name: "twitter:title",
          content: "HK Split Maker",
        },
        twitter_image: {
          name: "twitter:image",
          content: "https://hksplitmaker.com/favicon.png",
        },
        og_url: {
          property: "og:url",
          content: "https://hksplitmaker.com",
        },
        og_title: {
          property: "og:title",
          content: "HK Split Maker",
        },
        og_description: {
          property: "og:description",
          content: "Generate and download LiveSplit files for Hollow Knight speedrunning. " +
                                "Many categories included, or customize your own!",
        },
        og_image: {
          property: "og:image",
          content: "https://hksplitmaker.com/favicon.png",
        },
      },
    }),
    new MonacoWebpackPlugin(),
    new webpack.EnvironmentPlugin({
      GIT_VERSION: git("describe --always"),
    })
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      stream: false,
    },
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};

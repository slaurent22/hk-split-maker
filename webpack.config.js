/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
    entry: {
        index: "./src/index.tsx",
    },
    devtool: "eval-source-map",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
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
        }),
        new MonacoWebpackPlugin()
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

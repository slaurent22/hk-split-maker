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

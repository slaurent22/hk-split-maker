/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        index: "./src/index.tsx",
    },
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
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "HK Split Maker",
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
        publicPath: "/hk-split-maker/",
    },
};

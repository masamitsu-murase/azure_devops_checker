const VueLoaderPlugin = require('vue-loader/lib/plugin')
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const InnerHtmlRemoverPlugin = require('./webpack_plugins/inner_html_remover')
const path = require('path');

module.exports = {
    entry: {
        popup: "./src/popup.js",
        options: "./src/options.js"
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "[name]_vue.js"
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: [
                    "vue-style-loader",
                    "css-loader"
                ]
            },
            {
                test: /\.s(c|a)ss$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        // Requires sass-loader@^8.0.0
                        options: {
                            implementation: require('sass'),
                            sassOptions: {
                                indentedSyntax: true // optional
                            },
                        },
                    },
                ],
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new VuetifyLoaderPlugin(),
        new InnerHtmlRemoverPlugin()
    ],
    node: {
        global: false,
        __filename: false,
        __dirname: false,
    },
    // optimization: {
    //     minimize: false
    // },
}

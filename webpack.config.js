/**
 * import packages
 */
const glob = require('glob');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const threadLoader = require('thread-loader');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const CopyPlugin = require("copy-webpack-plugin");


/**
 * webpack output option setting
 *  mode : 'production' or 'development'
 * 'outputDir : output directory
 */
const mode = process.env.NODE_ENV || "development";
const outputDir = 'chrome_extension';


/**
 * threadLoader Option
 */
const jsWorkerOptions = {
  workers: require('os').cpus().length - 1,
  workerParallelJobs: 50,
  poolTimeout: 2000,
  poolParallelJobs: 50,
  name: 'js-pool'
};
threadLoader.warmup(jsWorkerOptions, [
  'ts-loader'
]);


/**
 * Extract the scss file to be compiled
 */
console.log('======================================');
console.log('🔧🎨 List of scss files to be compiled.');
console.log('======================================');
const entriesSass = {};
glob.sync('./src/**/*.scss', {
  ignore: './src/**/_*.scss'
}).map((file) => {
  console.log(file);
  const regEx = new RegExp('./src');
  const fileOriginalName = file.replace(regEx, '');
  const fileChangeDirName = fileOriginalName.replace('/sass/', '/css/');
  const fileChangeExtName = fileChangeDirName.replace('.scss', '.css');
  entriesSass[fileChangeExtName] = file;
});


/**
 * Extract the ts file to be compiled
 */
console.log('======================================');
console.log('🔧🤖 List of ts files to be compiled.');
console.log('======================================');
const entriesJS = {};
glob.sync('./src/**/entry.ts', {
  ignore: './src/**/_*.ts'
}).map((file) => {
  console.log(file);
  const regEx = new RegExp('./src');
  const fileOriginalName = file.replace(regEx, '');
  const key = fileOriginalName.replace('/ts/', '/js/').replace('entry.ts', 'bundle.js');
  entriesJS[key] = file;
});


/**
 * webpack config
 */
module.exports = [
  // .scss config
  {
    mode: mode,
    entry: entriesSass,
    output: {
      path: path.join(`${__dirname}/${outputDir}`),
      filename: '../webpack/hash/[contenthash]'
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: false
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  require('cssnano')({
                    preset: 'default',
                  }),
                  require('autoprefixer')({
                    grid: true
                  })
                ]
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: false,
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name]'
      }),
      new WebpackBuildNotifierPlugin({
        title: 'Sass Builded!',
        suppressSuccess: true
      })
    ]
  },


  // .ts config
  {
    mode: mode,
    entry: entriesJS,
    output: {
      path: `${__dirname}/${outputDir}`,
      filename: '[name]'
    },
    resolve: {
      extensions: [".ts", ".js"]
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            { loader: "ts-loader" }
          ],
          exclude: /node_modules/
        },
      ],
    },
    plugins: [
      new CopyPlugin([
        {
          from: "./static",
          to: "./"
        }
      ]),
      new WebpackBuildNotifierPlugin({
        title: 'JavaScript Builded!',
        suppressSuccess: true
      })
    ],
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            output: {
              comments: false
            },
            compress: {
              drop_console: true
            }
          },
          extractComments: false
        })
      ]
    }
  }
];

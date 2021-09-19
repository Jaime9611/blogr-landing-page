const { src, dest, watch, series } = require("gulp");
const pug = require("gulp-pug");
const htmlmin = require("gulp-htmlmin");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const babel = require("gulp-babel");
const terser = require("gulp-terser");
const imagemin = require("gulp-image");
const browsersync = require("browser-sync").create();

const webpack = require("webpack-stream");

const notify = require("gulp-notify");
const plumber = require("gulp-plumber");

// Custom Error Handler (plumber)
function customPlumber() {
  return plumber({
    errorHandler: notify.onError("Error: <%= error.message %>"),
  });
}

// Hmtl Task
// function htmlTask() {
//   return src("public/**/*.html")
//     .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
//     .pipe(dest("dist/"));
// }

function pugTask() {
  return src("src/pug/*.pug")
    .pipe(customPlumber())
    .pipe(pug({ pretty: true }))
    .pipe(dest("dist/"));
}

// Sass Task
function scssTask() {
  return src("src/styles/main.scss", { sourcemaps: true })
    .pipe(customPlumber())
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest("dist/css", { sourcemaps: true }));
}

// Javascript Task
function jsTask() {
  return (
    src("src/index.js", { sourcemaps: true })
      .pipe(customPlumber())
      .pipe(
        webpack({
          mode: "production",
          module: {
            rules: [{ test: /\.m?js$/, exclude: /node_modules/ }],
          },
        })
      )
      .pipe(babel())
      // .pipe(terser())
      .pipe(dest("dist/js", { sourcemaps: "." }))
  );
}

// BrowserSync Tasks
function browserSyncServe(cb) {
  browsersync.init({
    server: {
      baseDir: "./dist/",
    },
  });

  cb();
}

function browserSyncReload(cb) {
  browsersync.reload();
  cb();
}

// Watch Task
function watchTask() {
  watch("src/pug/**/*.pug", series(pugTask, browserSyncReload));
  watch(
    ["src/styles/**/*.scss", "src/**/*.js"],
    series(scssTask, jsTask, browserSyncReload)
  );
}

// Assets
function imagesTask() {
  return src("src/assets/images/*")
    .pipe(imagemin())
    .pipe(dest("dist/assets/images"));
}

// Default gulp task
exports.default = series(
  pugTask,
  scssTask,
  jsTask,
  imagesTask,
  browserSyncServe,
  watchTask
);

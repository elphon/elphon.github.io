"use strict";

import gulp from "gulp";
import concat from "gulp-concat";
import imagemin from "gulp-imagemin";
import plumber from "gulp-plumber";
import sourcemaps from "gulp-sourcemaps";
import uglify from "gulp-uglify";
import browserSync from "browser-sync";
import cp from "node:child_process";

/**
 * Show a short build notification in BrowserSync.
 */
function notify(message) {
  browserSync.notify(message);
}

/**
 * Build the Jekyll site.
 */
function jekyll(done) {
  notify("Building Jekyll...");
  const bundle = process.platform === "win32" ? "bundle.bat" : "bundle";

  return cp
    .spawn(bundle, ["exec", "jekyll", "build"], { stdio: "inherit" })
    .on("close", done);
}

/**
 * Serve the generated site with BrowserSync.
 */
function server(done) {
  browserSync({
    server: {
      baseDir: "_site"
    }
  });
  done();
}

function reload(done) {
  browserSync.reload();
  done();
}

/**
 * Build the regular site JavaScript bundle.
 */
function mainJs() {
  notify("Building JS files...");

  return gulp
    .src("src/js/main/**/*.js")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(concat("scripts.min.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("assets/js"))
    .pipe(gulp.dest("_site/assets/js"))
    .pipe(browserSync.reload({ stream: true }));
}

/**
 * Optimize source images and copy them into the public assets directory.
 */
function images() {
  notify("Copying image files...");

  return gulp
    .src("src/img/**/*.{jpg,jpeg,png,gif,svg,webp}")
    .pipe(plumber())
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest("assets/img/"));
}

/**
 * Watch source and authored files. _config.yml, _sass/_theme.scss, and
 * _data/translations.yml are now canonical files and are edited directly.
 */
function watch() {
  gulp.watch("src/js/main/**/*.js", mainJs);
  gulp.watch("src/img/**/*", gulp.series(images, jekyll, reload));

  gulp.watch([
    "_config.yml",
    "_data/**/*.yml",
    "_sass/**/*.scss",
    "*.html",
    "_includes/**/*.html",
    "_layouts/**/*.html",
    "_posts/*",
    "_authors/*",
    "pages/*",
    "category/*",
    "assets/css/photo-post*.css",
    "assets/js/photo-post*.js"
  ], gulp.series(jekyll, reload));
}

const run = gulp.series(
  gulp.parallel(mainJs, images),
  jekyll,
  gulp.parallel(server, watch)
);

const build = gulp.series(gulp.parallel(mainJs, images), jekyll);

export { run as default, build };

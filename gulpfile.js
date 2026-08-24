"use strict";

import gulp from "gulp";
import concat from "gulp-concat";
import imagemin from "gulp-imagemin";
import include from "gulp-include";
import plumber from "gulp-plumber";
import rename from "gulp-rename";
import sourcemaps from "gulp-sourcemaps";
import uglify from "gulp-uglify";
import yaml from "gulp-yaml";
import browserSync from "browser-sync";
import cp from "child_process";
import { deleteAsync } from "del";
import fs from "fs";
import jsonSass from "json-sass";
import source from "vinyl-source-stream";

/**
 * Notify
 *
 * Show a notification in the browser's corner.
 *
 * @param {*} message
 */
function notify(message) {
  browserSync.notify(message);
}

/**
 * Config Task
 *
 * Build the main YAML config file.
 */
function config() {
  return gulp.src('src/yml/_config.yml')
    .pipe(include())
    .on('error', console.error)
    .pipe(gulp.dest('./'));
}

/**
 * Jekyll Task
 *
 * Build the Jekyll Site.
 *
 * @param {*} done
 */
function jekyll(done) {
  notify('Building Jekyll...');
  const bundle = process.platform === "win32" ? "bundle.bat" : "bundle";
  return cp
    .spawn(bundle, ['exec', 'jekyll build'], { stdio: 'inherit' })
    .on('close', done);
}

/**
 * Server Task
 *
 * Launch server using BrowserSync.
 *
 * @param {*} done
 */
function server(done) {
  browserSync({
    server: {
      baseDir: '_site'
    }
  });
  done();
}

/**
 * Reload Task
 *
 * Reload page with BrowserSync.
 *
 * @param {*} done
 */
function reload(done) {
  notify('Reloading...');
  browserSync.reload();
  done();
}

/**
 * Theme Tasks
 *
 * These three tasks are responsible for:
 * 1. Converting src/yml/theme.yml to src/tmp/theme.json
 * 2. Converting src/tmp/theme.json to _sass/_theme.scss
 * 3. Deleting src/tmp
 */
function yamlTheme() {
  return gulp.src('src/yml/theme.yml')
    .pipe(yaml({ schema: 'DEFAULT_SAFE_SCHEMA' }))
    .pipe(gulp.dest('src/tmp/'));
}

function jsonTheme() {
  return fs.createReadStream('src/tmp/theme.json')
    .pipe(jsonSass({
      prefix: '$theme: ',
    }))
    .pipe(source('src/tmp/theme.json'))
    .pipe(rename('_sass/_theme.scss'))
    .pipe(gulp.dest('./'));
}

async function cleanTheme() {
  return await deleteAsync(['src/tmp']);
}

const theme = gulp.series(yamlTheme, jsonTheme, cleanTheme);

/**
 * Main JS Task
 *
 * Collect, minify, and concatenate the regular site JavaScript.
 */
function mainJs() {
  notify('Building JS files...');
  return gulp.src('src/js/main/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(concat('scripts.min.js'))
    .pipe(plumber())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('_site/assets/js/'))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(gulp.dest('assets/js'));
}

/**
 * Images Task
 *
 * Optimize and copy source images to assets.
 */
function images() {
  notify('Copying image files...');
  return gulp.src('src/img/**/*.{jpg,png,gif,svg}')
    .pipe(plumber())
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('assets/img/'));
}

/**
 * Watch Task
 *
 * Watch files to run proper tasks.
 */
function watch() {
  // Watch YAML files for changes & recompile
  gulp.watch(['src/yml/*.yml', '!src/yml/theme.yml'], gulp.series(config, jekyll, reload));

  // Watch theme file for changes, rebuild styles & recompile
  gulp.watch(['src/yml/theme.yml'], gulp.series(theme, config, jekyll, reload));

  // Watch Jekyll data independently; these files do not regenerate _config.yml.
  gulp.watch('_data/**/*.yml', gulp.series(jekyll, reload));

  // Watch SASS files for changes & rebuild styles
  gulp.watch(['_sass/**/*.scss'], gulp.series(jekyll, reload));

  // Watch the site's source JS bundle.
  gulp.watch('src/js/main/**/*.js', mainJs);

  // Watch images for changes, optimize & recompile
  gulp.watch('src/img/**/*', gulp.series(images, config, jekyll, reload));

  // Watch templates, content, and standalone photo assets.
  gulp.watch([
    '*.html',
    '_includes/**/*.html',
    '_layouts/**/*.html',
    '_posts/*',
    '_authors/*',
    'pages/*',
    'category/*',
    'assets/css/photo-post*.css',
    'assets/js/photo-post*.js'
  ], gulp.series(config, jekyll, reload));
}

/**
 * Default Task
 *
 * Compile the theme, JavaScript, and images, then build and serve Jekyll.
 */
const run = gulp.series(
  gulp.parallel(mainJs, theme, images),
  config,
  jekyll,
  gulp.parallel(server, watch)
);

/**
 * Build Task
 *
 * Compile assets and build the Jekyll site without starting BrowserSync.
 */
const build = gulp.series(gulp.parallel(mainJs, theme, images), config, jekyll);

export { run as default, build };

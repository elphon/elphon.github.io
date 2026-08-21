"use strict";

import gulp from "gulp";
import concat from "gulp-concat";
import imagemin from "gulp-imagemin";
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
 * Jekyll Task
 *
 * `_config.yml` is the single source of truth for site configuration.
 * The build no longer regenerates it from legacy src/yml fragments.
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

/** Launch the generated site through BrowserSync. */
function server(done) {
  browserSync({
    server: {
      baseDir: '_site'
    }
  });
  done();
}

/** Reload the browser after a successful rebuild. */
function reload(done) {
  notify('Reloading...');
  browserSync.reload();
  done();
}

/**
 * Theme Tasks
 *
 * Theme colors still use src/yml/theme.yml as their dedicated source because
 * they are compiled into _sass/_theme.scss. Site configuration itself does not.
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

/** Build the legacy theme JavaScript bundle. */
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

function previewJs() {
  notify('Copying preview files...');
  return gulp.src('src/js/preview/**/*.*')
    .pipe(gulp.dest('assets/js/'));
}

const js = gulp.parallel(mainJs, previewJs);

/** Optimize and copy source images used by the theme. */
function images() {
  notify('Copying image files...');
  return gulp.src('src/img/**/*.{jpg,png,gif,svg}')
    .pipe(plumber())
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('assets/img/'));
}

/** Development watchers. */
function watch() {
  // Root Jekyll config is authoritative.
  gulp.watch('_config.yml', gulp.series(jekyll, reload));

  // Theme colors are the only YAML source that still has a compile step.
  gulp.watch('src/yml/theme.yml', gulp.series(theme, jekyll, reload));

  gulp.watch(['_sass/**/*.scss', 'assets/css/**/*.css', 'assets/css/**/*.scss'], gulp.series(jekyll, reload));
  gulp.watch('src/js/main/**/*.js', mainJs);
  gulp.watch('src/js/preview/**/*.js', gulp.series(previewJs, reload));
  gulp.watch('assets/js/**/*.js', gulp.series(jekyll, reload));
  gulp.watch('src/img/**/*', gulp.series(images, jekyll, reload));

  gulp.watch([
    '*.html',
    '_includes/**/*.html',
    '_layouts/*.html',
    '_posts/*',
    '_authors/*',
    '_data/*',
    '_plugins/**/*.rb',
    'pages/*',
    'category/*'
  ], gulp.series(jekyll, reload));
}

/**
 * Default development task:
 * build theme assets, build Jekyll, launch BrowserSync, then watch changes.
 */
const run = gulp.series(gulp.parallel(js, theme, images), jekyll, gulp.parallel(server, watch));

/** Production/local verification build. */
const build = gulp.series(gulp.parallel(js, theme, images), jekyll);

export { run as default, build };

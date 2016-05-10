"use strict";

//Require Dependencies
const gulp       = require("gulp"),
    sass         = require("gulp-sass"),
    rename       = require("gulp-rename"),
    browserSync  = require("browser-sync").create(),
    clean        = require("del"),
    gulpif       = require("gulp-if"),
    useref       = require("gulp-useref"),
    imagemin     = require("gulp-imagemin"),
    newer        = require("gulp-newer"),
    uglify       = require("gulp-uglify"),
    autoprefixer = require("gulp-autoprefixer"),
    uncss        = require("gulp-uncss"),
    cssnano      = require("gulp-cssnano");

let isProduction = false;

const paths = {
    styles: [
        "./src/styles/**/*.scss"
    ],
    images: [
        "./src/img/**/*.+(png|jpg|jpeg|gif|svg)"
    ],
    fonts: [
        "./src/fonts/**/*.+(eot|woff2|woff|ttf|svg|otf)"
    ],
    code: [
        "./src/**/*.+(html|php)",
        "!./src/fonts/", "!./src/fonts/**",
        "!./src/img/", "!./src/img/**",
        "!./src/js/", "!./src/js/**",
        "!./src/styles/", "!./src/styles/**"
    ],
    js: [
        "./src/js/**/*.js",
        "./node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js"
    ]
};

const dests = {
    styles: "dist/styles",
    images: "dist/img",
    fonts: "dist/fonts",
    code: "dist",
    js: "dist/js"
};

gulp.task("scss", () =>
    gulp
        .src(paths.styles)
        .pipe(sass().on("error", sass.logError))
        .pipe(rename("style.css"))
        .pipe(autoprefixer({
            browsers: ["last 3 versions"]
        }))
        .pipe(gulpif(isProduction, uncss({
            html: ["./src/**/*.+(html|php)"]
        })))
        .pipe(gulpif(isProduction, cssnano({
            discardComments: {removeAll: true}
        })))
        .pipe(gulpif(!isProduction, browserSync.reload({
            stream: true
        })))
        .pipe(gulp.dest(dests.styles))
);

gulp.task("copyCode", () =>
    gulp
        .src(paths.code)
        .pipe(gulpif(!isProduction, browserSync.reload({
            stream: true
        })))
        .pipe(gulpif(isProduction, useref()))
        .pipe(gulp.dest(dests.code))
);

gulp.task("copyFonts", () =>
    gulp
        .src(paths.fonts)
        .pipe(gulpif(!isProduction, browserSync.reload({
            stream: true
        })))
        .pipe(gulp.dest(dests.fonts))
);

gulp.task("copyJs", () =>
    gulp
        .src(paths.js)
        .pipe(gulpif(!isProduction, browserSync.reload({
            stream: true
        })))
        .pipe(gulp.dest(dests.js))
);

gulp.task("images", () =>
    gulp
        .src(paths.images)
        .pipe(gulpif(!isProduction, newer(dests.images)))
        .pipe(gulpif(!isProduction, browserSync.reload({
            stream: true
        })))
        .pipe(gulpif(isProduction, imagemin()))
        .pipe(gulp.dest(dests.images))
);

gulp.task("useref", () =>
    gulp
        .src(paths.code)
        .pipe(gulpif(isProduction, useref()))
        .pipe(gulpif("*.js", uglify()))
        .pipe(gulp.dest(dests.code))
);

//Set set tasks to production mode
gulp.task("buildProduction", () => {
    isProduction = true;
});

//Gulp Task for auto reloading
gulp.task("browserSync", ["scss"], () => {
    browserSync.init({
        server: {
            baseDir: "dist"
        },
        port: 1337
    });
});

// Delete dist folder in preparation for new gulp command or production
gulp.task("clean", () => {
    clean.sync("dist");
});

gulp.task("default", ["scss", "copyCode", "copyFonts", "copyJs", "useref", "images"]);

gulp.task("watch", ["scss", "copyCode", "copyFonts", "copyJs", "useref", "images", "browserSync"], () => {
    gulp.watch(paths.styles, ["scss"]);
    gulp.watch(paths.code, ["copyCode"], browserSync.reload);
    gulp.watch(paths.js, ["copyJs"], browserSync.reload);
    gulp.watch(paths.images, ["images"], browserSync.reload);
});

gulp.task("dist", ["buildProduction", "scss", "copyCode", "copyFonts", "useref", "images"]);

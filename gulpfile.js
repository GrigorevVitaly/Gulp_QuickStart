'use strict';

var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    browserSync  = require('browser-sync'),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglify'),
    cssnano      = require('gulp-cssnano'),
    rename       = require('gulp-rename'),
    pug          = require('gulp-pug'),
    del          = require('del'),
    imagemin     = require('gulp-imagemin'),
    pngquant     = require('imagemin-pngquant'),
    cache        = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    px2rem       = require('gulp-px-to-rem'),
    sourcemaps   = require('gulp-sourcemaps'),
    babel        = require('gulp-babel'),
    plumber      = require('gulp-plumber');

gulp.task('browser-sync', function () { 
    browserSync({ 
        server: { 
            baseDir: 'app' 
        },
        notify: false
    });
});

gulp.task('html', function () {
    return gulp.src('app/pug/index.pug')
        .pipe(plumber())
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('app'))
});

gulp.task('sass', function () { 
    return gulp.src('app/sass/main.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(px2rem({ rootPX: 16 }))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        .pipe(cssnano())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('app/css'))
});

gulp.task('js', function () {
    return gulp.src('app/js/main.js')
        .pipe(plumber())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify()) 
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('app/js'));
});

gulp.task('watch', ['html','browser-sync', 'js'], function () {
    gulp.watch('app/sass/**/*.scss', ['sass']); // Наблюдение за sass файлами в папке sass
    gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('app/js/**/*.js', ['js', browserSync.reload]);   // Наблюдение за JS файлами в папке js
    gulp.watch('app/pug/**/*.pug', ['html']);
});

gulp.task('clean', function () {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function () {
    return gulp.src('app/img/**/*') // Берем все изображения из app
        .pipe(imagemin({ use: [pngquant()] }))
        .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('build', ['clean', 'img', 'sass', 'js', 'html'], function () {

    var buildCss = gulp.src([ // Переносим библиотеки в продакшен
        'app/css/main.min.css'
    ])
        .pipe(gulp.dest('dist/css'))

    var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
        .pipe(gulp.dest('dist/fonts'))

    var buildJs = gulp.src('app/js/main.min.js') // Переносим скрипты в продакшен
        .pipe(gulp.dest('dist/js'))

    var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
        .pipe(gulp.dest('dist'));

});

gulp.task('clear', function (callback) {
    return cache.clearAll();
})

gulp.task('default', ['watch']);

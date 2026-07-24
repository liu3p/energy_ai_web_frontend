import {dest, parallel, src} from 'gulp';
import gulpSass from 'gulp-sass';
import {resolve} from 'path';
import cleanCSS from 'gulp-clean-css';
import consola from 'consola';
import chalk from 'chalk';

const dartSass = require('sass');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');

const distFolder = resolve(__dirname, 'dist');
const noPrefixFile = /(index|base|display)/;

export function compileCss() {
    const sass = gulpSass(dartSass);
    return src(resolve(__dirname, 'src/*.scss'))
        .pipe(sass.sync({charset: false}))
        .pipe(autoprefixer({cascade: false}))
        .pipe(
            cleanCSS({}, details => {
                consola.success(
                    `${chalk.cyan(details.name)}: ${chalk.yellow(
                        details.stats.originalSize / 1000
                    )} KB -> ${chalk.green(details.stats.minifiedSize / 1000)} KB`
                );
            })
        )
        .pipe(
            rename(function (path: any) {
                if (!noPrefixFile.test(path.basename)) {
                    path.basename = `vis-${path.basename}`;
                }
            })
        )
        .pipe(dest(distFolder));
}

export function copyAssets() {
    return src(resolve(__dirname, 'src/assets/*')).pipe(dest(resolve(distFolder, 'assets')));
}

export default parallel(copyAssets, compileCss) as any;

const defineConfig = require('rollup').defineConfig;
// 使用 require 语法导入 Babel 插件
const babel = require('rollup-plugin-babel');
// 使用 require 语法导入 TypeScript 插件
const typescript = require('@rollup/plugin-typescript');
// 使用 require 语法导入 Node Resolve 插件
const resolve = require('@rollup/plugin-node-resolve');
// 使用 require 语法导入 CommonJS 插件
const commonjs = require('@rollup/plugin-commonjs');
const { terser } = require('rollup-plugin-terser');
// 使用 require 语法动态引入 package.json
const pkg = require('./package.json');

// 动态设置打包名称
const libName = pkg.name;
const banner = `/*!
 * ${libName}
 * ${pkg.description}
 * Author: ${pkg.author.name}
 * Email: ${pkg.author.email}
 * Repository: ${pkg.homepage}
 * Version: ${pkg.version}
 * License: ${pkg.license}
 */`;

module.exports = defineConfig({
    input: 'main/index.ts',
    output: [
        {
            file: `dist/${libName}.cjs.js`,
            format: 'cjs',
            banner,
            sourcemap: true,
        },
        {
            file: `dist/${libName}.es.js`,
            format: 'es',
            banner,
            sourcemap: true,
        },
        {
            file: `dist/${libName}.umd.js`,
            // UMD 格式，可以用于 Node 和浏览器等多个场景
            format: 'umd',
            name: libName,
            exports: 'named',
            banner,
            sourcemap: true,
        },
    ],
    plugins: [
        babel(),
        typescript({
            sourceMap: true,
            tsconfig: "./tsconfig.json", // 指定 tsconfig.json 文件的位置
            outDir: "./dist/types", // 声明文件将输出到这个目录，与 declarationDir 
        }),
        resolve(),
        commonjs(),
        terser()
    ],
});
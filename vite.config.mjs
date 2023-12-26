import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import mdx from '@mdx-js/rollup';
import fs from 'fs';
import { promisify } from 'util';
import globby from 'globby';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

export default ({ mode, command }) => {
  const buildDoc = mode === 'doc';
  const isProd = command === 'build';

  const baseURL = (() => {
    if (buildDoc) {
      return './';
    }
    if (!isProd) {
      return '/';
    }

    return '__BASE_PLACEHOLDER__';
  })();

  return defineConfig({
    base: baseURL,
    build: {
      target: ['chrome100'],
      sourcemap: isProd ? 'hidden' : true,
      outDir: buildDoc ? 'docs-dist' : 'dist',
    },
    resolve: {
      alias: [{ find: '@', replacement: path.join(__dirname, './src') }],
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          modifyVars: {
            hack: `true; @import "${process.cwd()}/src/assets/style/variable.less";`,
          },
        },
      },
    },
    plugins: [
      {
        enforce: 'pre',
        ...mdx(),
      },
      react(),
      svgr(),
      {
        async closeBundle() {
          if (buildDoc) {
            return;
          }
          const paths = await globby('dist', {
            expandDirectories: {
              extensions: ['html', 'css', 'js'],
            },
          });
          const tasks = paths.map(async (filepath) => {
            const buffer = await readFile(filepath);
            const content = buffer
              .toString()
              .replace(/\/__BASE_PLACEHOLDER__\/?/g, '');
            await writeFile(filepath, content);
          });
          await Promise.all(tasks);
        },
      },
    ],
  });
};

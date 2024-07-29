import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import mdx from '@mdx-js/rollup';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import remarkGfm from 'remark-gfm';

export default ({ mode, command }) => {
  const isDoc = mode === 'doc';
  const isProd = command === 'build';
  const base = isDoc ? './' : '/';

  return defineConfig({
    base,
    build: {
      target: ['chrome100'],
      sourcemap: isProd ? 'hidden' : true,
      outDir: isDoc ? 'docs-dist' : 'dist',
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
        ...mdx({
          remarkPlugins: [remarkGfm],
        }),
      },
      react(),
      svgr(),
      ViteEjsPlugin({
        base,
        isDoc,
      }),
    ],
  });
};

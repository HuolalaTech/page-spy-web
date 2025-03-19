import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import {
  remarkMdxCodeGroup,
  rehypeMdxSlug,
} from './scripts/unified/custom-plugin.mjs';

export default ({ mode, command }) => {
  const buildDoc = mode === 'doc';
  const isProd = command === 'build';

  return defineConfig({
    base: './',
    build: {
      target: ['chrome100'],
      sourcemap: isProd ? 'hidden' : true,
      outDir: buildDoc ? 'docs-dist' : 'dist',
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          if (warning.code === 'SOURCEMAP_ERROR') {
            return;
          }

          defaultHandler(warning);
        },
        output: {
          manualChunks: {
            react: ['react'],
            'react-dom': ['react-dom'],
            'react-router-dom': ['react-router-dom'],
          },
        },
      },
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
      mdx({
        remarkPlugins: [remarkGfm, remarkDirective, remarkMdxCodeGroup],
        rehypePlugins: [rehypeMdxSlug],
      }),
      react(),
      svgr(),
    ],
  });
};

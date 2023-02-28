import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default ({ mode }) => {
  const isProd = mode === 'production';

  return defineConfig({
    build: {
      target: ['chrome88', 'firefox86', 'safari14', 'edge89', 'ios14'],
      sourcemap: isProd ? 'hidden' : true,
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
    plugins: [react(), svgr()],
  });
};

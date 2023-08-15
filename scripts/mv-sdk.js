/* eslint-disable */
const fs = require('fs');
const path = require('path');

const root = process.cwd();

const pageSpy = require.resolve('@huolala-tech/page-spy');
const sourceMap = require.resolve('source-map');
const fileList = [
  {
    from: pageSpy,
    to: path.resolve(root, 'public/page-spy/index.min.js'),
  },
  {
    from: path.resolve(path.dirname(sourceMap), './dist/source-map.js'),
    to: path.resolve(root, 'public/source-map/source-map.min.js'),
  },
  {
    from: path.resolve(path.dirname(sourceMap), './lib/mappings.wasm'),
    to: path.resolve(root, 'public/source-map/mappings.wasm'),
  },
];

try {
  fileList.forEach(({ from, to }) => {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  });
} catch (e) {
  console.error(e);
  process.exit(1);
}

/* eslint-disable */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const targetDir = path.resolve(root, `public/page-spy`);

try {
  fs.mkdirSync(targetDir, { recursive: true });

  const src = require.resolve('@huolala-tech/page-spy');
  const dest = path.resolve(targetDir, 'index.min.js');
  fs.copyFileSync(src, dest);
} catch (e) {
  console.error('PageSpy sdk copy failed.');
  console.error(e);
  process.exit(1);
}

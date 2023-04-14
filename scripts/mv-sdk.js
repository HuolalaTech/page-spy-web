/* eslint-disable */
const fs = require('fs');
const path = require('path');
const sdkVersion = require('@huolala-tech/page-spy/package.json').version;

const root = process.cwd();
const content = fs.readFileSync(
  require.resolve('@huolala-tech/page-spy'),
  'utf8',
);
const targetDir = path.resolve(root, `public/page-spy@${sdkVersion}`);

try {
  fs.mkdirSync(targetDir, { recursive: true });

  const targetFile = path.resolve(targetDir, 'index.min.js');
  fs.writeFileSync(targetFile, content, {});
} catch (e) {
  console.error('PageSpy sdk copy failed.\n');
  console.error(e);
  process.exit(1);
}

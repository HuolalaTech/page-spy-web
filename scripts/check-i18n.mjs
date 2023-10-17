/* eslint-disable */
import fs from 'node:fs';
import { resolve, join } from 'node:path';
import _ from 'lodash-es';

console.log('\n| Start checking i18n ...\n');

class FileNotFound extends Error {
  name = 'FileNotFound';
}

const directory = resolve(process.cwd(), './src/assets/locales');

function flattenObject(obj, parentKey = '') {
  return _.transform(
    obj,
    (result, value, key) => {
      const newKey = parentKey ? `${parentKey}.${key}` : key;

      if (_.isObject(value)) {
        _.assign(result, flattenObject(value, newKey));
      } else {
        result[newKey] = value;
      }
    },
    {},
  );
}

fs.readdir(directory, (err, files) => {
  if (err) {
    throw new FileNotFound('The `/src/assets/locales` directory is not found');
  }

  const unionKeySet = new Set();

  const locales = files
    .filter((i) => i.endsWith('.json'))
    .map((i) => {
      const file = join(directory, i);
      const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
      // Get all chained keys
      const keys = _.keys(flattenObject(content));
      keys.forEach((i) => unionKeySet.add(i));
      return {
        filename: file,
        keys,
      };
    });

  const unionKeys = Array.from(unionKeySet);

  for (let i = 1; i < locales.length; i++) {
    const diff = _.difference(unionKeys, locales[i].keys);
    if (diff.length) {
      console.error(
        `The "${diff.join(' / ')}" in the ${locales[i].filename} is not ready.`,
      );
      process.exit(1);
    }
  }
  process.exit(0);
});

import { isString } from 'lodash-es';

export const formatSlug = (slug: string) => {
  if (!slug || !isString(slug)) return slug;

  return slug
    .trim()
    .replace(/[!"#$%&'()*+,/:;<=>?@[\\\]^_`{|}~]/g, '')
    .replace(/[\.\s]/g, '-');
};

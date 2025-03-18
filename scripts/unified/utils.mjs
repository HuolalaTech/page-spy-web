export const formatSlug = (slug) => {
  return slug
    .trim()
    .replace(/[!"#$%&'()*+,/:;<=>?@[\\\]^_`{|}~]/g, '')
    .replace(/[\.\s]/g, '-');
};

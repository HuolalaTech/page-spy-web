export const TextBlockTags = ['noscript', 'script', 'style'];

export function camelcaseToHypen(str: string) {
  const result: string[] = [];
  Object.values(str).forEach((s) => {
    if (/[A-Z]/.test(s)) {
      result.push('-');
    }
    result.push(s.toLowerCase());
  });

  return result.join('');
}

export function replaceProperties(prop: string) {
  if (prop === 'className') return 'class';
  return prop;
}

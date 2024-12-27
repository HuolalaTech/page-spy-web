export const flattenRecord = (value: Record<string, any>) => {
  const res: Record<string, any> = {};
  Object.entries(value).forEach(([key, val]) => {
    if (typeof val === 'object') {
      Object.entries(flattenRecord(val)).forEach(([k, v]) => {
        res[`${key}.${k}`] = v;
      });
    } else {
      res[key] = val;
    }
  });
  return res;
};

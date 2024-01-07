export const objectToFile = (object: any, filename: string) => {
  const blob = new Blob([JSON.stringify(object)], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const fileToObject = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result) return reject(new Error('File not found'));
      const json = JSON.parse(result as string);
      resolve(json);
    };
    reader.readAsText(file);
  });
};

export const hasAllKeys = (object: any, keys: string[]) => {
  const objectKeys = Object.keys(object);
  const hasAll = keys.every((key) => objectKeys.includes(key));
  return hasAll;
};

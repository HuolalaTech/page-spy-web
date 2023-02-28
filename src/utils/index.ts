export function getObjectKeys<T extends Record<string, any>>(data: T) {
  return Object.keys(data) as Exclude<keyof T, symbol>[];
}

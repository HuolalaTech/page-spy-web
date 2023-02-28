import { useSearchParams } from 'react-router-dom';

export default function useSearch<
  T extends string | string[] = string,
>(): Record<string, T> {
  const [searchParams] = useSearchParams();
  const list = [...searchParams];
  const result: Record<string, string | string[]> = {};
  for (const [key, value] of list) {
    if (!result[key]) {
      result[key] = value;
    } else {
      const prev = result[key];
      result[key] = typeof prev === 'string' ? [prev, value] : [...prev, value];
    }
  }
  return result as Record<string, T>;
}

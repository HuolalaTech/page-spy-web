import { SpyAtom, SpyConsole } from '@huolala-tech/page-spy/web';
import { isString, pullAt } from 'lodash-es';
import ConsoleNode from '../index';
import { getStyleObjectFromString } from './utils';
import { ReactNode, memo } from 'react';
import './index.less';

/**
 * %o or %O: <object>
 * %d: <number>
 * %i: <integer>
 * %s: <string>
 * %c: apply a CSS style to console output
 */
export const isPlaceholderNode = (item: SpyConsole.DataItem) => {
  if (
    ['log', 'info', 'error', 'warn'].includes(item.logType) &&
    item.logs.length > 1 &&
    item.logs[0].type === 'string' &&
    isString(item.logs[0].value)
  ) {
    return /%[discoO]/.test(item.logs[0].value);
  }
  return false;
};
const convertTypeValue = (value: unknown, placeholder: string) => {
  switch (placeholder) {
    case '%d':
      return Number(value);
    case '%i':
      return parseInt(String(value), 10);
    case '%s':
      return String(value);
    default:
      return value;
  }
};

/**
 * console.log(
 *   "I have %i %cpen%c, he has %d %capples%c. So the data expression is %O",
 *   1,
 *   "background: #5b8c00; color: black; padding: 1px 4px; border-radius: 4px;",
 *   "background: inherit; color: inherit;",
 *   2.5,
 *   "background: red; color: white; padding: 1px 4px; border-radius: 4px;",
 *   "background: inherit; color: inherit;",
 *   { me: '1 pen', him: '2.5 apples' }
 * )
 */
interface PlaceholderNodeProps {
  data: SpyAtom.Overview[];
}
export const PlaceholderNode = memo(({ data }: PlaceholderNodeProps) => {
  const [template, ...args] = data;
  if (template.type !== 'string' || !isString(template.value)) {
    return (
      <>
        {data.map((log) => {
          return <ConsoleNode data={log} key={log.id} />;
        })}
      </>
    );
  }
  /**
   * 1. Replace the primitive type value
   * Before: "I have %i %cpen%c, he has %d %capples%c. So the data expression is %O"
   * After: "I have 1 %cpen%c, he has 2.5 %capples%c. So the data expression is %O"
   */
  const substitutions = [...template.value.matchAll(/%[discoO]/g)];
  const primitiveVariableIndexes = substitutions
    .map((matched, index) => {
      if (/%[dis]/.test(matched[0]) && matched.index !== undefined) {
        return index;
      }
      return undefined;
    })
    .filter((i) => i !== undefined) as number[];

  const consumeIndexes = [...primitiveVariableIndexes];
  const newTemplate = template.value
    .split(/(%[dis])/g)
    .reduce((acc, fragment) => {
      if (/%[dis]/.test(fragment)) {
        const index = consumeIndexes.shift();
        if (index === undefined) return acc;
        return acc + convertTypeValue(args[index]?.value || '', fragment);
      }
      return acc + fragment;
    }, '');
  // remove the used variable
  pullAt(args, ...primitiveVariableIndexes);
  /**
   * 2. Replace the %c to apply style && Replace %[oO] to object data
   */
  // ["I have 1 ", "%c", "pen", "%c",",  he has 2.5 ", "%c", "apples", "%c", ". So the data expression is ", "%O", ""]
  const list = newTemplate.split(/(%[coO])/g).filter((i) => Boolean(i.trim()));

  let variable: SpyAtom.Overview | undefined;
  const result: ReactNode[] = [];
  list.forEach((str, index) => {
    if (/%[oO]/.test(str)) {
      variable = args.shift();
      if (variable) {
        result.push(<ConsoleNode data={variable} key={index} />);
      }
      variable = undefined;
      return;
    }
    if (/%c/.test(str)) {
      variable = args.shift();
    } else {
      if (variable === undefined) {
        result.push(<code key={index}>{str}</code>);
      } else if (/%c/.test(list[index - 1])) {
        result.push(
          <code
            key={index}
            style={getStyleObjectFromString(
              `display: inline-block; ${String(variable.value)}`,
            )}
          >
            {str}
          </code>,
        );
      }
    }
  });
  if (args.length) {
    args.forEach((i) => {
      result.push(<ConsoleNode data={i} key={i.id} />);
    });
  }
  return <code className="placeholder-node">{result}</code>;
});

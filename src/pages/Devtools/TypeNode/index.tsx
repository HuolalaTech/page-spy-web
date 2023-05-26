import clsx from 'clsx';
import { memo, useMemo, useState } from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import './index.less';
import CopyContent from '../ConsolePanel/components/CopyContent';

function shortTitle(data: any, max: number = 60) {
  const { constructor } = Object.getPrototypeOf(data);
  if ([Object, Array].indexOf(constructor) === -1) return null;

  const hasEllipsis = JSON.stringify(data).length > max ? '...' : '';
  const title = ['prefix', 'content', hasEllipsis, 'suffix'];
  if (constructor === Array) {
    const content = data.slice(0, 4).reduce((acc: string, cur: any) => {
      const curStr = JSON.stringify(cur);
      const result = `${acc}${curStr}, `;
      if (result.length > max) {
        return acc;
      }
      return result;
    }, '');
    title[0] = '[';
    title[1] = content;
    title[3] = ']';
  } else {
    const keys = Object.keys(data).slice(0, 4);
    const content = keys.reduce((acc, cur) => {
      const curVal = data[cur];
      const curStr = `${cur}: ${JSON.stringify(curVal)}`;
      const result = `${acc}${curStr}, `;
      if (result.length > max) {
        return acc;
      }
      return result;
    }, '');
    title[0] = '{';
    title[1] = content;
    title[3] = '}';
  }
  return title.join('');
}

interface TypeNodeProps {
  source: string;
  label?: string;
  spread?: boolean;
}
export const TypeNode = memo<TypeNodeProps>(
  ({ source, label = '', spread = false }) => {
    const [collapsed, setCollapsed] = useState(!spread);
    let data;
    try {
      data = JSON.parse(source);
    } catch (e) {
      data = `${source}`;
    }

    const labelContent = useMemo(() => {
      if (label) {
        return <code className="object-node__property-key">{label}: </code>;
      }
      return null;
    }, [label]);

    let className = '';
    const type = typeof data;
    const primitiveType = [
      'string',
      'number',
      'symbol',
      'boolean',
      'undefined',
    ];
    if (primitiveType.indexOf(type) > -1) {
      className = type;
    } else if (data === null) {
      className = 'null';
    }
    if (className) {
      return (
        <code>
          {labelContent && (
            <>
              <span style={{ opacity: 0 }}>
                <CaretRightOutlined />
              </span>
              {labelContent}
            </>
          )}
          <span className={clsx('type-node', className)}>
            <CopyContent content={`${data}`} rows={3} length={150} />
          </span>
        </code>
      );
    }

    if (type === 'function') {
      const text = `function ${data.name}() { }`;
      return (
        <code>
          {labelContent && (
            <>
              <span style={{ opacity: 0 }}>
                <CaretRightOutlined />
              </span>
              {labelContent}
            </>
          )}
          <span className={clsx('type-node', type)}>
            <CopyContent content={text} />
          </span>
        </code>
      );
    }

    const title = shortTitle(data);
    return (
      <div className="object-node">
        <div
          className="object-node__title"
          onClick={() => setCollapsed(!collapsed)}
        >
          <CaretRightOutlined
            className={clsx('spread-controller', {
              spread: !collapsed,
            })}
          />
          {labelContent}
          {(!label || collapsed) && <code>{title}</code>}
        </div>
        {!collapsed && (
          <div className="object-node__property">
            {Object.entries(data).map(([key, value]) => {
              return (
                <div key={key}>
                  <TypeNode label={key} source={JSON.stringify(value)} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

/* eslint-disable no-underscore-dangle */
import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import './index.less';
import clsx from 'classnames';
import CopyContent from '../CopyContent';
import { useWSInfo } from '../../../WSInfo';
import type { SpyAtom } from '@huolala-tech/page-spy';

function isAtomNode(data: SpyAtom.Overview) {
  return data && data.type === 'atom' && data.__atomId !== undefined;
}

interface GetterNodeProps {
  id: string;
  parentId: string;
  instanceId: string;
  keyName: string;
  descriptor: PropertyDescriptor;
  onChangeData: (key: string, data: SpyAtom.Overview) => void;
}
function GetterNode({
  id,
  parentId,
  instanceId,
  keyName,
  descriptor,
  onChangeData,
}: GetterNodeProps) {
  const { socket } = useWSInfo();
  useEffect(() => {
    if (socket) {
      socket.addListener(`atom-getter-${id}`, (data: SpyAtom.Overview) => {
        onChangeData(keyName, data);
      });
    }
    return () => {
      socket?.removeListener(`atom-getter-${id}`);
    };
  }, [id, keyName, onChangeData, socket]);

  const getPropertyValue = useCallback(
    (evt) => {
      if (!id) return;
      evt.stopPropagation();
      if (socket && descriptor.get) {
        socket.unicastMessage({
          type: 'atom-getter',
          data: {
            key: keyName,
            id,
            parentId,
            instanceId,
          },
        });
      }
    },
    [id, socket, descriptor, keyName, parentId, instanceId],
  );

  const PropertyValueContent = useMemo(() => {
    if (descriptor.value) {
      return <span className="property-value">{descriptor.value}</span>;
    }
    return (
      <span className="property-value ellipsis" onClick={getPropertyValue}>
        (...)
      </span>
    );
  }, [descriptor.value, getPropertyValue]);

  return (
    <>
      <span className="property-key" style={{ fontStyle: 'normal' }}>
        {keyName}:{' '}
      </span>
      {PropertyValueContent}
    </>
  );
}

const PrototypeKey = '[[Prototype]]';
interface AtomNodeProps {
  id: string;
  value: string | PropertyDescriptor | ReactNode;
  showArrow?: boolean;
}
function AtomNode({ id, value, showArrow = true }: AtomNodeProps) {
  const { socket } = useWSInfo();
  const [spread, setSpread] = useState(false);
  const [property, setProperty] = useState<Record<string, SpyAtom.Overview>>(
    {},
  );
  useEffect(() => {
    if (socket) {
      socket.addListener(`atom-detail-${id}`, (data: any) => {
        setProperty(data);
      });
    }
    return () => {
      socket?.removeListener(`atom-detail-${id}`);
    };
  }, [socket, id]);

  const PropertyPanel = useCallback(() => {
    let prototypeFlag = false;
    const propertyKeys = Object.keys(property).reduce<string[]>((acc, cur) => {
      if (cur === PrototypeKey) {
        prototypeFlag = true;
        return acc;
      }
      acc.push(cur);
      return acc;
    }, []);
    if (prototypeFlag) {
      propertyKeys.push(PrototypeKey);
    }
    if (propertyKeys.length === 0 || !spread) return null;

    return (
      <div className="property-panel">
        {propertyKeys.map((key) => {
          const propVal = property[key];
          // 区分 getOwnPropertyDescriptors 和 手动添加的 [[Prototype]] / length 等属性
          if (isAtomNode(propVal)) {
            const { value: propertyContent } = propVal;
            let arrow = true;
            let content = null;
            // 判断深层的对象
            if (typeof propertyContent === 'string') {
              content = (
                <>
                  <span
                    className="property-key"
                    style={{ fontStyle: 'normal' }}
                  >
                    {key}:{' '}
                  </span>
                  <span className="property-value">
                    <CopyContent content={propertyContent} />
                  </span>
                </>
              );
            } else if (!propertyContent.value && propertyContent.get) {
              arrow = false;
              content = (
                <GetterNode
                  key={key}
                  keyName={key}
                  id={propVal.__atomId!}
                  parentId={id}
                  instanceId={propVal.instanceId!}
                  descriptor={propVal.value as PropertyDescriptor}
                  onChangeData={(changedKey, changedData) => {
                    setProperty({
                      ...property,
                      [changedKey]: changedData,
                    });
                  }}
                />
              );
            } else {
              return (
                <div key={key} className="nested-console-node">
                  <ConsoleNode
                    data={{
                      ...propertyContent.value,
                      value: (
                        <>
                          <span
                            className="property-key"
                            style={{ fontStyle: 'normal' }}
                          >
                            {key}:{' '}
                          </span>
                          <span className="property-value">
                            <CopyContent
                              content={
                                propertyContent.value.value ||
                                String(propertyContent.value.value)
                              }
                            />
                          </span>
                        </>
                      ),
                    }}
                  />
                </div>
              );
            }
            return (
              <AtomNode
                key={key}
                id={propVal.__atomId!}
                value={content}
                showArrow={arrow}
              />
            );
          }
          return (
            <div key={key}>
              <code>
                <span className="property-key">
                  {key === '___proto___' ? '__proto__' : key}:{' '}
                </span>
                <span className="property-value">
                  <ConsoleNode data={{ ...propVal }} />
                </span>
              </code>
            </div>
          );
        })}
      </div>
    );
  }, [id, property, spread]);

  const getAtomDetail = useCallback(() => {
    if (!id) return;
    if (socket && Object.keys(property).length === 0) {
      socket.unicastMessage({
        type: 'atom-detail',
        data: id,
      });
    }
    setSpread(!spread);
  }, [socket, property, spread, id]);

  return (
    <div className="atom-node">
      <code className="console-node atom" onClick={getAtomDetail}>
        {showArrow && (
          <CaretRightOutlined
            className={clsx(['spread-controller', spread && 'spread'])}
          />
        )}
        <i>{value}</i>
      </code>
      <PropertyPanel />
    </div>
  );
}

interface ConsoleNodeProps {
  data: SpyAtom.Overview;
}
function ConsoleNode({ data }: ConsoleNodeProps) {
  const { __atomId = '', type, value } = data;
  if (type === 'atom' && !!__atomId) {
    return <AtomNode id={__atomId} value={value} />;
  }
  // new Boolean/String/Number...
  // { type: 'object', value: false }
  if (type === 'object') {
    const superName = value.constructor.name;

    return (
      <code className="console-node object">
        <CaretRightOutlined />
        <i>
          {`${superName} {`}
          <ConsoleNode
            data={{
              ...data,
              type: superName.toLowerCase() as SpyAtom.Overview['type'],
            }}
          />
          <span className="right-mustache">{'}'}</span>
        </i>
      </code>
    );
  }

  let className: string = type;
  if (type === 'debug-origin') {
    className = 'origin';
  }

  let node: any;
  if (React.isValidElement(value)) {
    node = value;
  } else {
    node = String(value);
    if (type === 'function') {
      node = <i>{node}</i>;
    }
  }

  return <code className={`console-node ${className}`}>{node || '""'}</code>;
}

export default ConsoleNode;

import { ConfigProvider, Radio, RadioChangeEvent, RadioGroupProps } from 'antd';
import { useState } from 'react';
import { SpyNetwork } from '@huolala-tech/page-spy-types';

export type NetworkType =
  | 'All'
  | 'Fetch/XHR'
  | 'CSS'
  | 'JS'
  | 'Img'
  | 'Socket'
  | 'Other';

export const RESOURCE_TYPE: Map<
  NetworkType,
  (type: SpyNetwork.RequestType) => boolean
> = new Map([
  ['All', (type) => /.*/.test(type)],
  [
    'Fetch/XHR',
    (type) => /(fetch|xhr|mp-request|mp-upload|eventsource)/.test(type),
  ],
  ['Socket', (type) => /(websocket)/.test(type)],
  ['CSS', (type) => /css/.test(type)],
  ['JS', (type) => /script/.test(type)],
  ['Img', (type) => /img/.test(type)],
  [
    'Other',
    (type) =>
      !/(fetch|xhr|mp-request|mp-upload|eventsource|css|script|img|audio|video)/.test(
        type,
      ),
  ],
]);

interface Props {
  size?: RadioGroupProps['size'];
  value?: NetworkType;
  onChange: (type: NetworkType) => void;
}

export const TypeFilter = ({
  size = 'middle',
  value = 'All',
  onChange,
}: Props) => {
  const [type, setType] = useState<NetworkType>(value);

  return (
    <ConfigProvider
      theme={{
        token: {
          fontSize: size === 'small' ? 12 : 14,
        },
      }}
    >
      <Radio.Group
        optionType="button"
        options={[...RESOURCE_TYPE.keys()].map((key) => {
          return { value: key, label: key };
        })}
        value={type}
        size={size}
        onChange={(e: RadioChangeEvent) => {
          const { value } = e.target;
          setType(value);
          onChange(value);
        }}
      />
    </ConfigProvider>
  );
};

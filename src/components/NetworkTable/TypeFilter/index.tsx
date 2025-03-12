import { ConfigProvider, Radio, RadioChangeEvent, RadioGroupProps } from 'antd';
import { NetworkType, RESOURCE_TYPE } from '..';
import { useState } from 'react';

interface Props {
  defaultValue?: NetworkType;
  size?: RadioGroupProps['size'];
  onChange: (type: NetworkType) => void;
}

export const TypeFilter = ({
  defaultValue = 'All',
  size = 'middle',
  onChange,
}: Props) => {
  const [type, setType] = useState<NetworkType>(() => {
    return RESOURCE_TYPE.get(defaultValue) ? defaultValue : 'All';
  });
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
        onChange={({ target: { value } }: RadioChangeEvent) => {
          setType(value);
          onChange(value);
        }}
      />
    </ConfigProvider>
  );
};

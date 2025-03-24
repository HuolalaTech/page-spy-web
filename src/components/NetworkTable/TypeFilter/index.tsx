import { ConfigProvider, Radio, RadioChangeEvent, RadioGroupProps } from 'antd';
import { NetworkType, RESOURCE_TYPE } from '..';
import { useEffect } from 'react';
import { useLocalStorageState } from 'ahooks';

interface Props {
  size?: RadioGroupProps['size'];
  onChange: (type: NetworkType) => void;
}

const NETWORK_TYPE_CACHE_KEY = 'page-spy-network-type';
export const TypeFilter = ({ size = 'middle', onChange }: Props) => {
  const [type, setType] = useLocalStorageState<NetworkType>(
    NETWORK_TYPE_CACHE_KEY,
    {
      defaultValue: 'All',
      serializer: (value) => value,
      deserializer: (value) => value as NetworkType,
    },
  );
  useEffect(() => {
    onChange(type!);
  }, [onChange, type]);
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

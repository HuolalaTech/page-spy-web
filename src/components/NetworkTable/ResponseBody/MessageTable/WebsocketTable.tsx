/* eslint-disable react/no-unstable-nested-components */
import { Column, TableCellProps } from 'react-virtualized';
import { MessageTable } from '.';
import Icon from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import ArrowUpSvg from '@/assets/image/arrow-up.svg?react';
import ArrowDownSvg from '@/assets/image/arrow-down.svg?react';
import { isNil } from 'lodash-es';

const { Text } = Typography;

interface WebsocketData {
  id: string;
  data: { type: 'send' | 'receive'; data: string; timestamp: number };
  timestamp: number;
}

export const WebsocketTable = ({ data }: { data: WebsocketData[] }) => {
  const tableData = useMemo(() => {
    return (data || [])
      .map((item) => {
        return {
          ...item,
          ...item.data,
        };
      })
      .filter((item) => !isNil(item.data));
  }, [data]);
  const DataColumn = ({ rowData }: TableCellProps) => {
    const isSend = rowData.type === 'send';
    return (
      <Flex align="center" gap={8} style={{ height: '100%' }}>
        <Icon
          component={isSend ? ArrowUpSvg : ArrowDownSvg}
          style={{ color: isSend ? '#B3261F' : '#156C2E', fontSize: 16 }}
        />
        <Text ellipsis>{rowData.data}</Text>
      </Flex>
    );
  };

  const LengthColumn = ({ rowData }: TableCellProps) => {
    return <Text ellipsis>{rowData.data.length}</Text>;
  };

  const TimeColumn = ({ rowData }: TableCellProps) => {
    return (
      <Text ellipsis>{dayjs(rowData.timestamp).format('HH:mm:ss:SSS')}</Text>
    );
  };

  return (
    <MessageTable type="websocket" data={tableData}>
      <Column
        dataKey="data"
        label="Data"
        width={200}
        flexGrow={1}
        cellRenderer={DataColumn}
      />
      <Column
        dataKey="length"
        label="Length"
        width={100}
        cellRenderer={LengthColumn}
      />
      <Column
        dataKey="timestamp"
        label="Time"
        width={120}
        cellRenderer={TimeColumn}
      />
    </MessageTable>
  );
};

import { Column, TableCellRenderer } from 'react-virtualized';
import { MessageTable } from '.';
import { Typography } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';
import { isNil } from 'lodash-es';

const { Text } = Typography;

interface EventsourceData {
  id: string;
  data: string;
  timestamp: number;
}

export const EventsourceTable = ({ data }: { data: EventsourceData[] }) => {
  const tableData = useMemo(() => {
    return data.filter((item) => !isNil(item.data));
  }, [data]);
  const IdColumn = useCallback<TableCellRenderer>(({ rowData }) => {
    return <Text ellipsis={{ tooltip: true }}>{rowData.id}</Text>;
  }, []);
  const DataColumn = useCallback<TableCellRenderer>(({ rowData }) => {
    return <Text ellipsis>{rowData.data}</Text>;
  }, []);

  const TimeColumn = useCallback<TableCellRenderer>(({ rowData }) => {
    return (
      <Text ellipsis>
        {rowData.timestamp
          ? dayjs(rowData.timestamp).format('HH:mm:ss:SSS')
          : ''}
      </Text>
    );
  }, []);

  return (
    <MessageTable type="eventsource" data={tableData}>
      <Column dataKey="id" label="Id" width={150} cellRenderer={IdColumn} />
      <Column
        dataKey="data"
        label="Data"
        width={400}
        flexGrow={1}
        cellRenderer={DataColumn}
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

import { Column, TableCellRenderer } from 'react-virtualized';
import { MessageTable } from '.';
import { Typography } from 'antd';
import dayjs from 'dayjs';
import { useCallback } from 'react';

const { Text } = Typography;

interface EventsourceData {
  id: string;
  data: string;
  timestamp: number;
}

export const EventsourceTable = ({ data }: { data: EventsourceData[] }) => {
  const IdColumn = useCallback<TableCellRenderer>(({ rowData }) => {
    return <Text ellipsis>{rowData.id}</Text>;
  }, []);
  const DataColumn = useCallback<TableCellRenderer>(({ rowData }) => {
    return <Text ellipsis>{rowData.data}</Text>;
  }, []);

  const TimeColumn = useCallback<TableCellRenderer>(({ cellData }) => {
    return <Text ellipsis>{dayjs(cellData).format('HH:mm:ss:SSS')}</Text>;
  }, []);

  return (
    <MessageTable type="eventsource" data={data}>
      <Column
        dataKey="id"
        label="Id"
        width={100}
        flexGrow={1}
        maxWidth={200}
        cellRenderer={IdColumn}
      />
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

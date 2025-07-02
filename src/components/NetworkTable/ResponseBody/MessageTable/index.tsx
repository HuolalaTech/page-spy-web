import { PropsWithChildren, ReactNode, useMemo, useRef, useState } from 'react';
import { AutoSizer, Table } from 'react-virtualized';
import { Select, Input, Empty } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import clsx from 'clsx';

const NoData = () => (
  <Empty description={false} className="empty-table-placeholder" />
);

interface DataItem {
  id: string;
  data: string;
  timestamp: number;
}

type Props =
  | {
      type: 'websocket';
      data: (DataItem & { type: 'send' | 'receive' })[];
    }
  | {
      type: 'eventsource';
      data: DataItem[];
    };

export const MessageTable = ({
  type,
  data,
  children,
}: PropsWithChildren<Props>) => {
  const [filterType, setFilterType] = useState('all');
  const [filterKeyword, setFilterKeyword] = useState('');
  const tableData = useMemo(() => {
    if (!data?.length) return [];

    let filteredData = data;
    if (type === 'websocket' && filterType !== 'all') {
      filteredData = data.filter((item) => item.type === filterType);
    }
    if (!filterKeyword) {
      return filteredData;
    }

    const filterRegex = new RegExp(filterKeyword);
    return filteredData.filter((item) => {
      return item.data.includes(filterKeyword) || item.data.match(filterRegex);
    });
  }, [data, filterKeyword, filterType, type]);

  const tableRef = useRef<Table | null>(null);
  const [activeRow, setActiveRow] = useState<DataItem | null>(null);

  return (
    <div className="message-table">
      <div className="message-table-header">
        <Select
          size="small"
          style={{ width: 100 }}
          variant="borderless"
          value={filterType}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Send', value: 'send' },
            { label: 'Receive', value: 'receive' },
          ]}
          onChange={(value) => {
            setFilterType(value);
          }}
        />
        <Input
          size="small"
          style={{ width: 400 }}
          variant="filled"
          value={filterKeyword}
          prefix={<FilterOutlined style={{ color: '#999' }} />}
          placeholder="Filter using regexp (example: (web)?socket)"
          onChange={(e) => {
            setFilterKeyword(e.target.value);
          }}
        />
      </div>
      <div className="message-table-body">
        <AutoSizer>
          {({ width, height }) => {
            return (
              <Table
                ref={tableRef}
                width={width}
                height={height}
                headerHeight={30}
                rowHeight={30}
                rowCount={data.length}
                rowGetter={({ index }) => tableData[index]}
                noRowsRenderer={NoData}
                rowClassName={({ index }) => {
                  if (index < 0) return '';
                  return clsx(index % 2 ? 'odd' : 'even', {
                    active: data[index].id === activeRow?.id,
                  });
                }}
                onRowClick={({ rowData }) => {
                  setActiveRow(rowData);
                }}
              >
                {children}
              </Table>
            );
          }}
        </AutoSizer>
      </div>
    </div>
  );
};

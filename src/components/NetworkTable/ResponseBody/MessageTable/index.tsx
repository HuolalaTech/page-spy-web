import { PropsWithChildren, ReactNode, useMemo, useRef, useState } from 'react';
import { AutoSizer, Table } from 'react-virtualized';
import { Select, Input, Empty, Drawer } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import ReactJsonView from '@huolala-tech/react-json-view';
import { useThrottle } from 'ahooks';

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
  const _filterKey = useThrottle(filterKeyword, {
    wait: 500,
    leading: true,
    trailing: true,
  });
  const tableData = useMemo(() => {
    if (!data?.length) return [];

    let filteredData = data.filter(Boolean);
    if (type === 'websocket' && filterType !== 'all') {
      filteredData = data.filter((item) => item.type === filterType);
    }
    if (!_filterKey) {
      return filteredData;
    }

    try {
      // eslint-disable-next-line no-eval
      const filterRegex = eval(`/${_filterKey}/`);
      return filteredData.filter((item) => {
        return item.data.includes(_filterKey) || item.data.match(filterRegex);
      });
    } catch (e) {
      return filteredData;
    }
  }, [data, _filterKey, filterType, type]);

  const tableRef = useRef<Table | null>(null);
  const [activeRow, setActiveRow] = useState<DataItem | null>(null);

  return (
    <div className="message-table">
      <div className="message-table-header">
        {type === 'websocket' && (
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
        )}
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
                rowCount={tableData.length}
                rowGetter={({ index }) => {
                  return tableData[index];
                }}
                noRowsRenderer={NoData}
                rowClassName={({ index }) => {
                  if (index < 0) return '';
                  return clsx(index % 2 ? 'odd' : 'even', {
                    active: tableData[index].id === activeRow?.id,
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
      <Drawer
        open={!!activeRow}
        onClose={() => setActiveRow(null)}
        title="Data"
        placement="bottom"
        getContainer={false}
      >
        {activeRow?.data ? (
          <ReactJsonView source={activeRow.data} />
        ) : (
          <Empty description={false} />
        )}
      </Drawer>
    </div>
  );
};

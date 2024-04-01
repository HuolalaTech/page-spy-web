import { useSocketMessageStore } from '@/store/socket-message';
import { SendOutlined } from '@ant-design/icons';
import { MethodType } from '@huolala-tech/page-spy-types/lib/mp-page';
import { AutoComplete, Button, Space } from 'antd';
import React, { useMemo, useState } from 'react';
import './index.less';
import { SpyConsole, SpyMessage } from '@huolala-tech/page-spy-types';
import { ConsoleItem } from '@/components/ConsoleItem';
import { uniqueId } from 'lodash-es';
import LogType from '@/components/LogType';

type Props = {
  methods: MethodType[];
  route?: string;
  sendUnicast: (type: SpyMessage.InteractiveType, data: any) => void;
};

const PageMethodPanel = (props: Props) => {
  const { methods, sendUnicast, route } = props;
  const methodResult = useSocketMessageStore((state) => state.mpMethodResult);
  const [log, setLog] = useState<string[]>();
  const [inputMethod, setInputMethod] = useState('');
  const callMethod = (name: string, params: any[] = []) => {
    sendUnicast('mp-page-method-call', {
      route,
      name,
      params,
    });
  };

  const methodList = useMemo(() => {
    function makeLog(type: SpyConsole.DataType, logs: any[]) {
      return {
        id: uniqueId(),
        time: Date.now(),
        logType: 'info' as SpyConsole.DataType,
        logs: logs.map((l) => {
          return {
            id: uniqueId(),
            type: typeof l,
            value: l,
          };
        }),
        url: route!,
      };
    }
    const res: SpyConsole.DataItem[] = [];
    res.push(makeLog('info', [`This page has below methods:`]));
    res.push(
      ...methods.map((m) => {
        return makeLog('info', [`function ${m.name}(${m.params.join(', ')})`]);
      }),
    );
    res.push(
      makeLog('info', [
        `Please input the method in the bottom input and call it.`,
      ]),
    );
    return res;
  }, [props.methods]);

  const logs = methodResult
    .filter((mr) => mr.result.route === props.route)
    .map((mr) => {
      return {
        id: mr.id,
        time: mr.result.time,
        logType: mr.result.error ? 'error' : ('log' as SpyConsole.DataType),
        logs: [
          {
            id: mr.id + 'name',
            type: 'string',
            value: mr.result.name,
          },
          {
            id: mr.id + 'result',
            type: typeof mr.result.result,
            value: mr.result.result,
          },
        ],
        url: route!,
      };
    });
  return (
    <div className="method-command-panel">
      <div className="method-log">
        {methodList.map((mlog) => {
          return <ConsoleItem key={mlog.id} data={mlog} />;
        })}
        {logs.map((mlog) => {
          return <ConsoleItem key={mlog.id} data={mlog} />;
        })}
      </div>
      <div className="method-command">
        <AutoComplete
          value={inputMethod}
          onChange={(v) => {
            setInputMethod(v);
          }}
          style={{ flex: 1, marginRight: 6 }}
          options={methods.map((m) => {
            return {
              label: m.name,
              value: m.name,
            };
          })}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={() => {
            callMethod(inputMethod);
          }}
        />
      </div>
    </div>
  );
};

export default PageMethodPanel;

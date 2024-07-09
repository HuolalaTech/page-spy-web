import { Row, Col } from 'antd';
import ConsoleNode from '../ConsoleNode';
import {
  ErrorTraceNode,
  getStackFramesIfErrorTrace,
  getStackFramesIfErrorConsole,
} from '../ConsoleNode/ErrorTrace';
import {
  isPlaceholderNode,
  PlaceholderNode,
} from '../ConsoleNode/PlaceholderNode';
import LogType from '../LogType';
import { SpyConsole } from '@huolala-tech/page-spy-types';
import { getLogUrl } from '@/utils';
import './index.less';
import Timestamp from '../Timestamp';
import { useMemo } from 'react';

interface Props {
  data: SpyConsole.DataItem;
}

export const ConsoleItem = ({ data }: Props) => {
  const content = useMemo(() => {
    if (isPlaceholderNode(data)) {
      return <PlaceholderNode data={data.logs} />;
    }
    const framesOfErrorTrace = getStackFramesIfErrorTrace(data);
    if (framesOfErrorTrace) {
      return <ErrorTraceNode data={framesOfErrorTrace} />;
    }
    return data.logs?.map((log) => {
      const framesOfErrorConsole = getStackFramesIfErrorConsole(log);
      if (framesOfErrorConsole) {
        return <ErrorTraceNode data={framesOfErrorConsole} key={log.id} />;
      }
      return <ConsoleNode data={log} key={log.id} />;
    });
  }, [data]);
  return (
    <div className={`console-item ${data.logType}`} key={data.id}>
      <div className="console-item__title">
        <LogType type={data.logType} />
      </div>
      <div className="console-item__content">
        <Row gutter={12} wrap={false}>
          <Col style={{ flexShrink: 0 }}>
            <Timestamp time={data.time} />
          </Col>
          <Col flex={1}>{content}</Col>
        </Row>
      </div>
      <div className="console-item__url" title={data.url}>
        {getLogUrl(data.url)}
      </div>
    </div>
  );
};

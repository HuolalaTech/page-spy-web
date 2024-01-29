import { Row, Col } from 'antd';
import ConsoleNode from '../ConsoleNode';
import { isErrorTraceNode, ErrorTraceNode } from '../ConsoleNode/ErrorTrace';
import {
  isPlaceholderNode,
  PlaceholderNode,
} from '../ConsoleNode/PlaceholderNode';
import LogType from '../LogType';
import { SpyConsole } from '@huolala-tech/page-spy-types';
import { getLogUrl } from '@/utils';
import './index.less';
import Timestamp from '../Timestamp';

interface Props {
  data: SpyConsole.DataItem;
}

export const ConsoleItem = ({ data }: Props) => {
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
          <Col flex={1}>
            {isPlaceholderNode(data) ? (
              <PlaceholderNode data={data.logs} />
            ) : isErrorTraceNode(data) ? (
              <ErrorTraceNode data={data} />
            ) : (
              data.logs?.map((log) => {
                return <ConsoleNode data={log} key={log.id} />;
              })
            )}
          </Col>
        </Row>
      </div>
      <div className="console-item__url" title={data.url}>
        {getLogUrl(data.url)}
      </div>
    </div>
  );
};

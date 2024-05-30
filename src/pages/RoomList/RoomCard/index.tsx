import { parseUserAgent } from '@/utils/brand';
import { Col, Tooltip, Row } from 'antd';
import clsx from 'clsx';
import { DebugButton } from '../DebugButton';
import { PropsWithChildren, memo } from 'react';

interface Props {
  room: I.SpyRoom;
}

const ConnDetailItem = ({
  title,
  children,
}: PropsWithChildren<{ title: string }>) => {
  return (
    <div className="conn-detail">
      <p className="conn-detail__title">{title}</p>
      <div className="conn-detail__value">{children}</div>
    </div>
  );
};

export const RoomCard = memo(
  ({ room }: Props) => {
    const { address, name, group, tags } = room;
    const decodeGroup = decodeURI(group);
    const simpleAddress = address.slice(0, 4);
    const { os, browser } = parseUserAgent(name);

    return (
      <div className={clsx('connection-item')}>
        <div className="connection-item__title">
          <code style={{ fontSize: 36 }}>
            <b>{simpleAddress}</b>
          </code>
          <Tooltip
            title={`Title: ${tags.title?.toString() || '--'}`}
            placement="right"
          >
            <div className="custom-title">{tags.title?.toString() || '--'}</div>
          </Tooltip>
        </div>
        <Row wrap={false} style={{ marginBlock: 8 }}>
          <Col flex={1}>
            <ConnDetailItem title="Project">
              <Tooltip title={decodeGroup}>
                <p style={{ fontSize: 16 }}>{decodeGroup}</p>
              </Tooltip>
            </ConnDetailItem>
          </Col>
          <Col flex={1}>
            <ConnDetailItem title="OS">
              <Tooltip title={`${os.name} ${os.version}`}>
                <img src={os.logo} alt="os logo" />
              </Tooltip>
            </ConnDetailItem>
          </Col>
          <Col flex={1}>
            <ConnDetailItem title="Browser">
              <Tooltip title={`${browser.name} ${browser.version}`}>
                <img src={browser.logo} alt="browser logo" />
              </Tooltip>
            </ConnDetailItem>
          </Col>
        </Row>
        <DebugButton room={room} />
      </div>
    );
  },
  ({ room: old }, { room: now }) => {
    if (
      old.name !== now.name ||
      old.group !== now.group ||
      old.address !== now.address ||
      old.tags.title !== now.tags.title ||
      old.connections.length !== now.connections.length
    )
      return false;
    return true;
  },
);

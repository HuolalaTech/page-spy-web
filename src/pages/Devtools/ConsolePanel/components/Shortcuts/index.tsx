import { usePopupRef, withPopup } from '@/utils/withPopup';
import { ReactComponent as KeyboardSvg } from '@/assets/image/keyboard.svg';
import Icon from '@ant-design/icons';
import { Col, Modal, Row, Space } from 'antd';
import { Fragment } from 'react';
import './index.less';

const shortcuts: {
  keys: string[];
  description: string;
  relation?: 'union' | 'intersection';
}[] = [
  {
    keys: ['Enter'],
    description: 'Run code',
  },
  {
    keys: ['Tabs'],
    description: 'Insert a tab (2 spaces)',
  },
  {
    keys: ['Shift', 'Enter'],
    relation: 'intersection',
    description: 'New line',
  },
  {
    keys: ['⌘', 'K'],
    relation: 'intersection',
    description: 'Clear panel',
  },
  {
    keys: ['Ctrl', 'L'],
    relation: 'intersection',
    description: 'Clear panel',
  },
  {
    keys: ['↑', '↓'],
    relation: 'union',
    description: 'Toggle history',
  },
];

const ShortcutsModal = withPopup(({ resolve, visible }) => {
  return (
    <Modal
      open={visible}
      title="Keyboard shortcuts"
      onCancel={resolve}
      onOk={resolve}
    >
      {shortcuts.map(({ keys, relation = 'intersection', description }) => {
        const relationSymbol = relation === 'union' ? 'or' : '+';
        const keySize = keys.length;
        return (
          <Row
            align="middle"
            key={description}
            gutter={20}
            wrap={false}
            className="shortcuts-item"
          >
            <Col className="shortcuts-item__desc">
              <span>{description}</span>
            </Col>
            <Col>
              <Space>
                {keys.map((k, index) => {
                  return (
                    <Fragment key={k}>
                      <div className="keyboard-button">{k}</div>
                      {keySize > 1 && index !== keySize - 1 && relationSymbol}
                    </Fragment>
                  );
                })}
              </Space>
            </Col>
          </Row>
        );
      })}
    </Modal>
  );
});

export const Shortcuts = () => {
  const modalRef = usePopupRef();

  return (
    <div className="console-keyboard-shortcuts">
      <Icon
        title="Keyboard shortcuts"
        component={KeyboardSvg}
        style={{ fontSize: 24, color: '#666' }}
        onClick={() => {
          modalRef.current?.popup();
        }}
      />
      <ShortcutsModal ref={modalRef} />
    </div>
  );
};

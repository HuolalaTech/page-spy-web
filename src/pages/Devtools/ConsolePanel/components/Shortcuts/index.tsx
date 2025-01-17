import { usePopupRef, withPopup } from '@/utils/withPopup';
import KeyboardSvg from '@/assets/image/keyboard.svg?react';
import Icon from '@ant-design/icons';
import { Col, Modal, Row, Space } from 'antd';
import { Fragment, memo, useMemo } from 'react';
import './index.less';
import { useTranslation } from 'react-i18next';

const ShortcutsModal = withPopup(({ resolve, visible }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'shortcuts' });

  const shortcuts: {
    keys: string[];
    description: string;
    relation?: 'union' | 'intersection';
  }[] = useMemo(() => {
    return [
      {
        keys: ['Enter'],
        description: t('enter'),
      },
      {
        keys: ['Tabs'],
        description: t('tab'),
      },
      {
        keys: ['Shift', 'Enter'],
        relation: 'intersection',
        description: t('shift+enter'),
      },
      {
        keys: ['⌘', 'K'],
        relation: 'intersection',
        description: t('cmd+k'),
      },
      {
        keys: ['Ctrl', 'L'],
        relation: 'intersection',
        description: t('ctrl+l'),
      },
      {
        keys: ['↑', '↓'],
        relation: 'union',
        description: t('updown'),
      },
    ];
  }, [t]);

  return (
    <Modal open={visible} title={t('title')} onCancel={resolve} onOk={resolve}>
      {shortcuts.map(({ keys, relation = 'intersection', description }) => {
        const relationSymbol = relation === 'union' ? 'or' : '+';
        const keySize = keys.length;
        return (
          <Row
            align="middle"
            key={keys.join('')}
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

export const Shortcuts = memo(() => {
  const { t } = useTranslation('translation', { keyPrefix: 'shortcuts' });
  const modalRef = usePopupRef();

  return (
    <div className="console-keyboard-shortcuts">
      <Icon
        title={t('title')!}
        component={KeyboardSvg}
        style={{ fontSize: 24, color: '#666' }}
        onClick={() => {
          modalRef.current?.popup();
        }}
      />
      <ShortcutsModal ref={modalRef} />
    </div>
  );
});

import { isCN } from '@/assets/locales';
import { usePopupRef, withPopup } from '@/utils/withPopup';
import { QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Space,
  Tooltip,
  Upload,
  message,
} from 'antd';
import { t } from 'i18next';
import { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

const getReplayUrl = (url: string) => {
  return `${location.protocol}//${window.DEPLOY_BASE_PATH}/#/replay?url=${url}#Console`;
};

const SelectResource = withPopup(({ visible, resolve }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const requestOnlineSource = useCallback(async () => {
    try {
      setLoading(true);
      const fieldValue = form.getFieldValue('online-link');
      const onlineLink = new URL(fieldValue).toString();
      const blob = await (await fetch(onlineLink)).blob();
      const objUrl = URL.createObjectURL(blob);
      const replayURL = getReplayUrl(objUrl);
      setTimeout(() => {
        window.open(replayURL);
      }, 50);
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [form]);

  return (
    <Modal
      open={visible}
      onCancel={resolve}
      title={t('replay.select-log')}
      footer={null}
    >
      <Form
        labelCol={{ span: 6 }}
        form={form}
        initialValues={{ isOnline: true }}
      >
        <Form.Item label={t('replay.log-type')} name="isOnline">
          <Radio.Group>
            <Radio value={true}>{t('replay.online-link')}</Radio>
            <Radio value={false}>{t('replay.local-file')}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          wrapperCol={{ offset: 6 }}
          shouldUpdate={(prev, next) => prev.isOnline !== next.isOnline}
        >
          {({ getFieldValue }) => {
            const isOnline = getFieldValue('isOnline');
            if (isOnline) {
              return (
                <Space direction="vertical" size="middle">
                  <Form.Item name="online-link" noStyle>
                    <Input.TextArea
                      style={{ width: 300 }}
                      placeholder={t('replay.online-link-tips')!}
                      rows={4}
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    onClick={requestOnlineSource}
                    loading={loading}
                  >
                    {t('common.search')}
                  </Button>
                </Space>
              );
            }
            return (
              <Upload
                accept=".json"
                maxCount={1}
                customRequest={async (file) => {
                  const url = URL.createObjectURL(file.file as File);
                  const replayURL = getReplayUrl(url);
                  setTimeout(() => {
                    window.open(replayURL);
                  }, 50);
                  return null;
                }}
                itemRender={() => null}
              >
                <Button type="primary" icon={<UploadOutlined />}>
                  {t('replay.local-file-tip')}
                </Button>
              </Upload>
            );
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
});

export const SelectLogButton = () => {
  const popRef = usePopupRef();

  return (
    <>
      <Button
        type="dashed"
        onClick={() => {
          popRef.current?.popup();
        }}
      >
        <Space>
          <span>{t('replay.title')}</span>
          <Tooltip
            title={
              <Trans i18nKey="replay.intro">
                <span>{`What's `}</span>
                <a
                  href={
                    isCN()
                      ? import.meta.env.VITE_WIKI_REPLAY_LOG_ZH
                      : import.meta.env.VITE_WIKI_REPLAY_LOG
                  }
                  target="_blank"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {t('replay.title')}
                </a>
              </Trans>
            }
          >
            <QuestionCircleOutlined />
          </Tooltip>
        </Space>
      </Button>
      <SelectResource ref={popRef} />
    </>
  );
};

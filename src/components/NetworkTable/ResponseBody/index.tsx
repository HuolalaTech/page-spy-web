import { ResolvedNetworkInfo } from '@/utils';
import { dataUrlToBlob, downloadFile, semanticSize } from '../utils';
import { withPopup, usePopupRef } from '@/utils/withPopup';
import { DownloadOutlined } from '@ant-design/icons';
import ReactJsonView from '@huolala-tech/react-json-view';
import { Form, message, Modal, Input, Alert, Button, Empty } from 'antd';
import { useMemo } from 'react';
import { EventsourceTable } from './MessageTable/EventsourceTable';
import { WebsocketTable } from './MessageTable/WebsocketTable';
import { isPlainObject } from 'lodash-es';

const FilenameModal = withPopup<void, string | false>(
  ({ visible, resolve }) => {
    const [form] = Form.useForm();
    const ok = () => {
      form.validateFields().then(({ filename }) => {
        const val = filename.trim();
        if (val) {
          resolve(val);
        } else {
          message.error('File name cannot be empty');
        }
      });
    };

    return (
      <Modal
        title="Download"
        visible={visible}
        onOk={ok}
        onCancel={() => {
          resolve(false);
        }}
      >
        <Form
          labelCol={{ span: 5 }}
          form={form}
          autoComplete="off"
          preserve={false}
        >
          <Form.Item
            label="Save as"
            name="filename"
            rules={[{ required: true, message: 'File name is required' }]}
          >
            <Input placeholder="Input file name" onPressEnter={ok} />
          </Form.Item>
        </Form>
      </Modal>
    );
  },
);

interface MediaWidgetProps {
  dataUrl: string;
}
const MediaWidget = ({ dataUrl }: MediaWidgetProps) => {
  const popupRef = usePopupRef<void, string | false>();
  // response ==> Blob
  const { blob, mime, data } = dataUrlToBlob(dataUrl);

  if (!blob || !mime) {
    return (
      <Alert
        message={
          <>
            <span>Auto load failed. Following is the origin data:</span>
            <br />
            <span>{String(data)}</span>
          </>
        }
        type="error"
      />
    );
  }

  const showModal = async () => {
    const filename = await popupRef.current?.popup();
    if (filename) {
      const url = URL.createObjectURL(blob);
      downloadFile(filename, url);
      URL.revokeObjectURL(url);
      message.success('Download success!');
    }
  };

  // image/jpeg / image/png .etc.
  if (mime.indexOf('image') > -1) {
    return <img src={dataUrl} className="response-blob-image" />;
  }
  return (
    <div className="media-widget">
      {[
        { label: 'File type: ', content: mime },
        {
          label: 'File size: ',
          content: semanticSize(blob.size),
        },
        {
          label: 'Save as: ',
          content: (
            <Button
              type="primary"
              onClick={showModal}
              size="small"
              icon={<DownloadOutlined />}
              style={{ marginLeft: 12 }}
            >
              Download
            </Button>
          ),
        },
      ].map(({ label, content }) => (
        <div className="content-item" key={label}>
          <b className="content-item__label">{label}</b>
          <span className="content-item__value">{content}</span>
        </div>
      ))}
      <FilenameModal ref={popupRef} />
    </div>
  );
};

interface ResponseBodyProps {
  data: ResolvedNetworkInfo;
}
export const ResponseBody = ({ data }: ResponseBodyProps) => {
  const bodyContent = useMemo(() => {
    // response ==> DataURL
    const { response, responseType, responseReason, requestType } = data;

    if (!response)
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={false}
          style={{ margin: '40px 0' }}
          imageStyle={{ height: 40 }}
        />
      );
    if (requestType === 'eventsource') {
      return (
        <EventsourceTable
          data={isPlainObject(response) ? [response] : response}
        />
      );
    }
    if (requestType === 'websocket') {
      return (
        <WebsocketTable
          data={isPlainObject(response) ? [response] : response}
        />
      );
    }
    if (['blob', 'arraybuffer'].includes(responseType)) {
      if (responseReason) {
        return <Alert type="error" message={responseReason} />;
      }
      return <MediaWidget dataUrl={response} />;
    }

    return (
      <div style={{ padding: 8 }}>
        <ReactJsonView source={response} defaultExpand={1} />
      </div>
    );
  }, [data]);

  return <div className="response-body">{bodyContent}</div>;
};

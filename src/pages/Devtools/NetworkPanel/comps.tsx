import React, { FC } from 'react';
import {
  Alert,
  Button,
  Form,
  Input,
  message,
  Modal,
  Space,
  Tooltip,
} from 'antd';
import { InfoCircleFilled, DownloadOutlined } from '@ant-design/icons';
import ReactJsonView from '@huolala-tech/react-json-view';
import { useState, useMemo } from 'react';
import { usePopupRef, withPopup } from '@/utils/withPopup';
import type { SpyNetwork } from '@huolala-tech/page-spy';
import clsx from 'clsx';
import { dataUrlToBlob, downloadFile, semanticSize } from './utils';
import { isString } from 'lodash-es';

export const EntriesBody: FC<{ data: [string, string][] }> = ({ data }) => {
  return (
    <div className="entries-body">
      {data.map(([label, value]) => {
        return (
          <div className="entries-item" key={label + value}>
            <b className="entries-item__label">{label}: &nbsp;</b>
            <span className="entries-item__value">
              <code>{value}</code>
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const StatusCode = ({ data }: { data: SpyNetwork.RequestInfo }) => {
  const { readyState, status } = data;
  let statusClass = '';
  let statusText = status;
  const code = Number(status);
  if (code < 200) {
    if (readyState <= 1) {
      statusClass = 'pending';
      statusText = 'Pending';
    } else {
      statusClass = 'error';
      statusText = 'Failed';
    }
  } else if (code < 300) {
    statusClass = 'success';
  } else if (code < 400) {
    statusClass = 'redirect';
  } else {
    statusClass = 'error';
  }
  return (
    <Space>
      <div className={clsx(['status-code-circle', statusClass])} />
      <b>{statusText}</b>
    </Space>
  );
};

export const PartOfHeader = () => (
  <Tooltip title="CAUTION: just part of headers are shown.">
    <InfoCircleFilled style={{ color: '#E9994B' }} />
  </Tooltip>
);

export const QueryParamsBlock: React.FC<{ data: [string, string][] }> = ({
  data,
}) => {
  const [decoded, setDecoded] = useState(true);
  const decodedData = useMemo(() => {
    if (!decoded) {
      return data.reduce((acc, [key, value]) => {
        acc.push([key, encodeURIComponent(value)]);
        return acc;
      }, [] as [string, string][]);
    }
    return data;
  }, [data, decoded]);

  const toggleText = useMemo(() => {
    return decoded ? 'view URL-encoded' : 'view decoded';
  }, [decoded]);

  return (
    <div className="detail-block">
      <Space className="detail-block__label">
        <span>Query String Parametes</span>
        <span
          onClick={() => setDecoded(!decoded)}
          style={{ fontWeight: 'normal', cursor: 'pointer' }}
        >
          {toggleText}
        </span>
      </Space>
      <div className="detail-block__content">
        <EntriesBody data={decodedData} />
      </div>
    </div>
  );
};

export const RequestPayloadBlock: React.FC<{
  data: string | [string, string][];
}> = ({ data }) => {
  const content = useMemo(() => {
    if (isString(data)) {
      return <ReactJsonView source={data} defaultExpand />;
    }
    return <EntriesBody data={data} />;
  }, [data]);
  return (
    <div className="detail-block">
      <b className="detail-block__label">Request Payload</b>
      <div className="detail-block__content">{content}</div>
    </div>
  );
};

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

export const ResponseBody = ({ data }: { data: SpyNetwork.RequestInfo }) => {
  const bodyContent = useMemo(() => {
    // response ==> DataURL
    const { response, responseType, responseReason } = data;

    if (!response) return null;
    if (['blob', 'arraybuffer'].includes(responseType)) {
      if (responseReason) {
        return <Alert type="error" message={responseReason} />;
      }
      return <MediaWidget dataUrl={response} />;
    }

    return <ReactJsonView source={response} defaultExpand={1} />;
  }, [data]);

  return <div className="response-body">{bodyContent}</div>;
};

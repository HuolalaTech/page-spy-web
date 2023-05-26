import React from 'react';
import {
  Alert,
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Space,
  Tooltip,
} from 'antd';
import { InfoCircleFilled, DownloadOutlined } from '@ant-design/icons';
import { TypeNode } from '../TypeNode';
import { useState, useMemo } from 'react';
import { getObjectKeys } from '@/utils';
import { usePopupRef, withPopup } from '@/utils/withPopup';
import type { SpyNetwork } from '@huolala-tech/page-spy';
import clsx from 'clsx';

export function getStatusText(row: SpyNetwork.RequestInfo) {
  if (row.readyState === 0 || row.readyState === 1) return 'Pending';
  if (row.readyState === 4) {
    if (row.status === 0) return 'Failed';
  }
  return row.status;
}

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

export function getTime(time: number) {
  if (time > 1000) {
    return `${(time / 1000).toFixed(1)} s`;
  }
  return `${time} ms`;
}

export function validValues(value: any) {
  return value !== null && getObjectKeys(value).length > 0 ? value : null;
}

export const PartOfHeader = () => (
  <Tooltip title="CAUTION: just part of headers are shown.">
    <InfoCircleFilled style={{ color: '#E9994B' }} />
  </Tooltip>
);

export const QueryParamsBlock: React.FC<Record<string, any>> = ({ data }) => {
  const [decoded, setDecoded] = useState(true);
  const decodedData = useMemo(() => {
    if (!decoded) {
      return Object.keys(data).reduce((acc, cur) => {
        acc[cur] = encodeURIComponent(data[cur]);
        return acc;
      }, {} as Record<string, string>);
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
        {Object.keys(decodedData).map((labelKey: any) => {
          return (
            <div className="content-item" key={labelKey}>
              <b className="content-item__label">{labelKey}: &nbsp;</b>
              <span className="content-item__value">
                <code>{decodedData[labelKey]}</code>
              </span>
            </div>
          );
        })}
      </div>
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

function downloadFile(filename: string, url: string) {
  const aTag = document.createElement('a');
  aTag.download = filename;
  aTag.href = url;
  document.body.append(aTag);
  aTag.click();
  aTag.remove();
}
function dataUrlToBlob(data: string) {
  try {
    const arr = data.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const rest = atob(arr[1]);
    let restLen = rest.length;
    const uint8List = new Uint8Array(restLen);
    // eslint-disable-next-line no-plusplus
    while (restLen--) {
      uint8List[restLen] = rest.charCodeAt(restLen);
    }
    return {
      blob: new Blob([uint8List], { type: mime }),
      mime,
    };
  } catch (e) {
    return {
      blob: null,
      mime: null,
      data,
    };
  }
}
function semanticSize(size: number) {
  if (size < 1024) return `${size} Byte`;
  const oneMB = 1024 * 1024;
  if (size < oneMB) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / oneMB).toFixed(1)} MB`;
}

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
    return <TypeNode source={JSON.stringify(response)} spread />;
  }, [data]);

  return <div className="response-body">{bodyContent}</div>;
};

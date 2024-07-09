import { checkRoomSecret } from '@/apis';
import { withPopup } from '@/utils/withPopup';
import { useRequest } from 'ahooks';
import { Button, Form, Input, Modal, message } from 'antd';
import { useTranslation } from 'react-i18next';

export interface IArgs {
  address: string;
}

export const SecretModal = withPopup<IArgs, string>(
  ({ resolve, reject, params, visible }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const { loading, run: requestCheckSecret } = useRequest(
      async () => {
        const secret = form.getFieldValue('secret');
        const { success } = await checkRoomSecret({
          address: params!.address,
          secret,
        });
        if (success) {
          resolve(secret);
        }
      },
      {
        manual: true,
        onError() {
          message.error(t('socket.invalid-secret'));
        },
      },
    );

    return (
      <Modal
        open={visible}
        title={t('socket.room-secret')}
        footer={null}
        maskClosable
        onCancel={() => {
          form.resetFields();
          reject(null);
        }}
        width="400px"
      >
        <Form
          form={form}
          labelCol={{ span: 4 }}
          style={{ marginTop: 24 }}
          onFinish={requestCheckSecret}
        >
          <Form.Item
            label={t('socket.secret')}
            name="secret"
            rules={[{ required: true }]}
          >
            <Input placeholder={t('socket.secret-placeholder')!} />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 4 }}>
            <Button type="primary" loading={loading} htmlType="submit">
              {t('common.confirm')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  },
);

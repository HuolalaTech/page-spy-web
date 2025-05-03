import React, { useState } from 'react';
import { Form, Input, Button, Card, Spin, Typography } from 'antd';
import { LockOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/utils/AuthContext';
import './style.less';

const { Text } = Typography;

const PasswordSetup: React.FC = () => {
  const { t } = useTranslation();
  const { setPassword, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // 处理表单提交
  const handleSubmit = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    setSubmitting(true);
    try {
      await setPassword(values.password);
    } finally {
      setSubmitting(false);
    }
  };

  // 验证两次密码是否一致
  const validateConfirmPassword = (_: any, value: string) => {
    const password = form.getFieldValue('password');
    if (!value || password === value) {
      return Promise.resolve();
    }
    return Promise.reject(
      new Error(t('auth.passwords_do_not_match') as string),
    );
  };

  return (
    <div className="password-setup-container">
      <Spin spinning={loading}>
        <Card
          title={t('auth.setup_password') as string}
          className="password-setup-card"
        >
          <div className="password-setup-desc-container">
            <Text className="password-setup-desc">
              {t('auth.setup_password_desc') as string}
            </Text>
          </div>

          <Form
            form={form}
            name="passwordSetup"
            onFinish={handleSubmit}
            layout="vertical"
          >
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: t('auth.please_enter_password') as string,
                },
                {
                  min: 6,
                  message: t('auth.password_too_short') as string,
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('auth.new_password') as string}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                {
                  required: true,
                  message: t('auth.please_confirm_password') as string,
                },
                {
                  validator: validateConfirmPassword,
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('auth.confirm_password') as string}
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                block
                size="large"
                icon={<SaveOutlined />}
              >
                {t('auth.set_password_button') as string}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default PasswordSetup;

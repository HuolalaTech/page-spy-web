import React, { useState } from 'react';
import { Form, Input, Button, Card, Spin, Flex, Tooltip } from 'antd';
import {
  InfoCircleOutlined,
  LockOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/utils/AuthContext';
import './style.less';

const AuthLogin: React.FC = () => {
  const { t } = useTranslation();
  const { login, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // 处理登录表单提交
  const handleSubmit = async (values: { password: string }) => {
    setSubmitting(true);
    try {
      await login(values.password);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-login-container">
      <Spin spinning={loading}>
        <Card
          title={
            <Flex align="center" gap={8}>
              <span>{t('auth.login_title')}</span>
              <Tooltip
                title={t('auth.login_title_desc') as string}
                placement="bottom"
              >
                <InfoCircleOutlined />
              </Tooltip>
            </Flex>
          }
          className="auth-login-card"
        >
          <Form name="login" onFinish={handleSubmit} layout="vertical">
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: t('auth.please_enter_password') as string,
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('auth.password') as string}
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
                icon={<LoginOutlined />}
              >
                {t('auth.login_button') as string}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default AuthLogin;

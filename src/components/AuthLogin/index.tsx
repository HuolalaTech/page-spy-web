import React, { useState } from 'react';
import { Form, Input, Button, Card, Spin, Typography } from 'antd';
import { LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/utils/AuthContext';
import './style.less';
import PasswordSetup from '../PasswordSetup';

const { Title, Text } = Typography;

const AuthLogin: React.FC = () => {
  const { t } = useTranslation();
  const { login, loading, needPasswordSetup } = useAuth();
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

  // 如果需要设置密码，显示密码设置组件
  if (needPasswordSetup) {
    return <PasswordSetup />;
  }

  return (
    <div className="auth-login-container">
      <Spin spinning={loading}>
        <Card
          title={t('auth.login_title') as string}
          className="auth-login-card"
        >
          <div className="login-welcome">
            <Text className="welcome-text">
              {t('auth.welcome_message')}
            </Text>
          </div>

          <Form
            name="login"
            initialValues={{ remember: true }}
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

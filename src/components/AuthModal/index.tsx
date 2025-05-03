import React, { useState } from 'react';
import { Modal, Form, Input, Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/auth-context';
import './index.less';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'setPassword';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode }) => {
  const { t } = useTranslation();
  const { login, setPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (mode === 'login') {
        const success = await login(values.password);
        if (success) {
          form.resetFields();
          onClose();
        }
      } else {
        if (values.password !== values.confirmPassword) {
          form.setFields([
            {
              name: 'confirmPassword',
              errors: [t('auth.password_not_match')],
            },
          ]);
          return;
        }

        const success = await setPassword(values.password);
        if (success) {
          form.resetFields();
          onClose();
        }
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === 'login' ? t('auth.login_title') : t('auth.initial_password_title');

  const description =
    mode === 'login' ? t('auth.login_desc') : t('auth.initial_password_desc');

  const buttonText =
    mode === 'login' ? t('auth.login_button') : t('auth.set_password_button');

  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={onClose}
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={null}
      className="auth-modal"
    >
      <p className="auth-modal-desc">{description}</p>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="password"
          label={t('auth.password')}
          rules={[
            { required: true, message: t('auth.password_required') },
            { min: 4, message: t('auth.password_min_length') },
          ]}
        >
          <Input.Password placeholder={t('auth.password_placeholder')} />
        </Form.Item>

        {mode === 'setPassword' && (
          <Form.Item
            name="confirmPassword"
            label={t('auth.confirm_password')}
            rules={[
              { required: true, message: t('auth.password_required') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t('auth.password_not_match')),
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder={t('auth.password_placeholder')} />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {buttonText}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AuthModal;

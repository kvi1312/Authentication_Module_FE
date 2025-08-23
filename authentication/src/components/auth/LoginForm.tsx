import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Checkbox, 
  Alert,
  Divider
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  SafetyOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useNavigationProtection } from '../../hooks/useNavigationProtection';
import toast from 'react-hot-toast';
const { Title, Text, Paragraph } = Typography;
interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}
const LoginForm: React.FC = () => {
  const [form] = Form.useForm();
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useNavigationProtection();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
  const onFinish = async (values: LoginFormData) => {
    try {
      clearError();
      await login({
        username: values.username,
        password: values.password,
        rememberMe: values.rememberMe,
        deviceInfo: navigator.userAgent,
      });
      toast.success('Login successful!');
      navigate(from, { replace: true });
      window.history.replaceState(null, '', from);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.error(errorMessage);
    }
  };
  return (
    <div className="auth-container">
      <Card 
        className="auth-card" 
        style={{ 
          maxWidth: '420px', 
          width: '100%',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          border: 'none'
        }}
      >
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
            }}>
              <SafetyOutlined style={{ fontSize: '40px', color: 'white' }} />
            </div>
          </div>
          <Title level={2} className="auth-title" style={{ textAlign: 'center', marginBottom: '8px' }}>
            Welcome back
          </Title>
          <Paragraph className="auth-subtitle" style={{ textAlign: 'center', color: '#666' }}>
            Sign in with user name and password. We'll automatically detect your account type.
          </Paragraph>
        </div>
        <Form
          form={form}
          name="login"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            rememberMe: false,
          }}
          className="auth-form"
        >
          {}
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Please input your username!' },
              { min: 3, message: 'Username must be at least 3 characters!' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#999' }} />}
              placeholder="Enter your username"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>
          {}
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#999' }} />}
              placeholder="Enter your password"
              size="large"
              style={{ borderRadius: '8px' }}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>
          {}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <Form.Item name="rememberMe" valuePropName="checked" style={{ margin: 0 }}>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Link to="/forgot-password">
              <Button type="link" size="small" style={{ padding: 0 }}>
                Forgot password?
              </Button>
            </Link>
          </div>
          {}
          {error && (
            <Form.Item>
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: '16px', borderRadius: '8px' }}
              />
            </Form.Item>
          )}
          {}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              className="gradient-btn"
              icon={!loading && <ArrowRightOutlined />}
              style={{ 
                height: '48px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Form.Item>
          {}
          <Divider>
            <Text type="secondary" style={{ fontSize: '14px' }}>New to AuthModule?</Text>
          </Divider>
          {}
          <div style={{ textAlign: 'center' }}>
            <Link to="/register">
              <Button 
                size="large" 
                block
                style={{ 
                  height: '48px',
                  borderRadius: '8px',
                  fontWeight: '500'
                }}
              >
                Create an account
              </Button>
            </Link>
          </div>
        </Form>
        {}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            🔒 Protected by advanced security measures including JWT tokens and role-based access control
          </Text>
        </div>
      </Card>
    </div>
  );
};
export default LoginForm;


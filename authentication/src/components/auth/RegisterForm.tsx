import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Alert,
  Row,
  Col,
  Divider,
  Steps,
  Progress
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  ArrowRightOutlined,
  CheckCircleOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useNavigationProtection } from '../../hooks/useNavigationProtection';
import toast from 'react-hot-toast';

const { Title, Text, Paragraph } = Typography;

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

const RegisterForm: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '', isValid: false });
  const { register: registerUser, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Enable navigation protection
  useNavigationProtection();

  const validatePasswordStrength = (password: string) => {
    let score = 0;
    let message = '';
    let isValid = false;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        message = 'Very Weak';
        break;
      case 2:
        message = 'Weak';
        break;
      case 3:
        message = 'Medium';
        isValid = true;
        break;
      case 4:
        message = 'Strong';
        isValid = true;
        break;
      case 5:
        message = 'Very Strong';
        isValid = true;
        break;
    }

    return { score, message, isValid };
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    const strength = validatePasswordStrength(password);
    setPasswordStrength(strength);
  };

  const onFinish = async (values: RegisterFormData) => {
    try {
      clearError();

      await registerUser({
        username: values.username,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        firstName: values.firstName,
        lastName: values.lastName,
      });

      toast.success('Registration successful! Please check your email to verify your account.');
      // Replace history to prevent back navigation to register form
      navigate('/login', { replace: true });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="auth-container">
      <Card 
        className="auth-card" 
        style={{ 
          maxWidth: '480px', 
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
              <UserAddOutlined style={{ fontSize: '40px', color: 'white' }} />
            </div>
          </div>
          <Title level={2} className="auth-title" style={{ textAlign: 'center', marginBottom: '8px' }}>
            Create Account
          </Title>
          <Paragraph className="auth-subtitle" style={{ textAlign: 'center', color: '#666' }}>
            Join us today and get started with your secure account
          </Paragraph>
        </div>

        {/* Progress Steps */}
        <div style={{ marginBottom: '32px' }}>
          <Steps
            size="small"
            current={0}
            items={[
              {
                title: 'Account Info',
                icon: <UserOutlined />,
              },
              {
                title: 'Verification',
                icon: <MailOutlined />,
              },
              {
                title: 'Complete',
                icon: <CheckCircleOutlined />,
              },
            ]}
          />
        </div>

        <Form
          form={form}
          name="register"
          layout="vertical"
          onFinish={onFinish}
          className="auth-form"
        >
          {/* Personal Information */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[
                  { required: true, message: 'Please input your first name!' },
                  { min: 2, message: 'First name must be at least 2 characters!' },
                ]}
              >
                <Input
                  placeholder="First name"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[
                  { required: true, message: 'Please input your last name!' },
                  { min: 2, message: 'Last name must be at least 2 characters!' },
                ]}
              >
                <Input
                  placeholder="Last name"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Username */}
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Please input your username!' },
              { min: 3, message: 'Username must be at least 3 characters!' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores!' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#999' }} />}
              placeholder="Choose a username"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#999' }} />}
              placeholder="Enter your email"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters!' },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#999' }} />}
              placeholder="Create a strong password"
              size="large"
              style={{ borderRadius: '8px' }}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              onChange={handlePasswordChange}
            />
          </Form.Item>

          {/* Password Strength Indicator */}
          <div style={{ marginBottom: '16px', marginTop: '-8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <Text style={{ fontSize: '12px', color: '#666' }}>Password Strength</Text>
              <Text style={{ fontSize: '12px', color: passwordStrength.score >= 4 ? '#52c41a' : '#ff4d4f' }}>
                {passwordStrength.score}/5
              </Text>
            </div>
            <Progress
              percent={(passwordStrength.score / 5) * 100}
              strokeColor={
                passwordStrength.score >= 4 ? '#52c41a' : 
                passwordStrength.score >= 3 ? '#faad14' : '#ff4d4f'
              }
              showInfo={false}
              size="small"
            />
            <Text style={{ 
              fontSize: '11px', 
              color: passwordStrength.score >= 4 ? '#52c41a' : '#ff4d4f',
              display: 'block',
              marginTop: '4px'
            }}>
              {passwordStrength.message}
            </Text>
          </div>

          {/* Confirm Password */}
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#999' }} />}
              placeholder="Confirm your password"
              size="large"
              style={{ borderRadius: '8px' }}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          {/* Error Message */}
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

          {/* Submit Button */}
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Form.Item>

          {/* Terms */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              By creating an account, you agree to our{' '}
              <Link to="/terms" style={{ color: '#1890ff' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" style={{ color: '#1890ff' }}>Privacy Policy</Link>
            </Text>
          </div>

          {/* Divider */}
          <Divider>
            <Text type="secondary" style={{ fontSize: '14px' }}>Already have an account?</Text>
          </Divider>

          {/* Login Link */}
          <div style={{ textAlign: 'center' }}>
            <Link to="/login">
              <Button 
                size="large" 
                block
                style={{ 
                  height: '48px',
                  borderRadius: '8px',
                  fontWeight: '500'
                }}
              >
                Sign in to existing account
              </Button>
            </Link>
          </div>
        </Form>

        {/* Help */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Need help? <Link to="/support" style={{ color: '#1890ff' }}>Contact Support</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default RegisterForm;

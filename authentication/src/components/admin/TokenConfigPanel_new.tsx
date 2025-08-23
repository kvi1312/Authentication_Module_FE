import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Slider,
  Button,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  Statistic,
  Tag,
  Modal,
  message,
  Divider
} from 'antd';
import {
  SettingOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

interface TokenConfig {
  accessTokenExpiryMinutes: number;
  refreshTokenExpiryDays: number;
  rememberMeTokenExpiryDays: number;
  lastUpdated?: string;
  updatedBy?: string;
}

interface TokenPreset {
  name: string;
  label: string;
  description: string;
  access: string;
  refresh: string;
  remember: string;
  config: {
    accessTokenExpiryMinutes: number;
    refreshTokenExpiryDays: number;
    rememberMeTokenExpiryDays: number;
  };
}

const TokenConfigPanel: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [currentConfig, setCurrentConfig] = useState<TokenConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Predefined presets based on requirements
  const presets: TokenPreset[] = [
    {
      name: 'very-short',
      label: 'Very Short',
      description: 'High security, frequent re-auth',
      access: '2 min',
      refresh: '30 min', 
      remember: '2.4 hours',
      config: { accessTokenExpiryMinutes: 2, refreshTokenExpiryDays: 0.02, rememberMeTokenExpiryDays: 0.1 }
    },
    {
      name: 'short',
      label: 'Short',
      description: 'Good security, moderate convenience',
      access: '5 min',
      refresh: '6 hours',
      remember: '1 day',
      config: { accessTokenExpiryMinutes: 5, refreshTokenExpiryDays: 0.25, rememberMeTokenExpiryDays: 1 }
    },
    {
      name: 'medium',
      label: 'Medium',
      description: 'Balanced security and convenience',
      access: '15 min',
      refresh: '1 day',
      remember: '1 week',
      config: { accessTokenExpiryMinutes: 15, refreshTokenExpiryDays: 1, rememberMeTokenExpiryDays: 7 }
    },
    {
      name: 'long',
      label: 'Long',
      description: 'High convenience, lower security',
      access: '1 hour',
      refresh: '1 week',
      remember: '1 month',
      config: { accessTokenExpiryMinutes: 60, refreshTokenExpiryDays: 7, rememberMeTokenExpiryDays: 30 }
    }
  ];

  // Check if user is SuperAdmin
  const isSuperAdmin = user?.roles?.includes('SuperAdmin') || user?.roles?.includes('Admin');

  useEffect(() => {
    if (isSuperAdmin) {
      fetchCurrentConfig();
    }
  }, [isSuperAdmin]);

  const fetchCurrentConfig = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/token-config');
      // const config = await response.json();
      
      // Mock data for now
      const config: TokenConfig = {
        accessTokenExpiryMinutes: 30,
        refreshTokenExpiryDays: 7,
        rememberMeTokenExpiryDays: 30,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'admin@authmodule.com'
      };
      
      setCurrentConfig(config);
      form.setFieldsValue(config);
    } catch (error) {
      message.error('Failed to fetch token configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = () => {
    setHasChanges(true);
  };

  const handleSaveConfig = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/token-config', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values)
      // });
      
      // Mock success
      const updatedConfig: TokenConfig = {
        ...values,
        lastUpdated: new Date().toISOString(),
        updatedBy: user?.email || 'admin'
      };
      
      setCurrentConfig(updatedConfig);
      setHasChanges(false);
      message.success('Token configuration updated successfully');
      
    } catch (error) {
      message.error('Failed to update token configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: TokenPreset) => {
    confirm({
      title: `Apply "${preset.label}" Preset?`,
      content: (
        <div>
          <Paragraph>This will change token lifetimes to:</Paragraph>
          <ul>
            <li><strong>Access Token:</strong> {preset.access}</li>
            <li><strong>Refresh Token:</strong> {preset.refresh}</li>
            <li><strong>Remember Me:</strong> {preset.remember}</li>
          </ul>
          <Alert 
            message="This is a runtime configuration change" 
            type="warning" 
            showIcon
            style={{ marginTop: 12 }}
          />
        </div>
      ),
      onOk: async () => {
        setLoading(true);
        try {
          // TODO: Replace with actual API call
          // await fetch(`/api/admin/token-config/preset/${preset.name}`, { method: 'POST' });
          
          const updatedConfig: TokenConfig = {
            ...preset.config,
            lastUpdated: new Date().toISOString(),
            updatedBy: user?.email || 'admin'
          };
          
          setCurrentConfig(updatedConfig);
          form.setFieldsValue(updatedConfig);
          setHasChanges(false);
          message.success(`Applied "${preset.label}" preset successfully`);
        } catch (error) {
          message.error('Failed to apply preset');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleReset = () => {
    confirm({
      title: 'Reset to Default Configuration?',
      content: 'This will restore token lifetimes to default values.',
      onOk: async () => {
        setLoading(true);
        try {
          // TODO: Replace with actual API call
          // await fetch('/api/admin/token-config/reset', { method: 'POST' });
          
          const defaultConfig: TokenConfig = {
            accessTokenExpiryMinutes: 30,
            refreshTokenExpiryDays: 7,
            rememberMeTokenExpiryDays: 30,
            lastUpdated: new Date().toISOString(),
            updatedBy: user?.email || 'admin'
          };
          
          setCurrentConfig(defaultConfig);
          form.setFieldsValue(defaultConfig);
          setHasChanges(false);
          message.success('Token configuration reset to default values');
        } catch (error) {
          message.error('Failed to reset configuration');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  if (!isSuperAdmin) {
    return (
      <Card>
        <Alert
          message="Access Denied"
          description="SuperAdmin role required to access token configuration."
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Card
        title={
          <Space>
            <SettingOutlined />
            <span>Token Configuration Management</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchCurrentConfig} loading={loading}>
              Refresh
            </Button>
          </Space>
        }
      >
        {/* Current Configuration Display */}
        {currentConfig && (
          <Alert
            message="Current Configuration"
            description={
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={8}>
                  <Statistic
                    title="Access Token"
                    value={currentConfig.accessTokenExpiryMinutes}
                    suffix="min"
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Refresh Token"
                    value={currentConfig.refreshTokenExpiryDays}
                    suffix="days"
                    prefix={<ReloadOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Remember Me"
                    value={currentConfig.rememberMeTokenExpiryDays}
                    suffix="days"
                    prefix={<HistoryOutlined />}
                  />
                </Col>
              </Row>
            }
            type="info"
            style={{ marginBottom: 24 }}
          />
        )}

        {/* Quick Presets */}
        <Card size="small" title="Quick Presets" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            {presets.map((preset) => (
              <Col xs={12} md={6} key={preset.name}>
                <Card
                  size="small"
                  hoverable
                  onClick={() => handleApplyPreset(preset)}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <Space direction="vertical" size="small">
                    <ThunderboltOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                    <Text strong>{preset.label}</Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {preset.description}
                    </Text>
                    <div>
                      <Tag size="small">{preset.access}</Tag>
                      <Tag size="small">{preset.refresh}</Tag>
                      <Tag size="small">{preset.remember}</Tag>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Manual Configuration Form */}
        <Card size="small" title="Manual Configuration">
          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleConfigChange}
          >
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  label="Access Token Lifetime (minutes)"
                  name="accessTokenExpiryMinutes"
                  rules={[
                    { required: true, message: 'Required' },
                    { type: 'number', min: 1, max: 60, message: 'Must be 1-60 minutes' }
                  ]}
                >
                  <Slider
                    min={1}
                    max={60}
                    marks={{ 1: '1m', 15: '15m', 30: '30m', 60: '1h' }}
                    tooltip={{ formatter: (value) => `${value} min` }}
                  />
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item
                  label="Refresh Token Lifetime (days)"
                  name="refreshTokenExpiryDays"
                  rules={[
                    { required: true, message: 'Required' },
                    { type: 'number', min: 0.01, max: 7, message: 'Must be 0.01-7 days' }
                  ]}
                >
                  <Slider
                    min={0.01}
                    max={7}
                    step={0.01}
                    marks={{ 0.01: '15m', 1: '1d', 3: '3d', 7: '1w' }}
                    tooltip={{ formatter: (value) => `${value} days` }}
                  />
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item
                  label="Remember Me Lifetime (days)"
                  name="rememberMeTokenExpiryDays"
                  rules={[
                    { required: true, message: 'Required' },
                    { type: 'number', min: 0.1, max: 30, message: 'Must be 0.1-30 days' }
                  ]}
                >
                  <Slider
                    min={0.1}
                    max={30}
                    step={0.1}
                    marks={{ 0.1: '2.4h', 1: '1d', 7: '1w', 30: '1m' }}
                    tooltip={{ formatter: (value) => `${value} days` }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          <Divider />

          <Row justify="space-between" align="middle">
            <Col>
              {currentConfig?.lastUpdated && (
                <Space>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Last updated: {new Date(currentConfig.lastUpdated).toLocaleString()}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    by {currentConfig.updatedBy}
                  </Text>
                </Space>
              )}
            </Col>
            
            <Col>
              <Space>
                <Button onClick={handleReset} disabled={loading}>
                  Reset to Default
                </Button>
                <Button
                  type="primary"
                  onClick={handleSaveConfig}
                  loading={loading}
                  disabled={!hasChanges}
                  icon={<CheckCircleOutlined />}
                >
                  Save Configuration
                </Button>
              </Space>
            </Col>
          </Row>

          {hasChanges && (
            <Alert
              message="You have unsaved changes"
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Card>
      </Card>
    </div>
  );
};

export default TokenConfigPanel;

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Form,
  Select,
  Button,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  Statistic,
  Tag,
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
import { tokenConfigService } from '../../services/tokenConfigService';
import type { TokenConfigResponse } from '../../types/auth.types';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Use TokenConfigResponse interface from types instead of local interface
// interface TokenConfig is replaced by TokenConfigResponse from types

// Access Token options: 1-60 minutes
const ACCESS_TOKEN_OPTIONS = [
  { value: 1, label: '1 min' },
  { value: 2, label: '2 min' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min (1 hour)' }
];

// Refresh Token options: 0.01-7 days (15 minutes to 1 week)
const REFRESH_TOKEN_OPTIONS = [
  { value: 0.01042, label: '15 min (0.01 day)' },
  { value: 0.02083, label: '30 min (0.02 day)' },
  { value: 0.04167, label: '1 hour (0.04 day)' },
  { value: 0.08333, label: '2 hours (0.08 day)' },
  { value: 0.25, label: '6 hours (0.25 day)' },
  { value: 0.5, label: '12 hours (0.5 day)' },
  { value: 1, label: '1 day' },
  { value: 2, label: '2 days' },
  { value: 3, label: '3 days' },
  { value: 7, label: '7 days (1 week)' }
];

// Remember Me Token options: 0.1-30 days (2.4 hours to 1 month)
const REMEMBER_TOKEN_OPTIONS = [
  { value: 0.1, label: '2.4 hours (0.1 day)' },
  { value: 0.25, label: '6 hours (0.25 day)' },
  { value: 0.5, label: '12 hours (0.5 day)' },
  { value: 1, label: '1 day' },
  { value: 2, label: '2 days' },
  { value: 3, label: '3 days' },
  { value: 7, label: '7 days (1 week)' },
  { value: 14, label: '14 days (2 weeks)' },
  { value: 30, label: '30 days (1 month)' }
];

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
  color: string;
  icon: React.ReactNode;
}

const TOKEN_PRESETS: TokenPreset[] = [
  {
    name: 'very-short',
    label: 'Very Short',
    description: 'High Security - Access 2min, Refresh 30min, Remember 2.4hrs',
    access: '2 min',
    refresh: '30 min',
    remember: '2.4 hours',
    config: {
      accessTokenExpiryMinutes: 2,
      refreshTokenExpiryDays: 0.02083, // 30 minutes
      rememberMeTokenExpiryDays: 0.1 // 2.4 hours
    },
    color: 'red',
    icon: <ThunderboltOutlined />
  },
  {
    name: 'short',
    label: 'Short',
    description: 'Balanced Security - Access 5min, Refresh 6hrs, Remember 1day',
    access: '5 min',
    refresh: '6 hours',
    remember: '1 day',
    config: {
      accessTokenExpiryMinutes: 5,
      refreshTokenExpiryDays: 0.25, // 6 hours
      rememberMeTokenExpiryDays: 1
    },
    color: 'orange',
    icon: <ClockCircleOutlined />
  },
  {
    name: 'medium',
    label: 'Medium',
    description: 'Default - Access 15min, Refresh 1day, Remember 1week',
    access: '15 min',
    refresh: '1 day',
    remember: '1 week',
    config: {
      accessTokenExpiryMinutes: 15,
      refreshTokenExpiryDays: 1,
      rememberMeTokenExpiryDays: 7
    },
    color: 'blue',
    icon: <CheckCircleOutlined />
  },
  {
    name: 'long',
    label: 'Long',
    description: 'Convenient - Access 1hr, Refresh 1week, Remember 1month',
    access: '1 hour',
    refresh: '1 week',
    remember: '1 month',
    config: {
      accessTokenExpiryMinutes: 60,
      refreshTokenExpiryDays: 7,
      rememberMeTokenExpiryDays: 30
    },
    color: 'green',
    icon: <HistoryOutlined />
  }
];

const TokenConfigPanel: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<TokenConfigResponse>({
    accessTokenExpiryMinutes: 30,
    refreshTokenExpiryDays: 1,
    rememberMeTokenExpiryDays: 7,
    accessTokenExpiryDisplay: '30 minutes',
    refreshTokenExpiryDisplay: '1 day',
    rememberMeTokenExpiryDisplay: '7 days'
  });
  const [selectedPreset, setSelectedPreset] = useState<string>('medium');

  // Load current configuration
  const loadCurrentConfig = useCallback(async () => {
    try {
      setLoading(true);
      // API call to get current config
      const response = await tokenConfigService.getCurrentConfig();
      setCurrentConfig(response);
      
      // Update form with current config
      form.setFieldsValue({
        accessTokenExpiryMinutes: response.accessTokenExpiryMinutes,
        refreshTokenExpiryDays: response.refreshTokenExpiryDays,
        rememberMeTokenExpiryDays: response.rememberMeTokenExpiryDays
      });
    } catch {
      message.error('Unable to load current configuration');
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    loadCurrentConfig();
  }, [loadCurrentConfig]);

  const handlePresetSelect = (preset: TokenPreset) => {
    setSelectedPreset(preset.name);
    form.setFieldsValue(preset.config);
  };

  const handleCustomChange = () => {
    setSelectedPreset('custom');
  };

  const handleSaveConfig = async (values: {
    accessTokenExpiryMinutes: number;
    refreshTokenExpiryDays: number;
    rememberMeTokenExpiryDays: number;
  }) => {
    if (!values.accessTokenExpiryMinutes || !values.refreshTokenExpiryDays || !values.rememberMeTokenExpiryDays) {
      message.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await tokenConfigService.updateConfig({
        accessTokenExpiryMinutes: values.accessTokenExpiryMinutes,
        refreshTokenExpiryDays: values.refreshTokenExpiryDays,
        rememberMeTokenExpiryDays: values.rememberMeTokenExpiryDays
      });
      
      if (response.config) {
        setCurrentConfig(response.config);
      }
      
      message.success(response.message || 'Token configuration updated successfully!');
      
      if (response.warning) {
        message.warning(response.warning);
      }
    } catch {
      message.error('Unable to update configuration');
    } finally {
      setLoading(false);
    }
  };

  const renderPresetCard = (preset: TokenPreset) => (
    <Card
      key={preset.name}
      size="small"
      hoverable
      onClick={() => handlePresetSelect(preset)}
      style={{
        borderColor: selectedPreset === preset.name ? '#1890ff' : undefined,
        borderWidth: selectedPreset === preset.name ? 2 : 1
      }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Space>
          <Tag color={preset.color}>{preset.icon}</Tag>
          <Text strong>{preset.label}</Text>
        </Space>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {preset.description}
        </Text>
        <Space direction="vertical" size="small">
          <Text style={{ fontSize: '11px' }}>
            <strong>Access:</strong> {preset.access}
          </Text>
          <Text style={{ fontSize: '11px' }}>
            <strong>Refresh:</strong> {preset.refresh}
          </Text>
          <Text style={{ fontSize: '11px' }}>
            <strong>Remember:</strong> {preset.remember}
          </Text>
        </Space>
      </Space>
    </Card>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <SettingOutlined /> JWT Token Configuration
      </Title>
      
      <Paragraph type="secondary">
        Manage token lifetimes in the system. Configuration changes will affect all new login sessions.
      </Paragraph>

      {/* Current Configuration Info */}
      <Card title="Current Configuration" style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic 
              title="Access Token" 
              value={currentConfig.accessTokenExpiryDisplay}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title="Refresh Token" 
              value={currentConfig.refreshTokenExpiryDisplay}
              prefix={<ReloadOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title="Remember Me Token" 
              value={currentConfig.rememberMeTokenExpiryDisplay}
              prefix={<HistoryOutlined />}
            />
          </Col>
        </Row>
        
        {currentConfig.lastUpdated && (
          <Alert
            style={{ marginTop: '16px' }}
            type="info"
            message={
              <Text>
                Last updated: {new Date(currentConfig.lastUpdated).toLocaleString('en-US')}
                {currentConfig.updatedBy && ` by ${currentConfig.updatedBy}`}
              </Text>
            }
          />
        )}
      </Card>

      {/* Preset Selection */}
      <Card title="Choose Preset Configuration" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          {TOKEN_PRESETS.map(preset => (
            <Col span={6} key={preset.name}>
              {renderPresetCard(preset)}
            </Col>
          ))}
        </Row>
      </Card>

      {/* Custom Configuration */}
      <Card title="Custom Configuration">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveConfig}
          initialValues={currentConfig}
          onFinishFailed={() => {
            // Form validation failed
          }}
        >
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="Access Token Lifetime (minutes)"
                name="accessTokenExpiryMinutes"
                rules={[
                  { required: true, message: 'Please select access token lifetime' }
                ]}
              >
                <Select
                  placeholder="Select access token lifetime"
                  onChange={handleCustomChange}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {ACCESS_TOKEN_OPTIONS.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                label="Refresh Token Lifetime (days)"
                name="refreshTokenExpiryDays"
                rules={[
                  { required: true, message: 'Please select refresh token lifetime' }
                ]}
              >
                <Select
                  placeholder="Select refresh token lifetime"
                  onChange={handleCustomChange}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {REFRESH_TOKEN_OPTIONS.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                label="Remember Me Token Lifetime (days)"
                name="rememberMeTokenExpiryDays"
                rules={[
                  { required: true, message: 'Please select remember me token lifetime' }
                ]}
              >
                <Select
                  placeholder="Select remember me token lifetime"
                  onChange={handleCustomChange}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {REMEMBER_TOKEN_OPTIONS.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Space>
            <Button 
              type="primary" 
              loading={loading}
              icon={<CheckCircleOutlined />}
              onClick={async () => {
                try {
                  const formValues = await form.validateFields();
                  await handleSaveConfig(formValues);
                } catch {
                  message.error('Please check all required fields');
                }
              }}
            >
              Apply Configuration
            </Button>
            <Button 
              onClick={loadCurrentConfig}
              icon={<ReloadOutlined />}
            >
              Reload
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default TokenConfigPanel;

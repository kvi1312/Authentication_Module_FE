import React from 'react';
import { Card, Tag, Typography, Space, Divider } from 'antd';
import { ClockCircleOutlined, SafetyOutlined, GlobalOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
const { Text } = Typography;
const SessionInfo: React.FC = () => {
  const { isAuthenticated, user, isRememberMeSession } = useAuth();
  if (!isAuthenticated || !user) {
    return null;
  }
  const getSessionTypeInfo = () => {
    const isRememberMe = isRememberMeSession();
    return {
      type: isRememberMe ? 'Remember Me' : 'Normal Session',
      color: isRememberMe ? 'green' : 'blue',
      icon: isRememberMe ? <GlobalOutlined /> : <ClockCircleOutlined />,
      description: isRememberMe 
        ? 'Your session will persist across browser restarts'
        : 'Your session will expire when you close the browser'
    };
  };
  const sessionInfo = getSessionTypeInfo();
  return (
    <Card 
      size="small" 
      style={{ marginBottom: 16 }}
      title={
        <Space>
          <SafetyOutlined />
          <span>Session Information</span>
        </Space>
      }
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div>
          <Text strong>User: </Text>
          <Text>{user.fullName} ({user.username})</Text>
        </div>
        <div>
          <Text strong>Session Type: </Text>
          <Tag color={sessionInfo.color} icon={sessionInfo.icon}>
            {sessionInfo.type}
          </Tag>
        </div>
        <Divider style={{ margin: '8px 0' }} />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {sessionInfo.description}
        </Text>
      </Space>
    </Card>
  );
};
export default SessionInfo;


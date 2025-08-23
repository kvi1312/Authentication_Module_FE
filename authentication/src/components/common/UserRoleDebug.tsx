import React from 'react';
import { Card, Typography, Tag, Space } from 'antd';
import { useAuth } from '../../hooks/useAuth';

const { Text } = Typography;

const UserRoleDebug: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isPartner, isEndUser } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <Card title="User Role Debug" style={{ marginBottom: 16 }}>
        <Text type="secondary">Not authenticated</Text>
      </Card>
    );
  }

  return (
    <Card title="User Role Debug" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Username: </Text>
          <Text>{user.username}</Text>
        </div>
        
        <div>
          <Text strong>User Type: </Text>
          <Text>{user.userType}</Text>
        </div>
        
        <div>
          <Text strong>Roles: </Text>
          <Space>
            {user.roles?.map(role => (
              <Tag key={role} color="blue">{role}</Tag>
            ))}
          </Space>
        </div>
        
        <div>
          <Text strong>Permissions: </Text>
          <Space>
            {isAdmin() && <Tag color="red">Admin ✓</Tag>}
            {isPartner() && <Tag color="orange">Partner ✓</Tag>}
            {isEndUser() && <Tag color="green">End User ✓</Tag>}
          </Space>
        </div>
        
        <div>
          <Text strong>Raw Check Results: </Text>
          <Space direction="vertical" size="small">
            <Text code>isAdmin(): {isAdmin().toString()}</Text>
            <Text code>isPartner(): {isPartner().toString()}</Text>
            <Text code>isEndUser(): {isEndUser().toString()}</Text>
          </Space>
        </div>
        
        <div>
          <Text strong>Can Access Admin Panel: </Text>
          <Tag color={isAdmin() ? 'green' : 'red'}>
            {isAdmin() ? 'Yes' : 'No'}
          </Tag>
        </div>
      </Space>
    </Card>
  );
};

export default UserRoleDebug;

import React from 'react';
import { 
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Space,
  Tag,
  Timeline,
  Descriptions
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CrownOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { USER_TYPE_LABELS } from '../utils/constants';
import type { UserInfo } from '../types/auth.types';
import MainLayout from '../components/layout/Layout';
import TokenCountdown from '../components/common/TokenCountdown';
import TokenConfigPanel from '../components/admin/TokenConfigPanel';
import SessionInfo from '../components/common/SessionInfo';

const { Content } = Layout;
const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const getUserTypeColor = (roles: string[]) => {
    if (roles?.includes('SuperAdmin') || roles?.includes('Admin')) return '#722ed1';
    if (roles?.includes('Partner')) return '#13c2c2';
    return '#1890ff';
  };

  const getUserTypeIcon = (roles: string[]) => {
    if (roles?.includes('SuperAdmin') || roles?.includes('Admin')) return <CrownOutlined />;
    if (roles?.includes('Partner')) return <StarOutlined />;
    return <UserOutlined />;
  };

  const getUserDisplayRole = (user: UserInfo | null) => {
    if (!user) return 'User';
    if (user.roles?.includes('SuperAdmin')) return 'Super Admin';
    if (user.roles?.includes('Admin')) return 'Admin';
    if (user.roles?.includes('Partner')) return 'Partner';
    return USER_TYPE_LABELS[user.userType as keyof typeof USER_TYPE_LABELS] || 'User';
  };

  const isAdmin = (user: UserInfo | null) => {
    return user?.roles?.includes('SuperAdmin') || user?.roles?.includes('Admin');
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <MainLayout>
      <Content style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Session Information */}
          <SessionInfo />
          
          {/* Token Status Section */}
          <TokenCountdown />

          <Row gutter={[24, 24]}>
            {/* Account Information */}
            <Col xs={24} lg={12}>
              <Card 
                title="Account Information" 
                style={{ height: '100%' }}
                extra={
                  <Tag 
                    icon={getUserTypeIcon(user?.roles || [])}
                    color={getUserTypeColor(user?.roles || [])}
                  >
                    {getUserDisplayRole(user)}
                  </Tag>
                }
              >
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <Avatar 
                    size={80} 
                    icon={<UserOutlined />}
                    style={{ marginBottom: '16px' }}
                  />
                  <Title level={4} style={{ margin: 0 }}>{user?.fullName}</Title>
                  <Text type="secondary">{user?.email}</Text>
                </div>

                <Descriptions column={1} size="small">
                  <Descriptions.Item label="User ID">
                    <Text copyable>{user?.id}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Username">
                    <Text strong>{user?.username}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <Text>{user?.email}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Full Name">
                    <Text>{user?.fullName}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="First Name">
                    <Text>{user?.firstName}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Name">
                    <Text>{user?.lastName}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Roles">
                    <Space>
                      {user?.roles?.map((role) => (
                        <Tag key={role} color="blue">{role}</Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="User Type">
                    <Text>{USER_TYPE_LABELS[user?.userType as keyof typeof USER_TYPE_LABELS] || 'Unknown'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={user?.isActive ? 'success' : 'warning'}>
                      {user?.isActive ? 'Active' : 'Inactive'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Login">
                    <Text>{formatDate(user?.lastLoginAt)}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Created Date">
                    <Text>{formatDate(user?.createdDate)}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Recent Activity */}
            <Col xs={24} lg={12}>
              <Card 
                title="Recent Activity" 
                style={{ height: '100%' }}
              >
                <Timeline
                  items={[
                    {
                      dot: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
                      children: (
                        <div>
                          <Text strong>Logged in</Text>
                          <br />
                          <Text type="secondary">Just now</Text>
                        </div>
                      ),
                    },
                    {
                      dot: <CheckOutlined style={{ color: '#52c41a' }} />,
                      children: (
                        <div>
                          <Text strong>Account created</Text>
                          <br />
                          <Text type="secondary">{formatDate(user?.createdDate)}</Text>
                        </div>
                      ),
                    },
                    {
                      dot: <UserOutlined style={{ color: '#722ed1' }} />,
                      children: (
                        <div>
                          <Text strong>Role assigned: {getUserDisplayRole(user)}</Text>
                          <br />
                          <Text type="secondary">System generated</Text>
                        </div>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>

          {/* Admin Token Configuration - Only show for Admin/SuperAdmin */}
          {isAdmin(user) && (
            <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
              <Col span={24}>
                <TokenConfigPanel />
              </Col>
            </Row>
          )}
        </div>
      </Content>
    </MainLayout>
  );
};

export default Dashboard;

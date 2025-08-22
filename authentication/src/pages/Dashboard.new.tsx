import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Statistic,
  Button,
  Space,
  Tag,
  Divider,
  Timeline,
  Progress,
  Alert
} from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  RocketOutlined,
  TeamOutlined,
  CheckOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  ArrowRightOutlined,
  CrownOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useAuth, usePermissions } from '../hooks/useAuth';
import { USER_TYPE_LABELS } from '../utils/constants';
import MainLayout from '../components/layout/Layout';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isPartner } = usePermissions();

  const quickActions = [
    {
      title: 'Profile Settings',
      description: 'Update your personal information and preferences',
      href: '/profile',
      icon: <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      show: true,
      color: '#1890ff'
    },
    {
      title: 'Admin Panel',
      description: 'Manage system configuration and users',
      href: '/admin',
      icon: <SettingOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      show: isAdmin,
      color: '#722ed1'
    },
    {
      title: 'Partner Portal',
      description: 'Access partner resources and analytics',
      href: '/partner',
      icon: <BarChartOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />,
      show: isPartner,
      color: '#13c2c2'
    },
    {
      title: 'Security Center',
      description: 'Manage tokens and security settings',
      href: '/admin/token-config',
      icon: <SafetyOutlined style={{ fontSize: '24px', color: '#fa541c' }} />,
      show: isAdmin,
      color: '#fa541c'
    },
  ].filter(action => action.show);

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'Admin': return '#722ed1';
      case 'Partner': return '#13c2c2';
      default: return '#1890ff';
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'Admin': return <CrownOutlined />;
      case 'Partner': return <StarOutlined />;
      default: return <UserOutlined />;
    }
  };

  return (
    <MainLayout>
      <Content style={{ padding: '24px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Welcome Hero Section */}
          <Card 
            style={{ 
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '16px',
              color: 'white'
            }}
            bodyStyle={{ padding: '40px' }}
          >
            <Row align="middle" gutter={[24, 24]}>
              <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
                <Avatar 
                  size={120} 
                  icon={<UserOutlined />}
                  style={{ 
                    border: '4px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                  }}
                />
              </Col>
              <Col xs={24} sm={18}>
                <Title level={1} style={{ color: 'white', marginBottom: '8px' }}>
                  Welcome back, {user?.firstName || 'User'}! 👋
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '16px' }}>
                  Great to see you again. Here's what's happening with your account today.
                </Paragraph>
                <Space>
                  <Tag 
                    icon={getUserTypeIcon(user ? USER_TYPE_LABELS[user.userType as keyof typeof USER_TYPE_LABELS] : 'User')}
                    color={getUserTypeColor(user ? USER_TYPE_LABELS[user.userType as keyof typeof USER_TYPE_LABELS] : 'User')}
                    style={{ padding: '4px 12px', fontSize: '14px' }}
                  >
                    {user ? USER_TYPE_LABELS[user.userType as keyof typeof USER_TYPE_LABELS] : 'User'}
                  </Tag>
                  <Tag 
                    icon={<CheckOutlined />}
                    color={user?.isActive ? 'success' : 'warning'}
                    style={{ padding: '4px 12px', fontSize: '14px' }}
                  >
                    {user?.isActive ? 'Active Account' : 'Inactive'}
                  </Tag>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Quick Actions */}
          <Card 
            title={
              <Space>
                <RocketOutlined style={{ color: '#1890ff' }} />
                <span>Quick Actions</span>
              </Space>
            }
            style={{ marginBottom: '24px', borderRadius: '12px' }}
            extra={<Button type="link" icon={<ArrowRightOutlined />}>View All</Button>}
          >
            <Row gutter={[16, 16]}>
              {quickActions.map((action, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Link to={action.href}>
                    <Card
                      hoverable
                      style={{
                        textAlign: 'center',
                        borderRadius: '12px',
                        border: `2px solid ${action.color}20`,
                        transition: 'all 0.3s ease'
                      }}
                      bodyStyle={{ padding: '24px 16px' }}
                    >
                      <div style={{ marginBottom: '16px' }}>
                        {action.icon}
                      </div>
                      <Title level={5} style={{ marginBottom: '8px' }}>
                        {action.title}
                      </Title>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {action.description}
                      </Text>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Statistics */}
          <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Statistic
                  title="Account Type"
                  value={user ? USER_TYPE_LABELS[user.userType as keyof typeof USER_TYPE_LABELS] : 'Unknown'}
                  prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Statistic
                  title="Security Score"
                  value={98}
                  suffix="%"
                  prefix={<SafetyOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                />
                <Progress percent={98} strokeColor="#52c41a" showInfo={false} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Statistic
                  title="Login Streak"
                  value={15}
                  suffix="days"
                  prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14', fontSize: '24px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Statistic
                  title="Session Time"
                  value={2.5}
                  suffix="hrs"
                  prefix={<ClockCircleOutlined style={{ color: '#13c2c2' }} />}
                  valueStyle={{ color: '#13c2c2', fontSize: '24px' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Recent Activity & Account Info */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <ClockCircleOutlined style={{ color: '#722ed1' }} />
                    <span>Recent Activity</span>
                  </Space>
                }
                style={{ borderRadius: '12px', height: '400px' }}
              >
                <Timeline
                  items={[
                    {
                      dot: <ThunderboltOutlined style={{ color: '#1890ff' }} />,
                      children: (
                        <div>
                          <Text strong>Logged in successfully</Text>
                          <br />
                          <Text type="secondary">{new Date().toLocaleTimeString()}</Text>
                        </div>
                      ),
                    },
                    {
                      dot: <UserOutlined style={{ color: '#52c41a' }} />,
                      children: (
                        <div>
                          <Text strong>Profile updated</Text>
                          <br />
                          <Text type="secondary">2 hours ago</Text>
                        </div>
                      ),
                    },
                    {
                      dot: <SafetyOutlined style={{ color: '#faad14' }} />,
                      children: (
                        <div>
                          <Text strong>Security check passed</Text>
                          <br />
                          <Text type="secondary">Yesterday</Text>
                        </div>
                      ),
                    },
                    {
                      dot: <TeamOutlined style={{ color: '#13c2c2' }} />,
                      children: (
                        <div>
                          <Text strong>Account created</Text>
                          <br />
                          <Text type="secondary">
                            {user?.createdDate 
                              ? new Date(user.createdDate).toLocaleDateString()
                              : 'Unknown'}
                          </Text>
                        </div>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <UserOutlined style={{ color: '#fa541c' }} />
                    <span>Account Information</span>
                  </Space>
                }
                style={{ borderRadius: '12px', height: '400px' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">Full Name</Text>
                    <br />
                    <Text strong>{user?.firstName} {user?.lastName}</Text>
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <div>
                    <Text type="secondary">Email Address</Text>
                    <br />
                    <Text strong>{user?.email}</Text>
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <div>
                    <Text type="secondary">Username</Text>
                    <br />
                    <Text strong>@{user?.username}</Text>
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <div>
                    <Text type="secondary">Last Login</Text>
                    <br />
                    <Text strong>
                      {user?.lastLoginAt 
                        ? new Date(user.lastLoginAt).toLocaleString()
                        : 'First time login'}
                    </Text>
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <Alert
                    message="Account Security"
                    description="Your account is protected with multi-layer security including JWT tokens and role-based access control."
                    type="success"
                    showIcon
                    style={{ borderRadius: '8px' }}
                  />
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </MainLayout>
  );
};

export default Dashboard;

import React, { useState } from 'react';
import { 
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Space,
  Descriptions,
  Tabs,
  Statistic,
  Badge
} from 'antd';
import {
  UserOutlined,
  DashboardOutlined,
  SettingOutlined,
  TeamOutlined,
  CrownOutlined,
  StarOutlined,
  CheckCircleOutlined,
  LoginOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { USER_TYPE_LABELS } from '../utils/constants';
import type { UserInfo } from '../types/auth.types';
import { Role } from '../types/auth.types';
import { getStringFromEnum } from '../utils/roleUtils';
import MainLayout from '../components/layout/Layout';
import TokenCountdown from '../components/common/TokenCountdown';
import TokenConfigPanel from '../components/admin/TokenConfigPanel';
import AdminUsersManagement from '../components/admin/AdminUsersManagement';
const { Content } = Layout;
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const getUserTypeColor = (roles: Role[]) => {
    if (roles?.includes(Role.SuperAdmin) || roles?.includes(Role.Admin)) return '#722ed1';
    if (roles?.includes(Role.Partner)) return '#13c2c2';
    return '#1890ff';
  };
  const getUserTypeIcon = (roles: Role[]) => {
    if (roles?.includes(Role.SuperAdmin) || roles?.includes(Role.Admin)) return <CrownOutlined />;
    if (roles?.includes(Role.Partner)) return <StarOutlined />;
    return <UserOutlined />;
  };
  const getUserDisplayRole = (user: UserInfo | null) => {
    if (!user || !user.roles || user.roles.length === 0) {
      return USER_TYPE_LABELS[user?.userType as keyof typeof USER_TYPE_LABELS] || 'User';
    }
    const rolePriority = [Role.SuperAdmin, Role.Admin, Role.Manager, Role.Employee, Role.Partner, Role.Customer, Role.Guest];
    for (const priority of rolePriority) {
      if (user.roles.includes(priority)) {
        return getStringFromEnum(priority);
      }
    }
    return getStringFromEnum(user.roles[0]);
  };
  const isAdmin = (user: UserInfo | null) => {
    return user?.roles?.includes(Role.SuperAdmin) || user?.roles?.includes(Role.Admin);
  };
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
    const OverviewContent = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <TokenCountdown />
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card size="small">
            <Statistic
              title="Account Status"
              value={user?.isActive ? "Active" : "Inactive"}
              prefix={<CheckCircleOutlined style={{ color: user?.isActive ? '#52c41a' : '#faad14' }} />}
              valueStyle={{ color: user?.isActive ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card size="small">
            <Statistic
              title="User Role"
              value={getUserDisplayRole(user)}
              prefix={getUserTypeIcon(user?.roles || [])}
              valueStyle={{ color: getUserTypeColor(user?.roles || []) }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card size="small">
            <Statistic
              title="Last Login"
              value={user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
              prefix={<LoginOutlined />}
              valueStyle={{ fontSize: '16px' }}
            />
          </Card>
        </Col>
      </Row>
      <Card title="Profile Information" size="small">
        <Row gutter={[24, 16]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Badge 
                count={getUserDisplayRole(user)} 
                style={{ backgroundColor: getUserTypeColor(user?.roles || []) }}
              >
                <Avatar 
                  size={80} 
                  icon={<UserOutlined />}
                  style={{ marginBottom: '8px' }}
                />
              </Badge>
              <div>
                <Typography.Title level={4} style={{ margin: '8px 0 4px' }}>
                  {user?.fullName}
                </Typography.Title>
                <Typography.Text type="secondary">{user?.email}</Typography.Text>
              </div>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered>
              <Descriptions.Item label="Username">{user?.username}</Descriptions.Item>
              <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
              <Descriptions.Item label="First Name">{user?.firstName}</Descriptions.Item>
              <Descriptions.Item label="Last Name">{user?.lastName}</Descriptions.Item>
              <Descriptions.Item label="User Type">
                {USER_TYPE_LABELS[user?.userType as keyof typeof USER_TYPE_LABELS] || 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {formatDate(user?.createdDate)}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>
    </Space>
  );
  const AdminContent = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <AdminUsersManagement />
    </Space>
  );
    const SettingsContent = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <TokenConfigPanel />
    </Space>
  );
  const tabItems = [
    {
      key: 'overview',
      label: (
        <Space>
          <DashboardOutlined />
          Overview
        </Space>
      ),
      children: <OverviewContent />
    },
    ...(isAdmin(user) ? [
      {
        key: 'users',
        label: (
          <Space>
            <TeamOutlined />
            User Management
          </Space>
        ),
        children: <AdminContent />
      },
      {
        key: 'settings',
        label: (
          <Space>
            <SettingOutlined />
            System Settings
          </Space>
        ),
        children: <SettingsContent />
      }
    ] : [])
  ];
  return (
    <MainLayout>
      <Content style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
            style={{ 
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
            tabBarStyle={{
              marginBottom: '24px',
              borderBottom: '2px solid #f0f0f0'
            }}
          />
        </div>
      </Content>
    </MainLayout>
  );
};
export default Dashboard;


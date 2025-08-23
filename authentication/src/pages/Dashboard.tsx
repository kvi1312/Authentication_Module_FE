import React, { useState } from 'react';
import { 
  Layout,
  Card,
  Row,
  Col,
  Space,
  Tabs,
  Statistic,
  Tag
} from 'antd';
import {
  DashboardOutlined,
  SettingOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  LoginOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import type { UserInfo } from '../types/auth.types';
import { Role } from '../types/auth.types';
import { getStringFromEnum, getRoleLevel } from '../utils/roleUtils';
import MainLayout from '../components/layout/Layout';
import TokenCountdown from '../components/common/TokenCountdown';
import TokenConfigPanel from '../components/admin/TokenConfigPanel';
import AdminUsersManagement from '../components/admin/AdminUsersManagement';
const { Content } = Layout;
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const getRoleColor = (role: Role): string => {
    switch (role) {
      case Role.SuperAdmin: return 'purple';
      case Role.Admin: return 'red';
      case Role.Manager: return 'green';
      case Role.Employee: return 'blue';
      case Role.Partner: return 'orange';
      case Role.Customer: return 'cyan';
      case Role.Guest: return 'default';
      default: return 'default';
    }
  };

  const renderRoles = (roles: Role[]) => {
    if (!roles || roles.length === 0) return <Tag color="default">No Roles</Tag>;
    
    const sortedRoles = roles.sort((a, b) => getRoleLevel(b) - getRoleLevel(a));
    return (
      <Space size={[0, 4]} wrap>
        {sortedRoles.map(role => (
          <Tag key={role} color={getRoleColor(role)}>
            {getStringFromEnum(role)}
          </Tag>
        ))}
      </Space>
    );
  };
  const isAdmin = (user: UserInfo | null) => {
    return user?.roles?.includes(Role.SuperAdmin) || user?.roles?.includes(Role.Admin);
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
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: '14px', color: '#8c8c8c' }}>User Roles</span>
              </div>
              <div>{renderRoles(user?.roles || [])}</div>
            </div>
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


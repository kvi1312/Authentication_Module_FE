import React, { useState } from 'react';
import { Tabs, Space } from 'antd';
import { UserOutlined, SettingOutlined } from '@ant-design/icons';
import TokenConfigPanel from '../components/admin/TokenConfigPanel';
import UserManagementSimple from '../components/admin/UserManagementSimple';
import MainLayout from '../components/layout/Layout';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');

  const tabItems = [
    {
      key: 'users',
      label: (
        <Space>
          <UserOutlined />
          User Management
        </Space>
      ),
      children: <UserManagementSimple />
    },
    {
      key: 'token-config',
      label: (
        <Space>
          <SettingOutlined />
          Token Configuration
        </Space>
      ),
      children: <TokenConfigPanel />
    }
  ];

  return (
    <MainLayout>
      <div style={{ padding: '24px', minHeight: '100vh', background: '#f0f2f5' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          style={{ 
            background: '#fff',
            borderRadius: '8px',
            padding: '16px'
          }}
        />
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;

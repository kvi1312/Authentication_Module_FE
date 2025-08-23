import React, { useState } from 'react';
import { Tabs, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import TokenConfigPanel from '../components/admin/TokenConfigPanel';
import MainLayout from '../components/layout/Layout';
const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('token-config');
  const tabItems = [
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


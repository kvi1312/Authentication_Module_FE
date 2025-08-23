import React from 'react';
import TokenConfigPanel from '../components/admin/TokenConfigPanel';
import MainLayout from '../components/layout/Layout';

const AdminDashboard: React.FC = () => {
  return (
    <MainLayout>
      <div style={{ padding: '24px', minHeight: '100vh', background: '#f0f2f5' }}>
        <TokenConfigPanel />
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;

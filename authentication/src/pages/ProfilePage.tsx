import React from 'react';
import { Layout as AntdLayout } from 'antd';
import Layout from '../components/layout/Layout';
import UserProfileEdit from '../components/common/UserProfileEdit';

const { Content } = AntdLayout;

const ProfilePage: React.FC = () => {
  return (
    <Layout>
      <Content style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <UserProfileEdit />
        </div>
      </Content>
    </Layout>
  );
};

export default ProfilePage;

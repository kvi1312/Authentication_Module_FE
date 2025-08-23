import React from 'react';
import { Layout as AntdLayout, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import UserProfileEdit from '../components/common/UserProfileEdit';
const { Content } = AntdLayout;
const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  return (
    <Layout>
      <Content style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {}
          <Button 
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToDashboard}
            style={{ 
              marginBottom: '24px',
              display: 'flex', 
              alignItems: 'center',
              padding: '8px',
              fontSize: '16px'
            }}
          >
            Back
          </Button>
          <UserProfileEdit />
        </div>
      </Content>
    </Layout>
  );
};
export default ProfilePage;


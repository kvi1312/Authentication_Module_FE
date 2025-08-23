import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Menu, 
  Avatar, 
  Space, 
  Button, 
  Typography
} from 'antd';
import {
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { APP_NAME } from '../../utils/constants';
import toast from 'react-hot-toast';
const { Header } = Layout;
const { Text } = Typography;
const Navigation: React.FC = () => {
  const { isAuthenticated, user, logout, isAdmin, isPartner } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  };
  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', show: isAuthenticated },
    { key: 'admin', label: 'Admin Panel', href: '/admin', show: isAuthenticated && isAdmin() },
    { key: 'partner', label: 'Partner Portal', href: '/partner', show: isAuthenticated && isPartner() },
  ].filter(item => item.show);
  return (
    <Header style={{ 
      background: '#fff', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
            {APP_NAME}
          </Text>
        </Link>
        {}
        {isAuthenticated && navigationItems.length > 0 && (
          <Menu
            mode="horizontal"
            style={{ 
              border: 'none', 
              marginLeft: '32px',
              flex: 1
            }}
            items={navigationItems.map(item => ({
              key: item.key,
              label: <Link to={item.href}>{item.label}</Link>
            }))}
          />
        )}
      </div>
      {}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isAuthenticated ? (
          <Space size="large">
            {}
            <Space style={{ cursor: 'pointer', padding: '8px' }} onClick={() => navigate('/profile')}>
              <Avatar icon={<UserOutlined />} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Text strong style={{ fontSize: '14px' }}>{user?.fullName}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {user?.email}
                </Text>
              </div>
            </Space>
            {}
            <Button 
              type="text" 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              danger
              style={{ 
                display: 'flex', 
                alignItems: 'center'
              }}
            />
          </Space>
        ) : (
          <Space>
            <Link to="/login">
              <Button type="text">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button type="primary">Sign up</Button>
            </Link>
          </Space>
        )}
      </div>
    </Header>
  );
};
export default Navigation;


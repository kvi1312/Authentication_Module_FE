import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Menu, 
  Dropdown, 
  Avatar, 
  Space, 
  Button, 
  Typography,
  Tag
} from 'antd';
import {
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useAuth, usePermissions } from '../../hooks/useAuth';
import { APP_NAME, USER_TYPE_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';
import type { UserInfo } from '../../types/auth.types';

const { Header } = Layout;
const { Text } = Typography;

const Navigation: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isAdmin, isPartner } = usePermissions();
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

  const getUserDisplayRole = (user: UserInfo | null) => {
    if (!user) return 'User';
    if (user.roles?.includes('SuperAdmin')) return 'Super Admin';
    if (user.roles?.includes('Admin')) return 'Admin';
    if (user.roles?.includes('Partner')) return 'Partner';
    return USER_TYPE_LABELS[user.userType as keyof typeof USER_TYPE_LABELS] || 'User';
  };

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ];

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', show: isAuthenticated },
    { key: 'admin', label: 'Admin Panel', href: '/admin', show: isAuthenticated && isAdmin },
    { key: 'partner', label: 'Partner Portal', href: '/partner', show: isAuthenticated && isPartner },
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
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
            {APP_NAME}
          </Text>
        </Link>
        
        {/* Navigation Menu */}
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

      {/* User Section */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isAuthenticated ? (
          <Dropdown
            menu={{ 
              items: menuItems.map(item => ({
                ...item,
                onClick: item.onClick || (() => {
                  if (item.key === 'profile') {
                    navigate('/profile');
                  }
                })
              }))
            }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Space style={{ cursor: 'pointer', padding: '8px' }}>
              <Avatar icon={<UserOutlined />} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Text strong style={{ fontSize: '14px' }}>{user?.fullName}</Text>
                <Tag color="blue" style={{ fontSize: '10px' }}>
                  {getUserDisplayRole(user)}
                </Tag>
              </div>
            </Space>
          </Dropdown>
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

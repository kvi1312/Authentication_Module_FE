import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  message, 
  Space, 
  Tag, 
  Modal,
  Input,
  Row,
  Col,
  Tooltip
} from 'antd';
import { 
  UserOutlined,
  EditOutlined,
  CrownOutlined,
  StarOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { UserType } from '../../types/auth.types';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: UserType;
  roles: string[];
  isActive: boolean;
  createdDate: string;
  lastLoginAt?: string;
}

const UserManagementSimple: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          firstName: 'System',
          lastName: 'Administrator',
          fullName: 'System Administrator',
          userType: UserType.Admin,
          roles: ['SuperAdmin', 'Admin'],
          isActive: true,
          createdDate: '2024-01-01T00:00:00Z',
          lastLoginAt: '2024-08-23T10:00:00Z'
        },
        {
          id: '2',
          username: 'partner',
          email: 'partner@example.com',
          firstName: 'Business',
          lastName: 'Partner',
          fullName: 'Business Partner',
          userType: UserType.Partner,
          roles: ['Partner'],
          isActive: true,
          createdDate: '2024-02-15T00:00:00Z',
          lastLoginAt: '2024-08-22T14:30:00Z'
        },
        {
          id: '3',
          username: 'user1',
          email: 'user1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          userType: UserType.EndUser,
          roles: ['EndUser'],
          isActive: true,
          createdDate: '2024-03-10T00:00:00Z',
          lastLoginAt: '2024-08-23T08:15:00Z'
        },
        {
          id: '4',
          username: 'user2',
          email: 'user2@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          fullName: 'Jane Smith',
          userType: UserType.EndUser,
          roles: ['EndUser'],
          isActive: true,
          createdDate: '2024-04-05T00:00:00Z'
        },
        {
          id: '5',
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          fullName: 'Test User',
          userType: UserType.EndUser,
          roles: ['EndUser'],
          isActive: false,
          createdDate: '2024-05-15T00:00:00Z'
        }
      ];
      
      setUsers(mockUsers);
      message.success('Users loaded successfully');
    } catch (error) {
      message.error('Failed to load users');
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeIcon = (userType: UserType) => {
    switch (userType) {
      case UserType.Admin:
        return <CrownOutlined style={{ color: '#722ed1' }} />;
      case UserType.Partner:
        return <StarOutlined style={{ color: '#13c2c2' }} />;
      default:
        return <UserOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getUserTypeLabel = (userType: UserType) => {
    switch (userType) {
      case UserType.Admin:
        return 'Admin';
      case UserType.Partner:
        return 'Partner';
      default:
        return 'End User';
    }
  };

  const getUserTypeColor = (userType: UserType) => {
    switch (userType) {
      case UserType.Admin:
        return 'purple';
      case UserType.Partner:
        return 'cyan';
      default:
        return 'blue';
    }
  };

  const handleEditUser = (user: User) => {
    Modal.info({
      title: 'Edit User Role',
      content: (
        <div>
          <p><strong>User:</strong> {user.fullName}</p>
          <p><strong>Current Role:</strong> {getUserTypeLabel(user.userType)}</p>
          <p>Role editing functionality will be implemented here.</p>
        </div>
      ),
    });
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<User> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space>
          {getUserTypeIcon(record.userType)}
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.fullName}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>@{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'User Type',
      key: 'userType',
      render: (_, record) => (
        <Tag color={getUserTypeColor(record.userType)}>
          {getUserTypeLabel(record.userType)}
        </Tag>
      ),
    },
    {
      title: 'Roles',
      key: 'roles',
      render: (_, record) => (
        <Space>
          {record.roles.map(role => (
            <Tag key={role} color="green">{role}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      key: 'lastLogin',
      render: (_, record) => (
        <span>
          {record.lastLoginAt 
            ? new Date(record.lastLoginAt).toLocaleDateString()
            : 'Never'
          }
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit User Role">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <UserOutlined />
          <span>User Management</span>
        </Space>
      }
      extra={
        <Space>
          <Button 
            icon={<ReloadOutlined />}
            onClick={loadUsers}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
      }
    >
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={12} md={8}>
          <Input.Search
            placeholder="Search users..."
            allowClear
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={16}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#666' }}>
              Total: {filteredUsers.length} users
            </span>
          </div>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} users`,
        }}
        scroll={{ x: 800 }}
      />
    </Card>
  );
};

export default UserManagementSimple;

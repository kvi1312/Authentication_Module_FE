import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Input,
  Select,
  Space,
  Button,
  Tag,
  message,
  Pagination,
  Row,
  Col,
  Tooltip,
  Typography,
  Avatar
} from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  EyeOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Role } from '../../types/auth.types';
import { getStringFromEnum, getRoleLevel } from '../../utils/roleUtils';
import type { UserInfo } from '../../types/auth.types';
import UserDetailsModal from './UserDetailsModal';
import UserRoleManagement from './UserRoleManagement';
const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;
interface UserTableParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  userType?: number;
  roleFilter?: number;
}
const AdminUsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Force re-render trigger
  const [params, setParams] = useState<UserTableParams>({
    pageNumber: 1,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<number | undefined>();
  const [roleFilter, setRoleFilter] = useState<number | undefined>();
  const loadUsers = useCallback(async (tableParams?: UserTableParams) => {
    setLoading(true);
    try {
      const currentParams = tableParams || params;
      const queryParams = new URLSearchParams();
      queryParams.append('pageNumber', currentParams.pageNumber.toString());
      queryParams.append('pageSize', currentParams.pageSize.toString());
      if (currentParams.searchTerm) {
        queryParams.append('searchTerm', currentParams.searchTerm);
      }
      if (currentParams.userType) {
        queryParams.append('userType', currentParams.userType.toString());
      }
      if (currentParams.roleFilter) {
        queryParams.append('roleFilter', currentParams.roleFilter.toString());
      }
      const token = localStorage.getItem('auth_access_token');
      const response = await fetch(`/api/user/all?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const convertedUsers: UserInfo[] = data.users.map((user: UserInfo) => ({
            ...user,
            roles: user.roles.map((role: string | number) => typeof role === 'string' ? parseInt(role) : role) as Role[],
            lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
            createdDate: new Date(user.createdDate)
          }));
          setUsers(convertedUsers);
          setTotalCount(data.totalCount);
        } else {
          message.error(data.message);
        }
      } else {
        message.error(`Failed to load users: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      message.error(err instanceof Error ? err.message : 'Error loading users');
    } finally {
      setLoading(false);
    }
  }, [params]);
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);
  const handleSearch = (value: string) => {
    const newParams = { ...params, searchTerm: value, pageNumber: 1 };
    setParams(newParams);
    setSearchTerm(value);
    loadUsers(newParams);
  };
  const handleUserTypeFilter = (value: number | undefined) => {
    const newParams = { ...params, userType: value, pageNumber: 1 };
    setParams(newParams);
    setUserTypeFilter(value);
    loadUsers(newParams);
  };
  const handleRoleFilter = (value: number | undefined) => {
    const newParams = { ...params, roleFilter: value, pageNumber: 1 };
    setParams(newParams);
    setRoleFilter(value);
    loadUsers(newParams);
  };
  const handleTableChange = (page: number, pageSize: number) => {
    const newParams = { ...params, pageNumber: page, pageSize };
    setParams(newParams);
    loadUsers(newParams);
  };
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
  const getUserTypeDisplay = (userType: number) => {
    switch (userType) {
      case 1: return <Tag color="blue">End User</Tag>;
      case 2: return <Tag color="red">Admin</Tag>;
      case 3: return <Tag color="green">Partner</Tag>;
      default: return <Tag color="default">Unknown</Tag>;
    }
  };
  const getStatusDisplay = (isActive: boolean) => {
    return isActive ? 
      <Tag color="success">Active</Tag> : 
      <Tag color="error">Inactive</Tag>;
  };
  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (record: UserInfo) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <Text strong>{record.username}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: true,
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      render: renderRoles,
    },
    {
      title: 'User Type',
      dataIndex: 'userType',
      key: 'userType',
      render: getUserTypeDisplay,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: getStatusDisplay,
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string) => {
        if (!date) return <Text type="secondary">Never</Text>;
        return new Date(date).toLocaleDateString();
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: UserInfo) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedUser(record);
                setUserModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Manage Roles">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => {
                setSelectedUser(record);
                setRoleModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  const clearFilters = () => {
    setSearchTerm('');
    setUserTypeFilter(undefined);
    setRoleFilter(undefined);
    const newParams = { pageNumber: 1, pageSize: 10 };
    setParams(newParams);
    loadUsers(newParams);
  };
  return (
    <Card title="Users Management">
      {}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Search users..."
            onSearch={handleSearch}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={6} md={4}>
          <Select
            placeholder="User Type"
            style={{ width: '100%' }}
            value={userTypeFilter}
            onChange={handleUserTypeFilter}
            allowClear
          >
            <Option value={1}>End User</Option>
            <Option value={2}>Admin</Option>
            <Option value={3}>Partner</Option>
          </Select>
        </Col>
        <Col xs={24} sm={6} md={4}>
          <Select
            placeholder="Role Filter"
            style={{ width: '100%' }}
            value={roleFilter}
            onChange={handleRoleFilter}
            allowClear
          >
            <Option value={Role.Customer}>Customer</Option>
            <Option value={Role.Admin}>Admin</Option>
            <Option value={Role.Manager}>Manager</Option>
            <Option value={Role.SuperAdmin}>Super Admin</Option>
            <Option value={Role.Employee}>Employee</Option>
            <Option value={Role.Partner}>Partner</Option>
            <Option value={Role.Guest}>Guest</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Space>
            <Button onClick={clearFilters}>Clear Filters</Button>
            <Button icon={<ReloadOutlined />} onClick={() => loadUsers()}>
              Refresh
            </Button>
          </Space>
        </Col>
      </Row>
      {}
      <Table
        key={`user-table-${refreshTrigger}`}
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={false}
        rowKey="id"
        scroll={{ x: 800 }}
      />
      {}
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Pagination
          current={params.pageNumber}
          pageSize={params.pageSize}
          total={totalCount}
          showSizeChanger
          showQuickJumper
          showTotal={(total, range) => 
            `${range[0]}-${range[1]} of ${total} users`
          }
          onChange={handleTableChange}
          onShowSizeChange={handleTableChange}
        />
      </div>
      {}
      <UserDetailsModal
        visible={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        user={selectedUser}
      />
      {}
      <UserRoleManagement
        visible={roleModalVisible}
        onCancel={() => setRoleModalVisible(false)}
        user={selectedUser}
        onRoleUpdate={async (updatedUser) => {
          // Update local state immediately for UI responsiveness
          setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
          setSelectedUser(updatedUser);
          
          // Force table re-render
          setRefreshTrigger(prev => prev + 1);
          
          // Reload users from server to ensure data consistency
          await loadUsers();
          
          message.success('User roles updated successfully');
        }}
      />
    </Card>
  );
};
export default AdminUsersManagement;


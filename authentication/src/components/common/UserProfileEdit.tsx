import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  message, 
  Space, 
  Typography, 
  Divider,
  Avatar,
  Row,
  Col,
  Tag
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  SaveOutlined, 
  CloseOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { getStringFromEnum, getRoleLevel } from '../../utils/roleUtils';
import type { Role } from '../../types/auth.types';
const { Title, Text } = Typography;
interface UpdateProfileRequest {
  email: string;
  firstName: string;
  lastName: string;
}
const UserProfileEdit: React.FC = () => {
  const { user, updateUserData } = useAuth();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const getRoleColor = (role: Role): string => {
    switch (role) {
      case 4: return 'purple'; // SuperAdmin
      case 2: return 'red';    // Admin
      case 3: return 'green';  // Manager
      case 5: return 'blue';   // Employee
      case 6: return 'orange'; // Partner
      case 1: return 'cyan';   // Customer
      case 7: return 'default'; // Guest
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
  const handleEdit = () => {
    if (user) {
      form.setFieldsValue({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      });
      setIsEditing(true);
    }
  };
  const handleCancel = () => {
    form.resetFields();
    setIsEditing(false);
  };
  const handleSave = async (values: UpdateProfileRequest) => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await userService.updateProfile(values);
      message.success('Profile updated successfully!');
      setIsEditing(false);
      if (response.user) {
        const updatedUser = {
          ...response.user,
          lastLoginAt: response.user.lastLoginAt ? new Date(response.user.lastLoginAt) : undefined,
          createdDate: new Date(response.user.createdDate),
          roles: response.user.roles.map(role => typeof role === 'string' ? parseInt(role) : role) as Role[]
        };
        updateUserData(updatedUser);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  if (!user) {
    return null;
  }
  return (
    <Card
      title={
        <Space>
          <UserOutlined />
          <span>User Profile</span>
        </Space>
      }
      extra={
        !isEditing && (
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={handleEdit}
          >
            Edit Profile
          </Button>
        )
      }
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <div style={{ textAlign: 'center' }}>
            <Avatar 
              size={120} 
              icon={<UserOutlined />}
              style={{ 
                backgroundColor: '#1890ff',
                marginBottom: '16px'
              }}
            />
            <Title level={4} style={{ margin: 0 }}>
              {user.fullName}
            </Title>
            <Text type="secondary">{user.email}</Text>
          </div>
        </Col>
        <Col xs={24} md={16}>
          {isEditing ? (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              autoComplete="off"
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[
                      { required: true, message: 'Please enter your first name' },
                      { min: 2, max: 50, message: 'First name must be between 2 and 50 characters' }
                    ]}
                  >
                    <Input placeholder="Enter first name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[
                      { required: true, message: 'Please enter your last name' },
                      { min: 2, max: 50, message: 'Last name must be between 2 and 50 characters' }
                    ]}
                  >
                    <Input placeholder="Enter last name" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />}
                    loading={loading}
                  >
                    Save Changes
                  </Button>
                  <Button 
                    onClick={handleCancel}
                    icon={<CloseOutlined />}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          ) : (
            <div>
              <Title level={5}>Profile Information</Title>
              <Divider />
              <Row gutter={[0, 16]}>
                <Col span={24}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Username:</Text>
                    <Text>{user.username}</Text>
                  </div>
                </Col>
                <Col span={24}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Email:</Text>
                    <Text>{user.email}</Text>
                  </div>
                </Col>
                <Col span={24}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>First Name:</Text>
                    <Text>{user.firstName}</Text>
                  </div>
                </Col>
                <Col span={24}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Last Name:</Text>
                    <Text>{user.lastName}</Text>
                  </div>
                </Col>
                <Col span={24}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Full Name:</Text>
                    <Text>{user.fullName}</Text>
                  </div>
                </Col>
                <Col span={24}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Roles:</Text>
                    <div>{renderRoles(user.roles || [])}</div>
                  </div>
                </Col>
                <Col span={24}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Account Type:</Text>
                    <Text>{user.userType === 0 ? 'Admin' : user.userType === 1 ? 'Partner' : 'End User'}</Text>
                  </div>
                </Col>
                <Col span={24}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Member Since:</Text>
                    <Text>{new Date(user.createdDate).toLocaleDateString()}</Text>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Col>
      </Row>
    </Card>
  );
};
export default UserProfileEdit;


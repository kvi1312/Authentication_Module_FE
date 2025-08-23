import React from 'react';
import {
  Modal,
  Descriptions,
  Space,
  Tag,
  Typography,
  Avatar,
  Divider,
  Card,
  Row,
  Col
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { Role } from '../../types/auth.types';
import { getStringFromEnum, getRoleLevel } from '../../utils/roleUtils';
import type { UserInfo } from '../../types/auth.types';
const { Text, Title } = Typography;
interface UserDetailsModalProps {
  visible: boolean;
  onCancel: () => void;
  user: UserInfo | null;
}
const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  visible,
  onCancel,
  user
}) => {
  if (!user) return null;
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
    if (!roles || roles.length === 0) {
      return <Tag color="default">No Roles</Tag>;
    }
    const sortedRoles = roles.sort((a, b) => getRoleLevel(b) - getRoleLevel(a));
    return (
      <Space size={[0, 4]} wrap>
        {sortedRoles.map(role => (
          <Tag key={role} color={getRoleColor(role)}>
            {getStringFromEnum(role)}
            <Text type="secondary" style={{ fontSize: '10px', marginLeft: 4 }}>
              (Lv.{getRoleLevel(role)})
            </Text>
          </Tag>
        ))}
      </Space>
    );
  };
  const getUserTypeDisplay = (userType: number) => {
    switch (userType) {
      case 1: return <Tag color="blue" icon={<UserOutlined />}>End User</Tag>;
      case 2: return <Tag color="red" icon={<UserOutlined />}>Admin</Tag>;
      case 3: return <Tag color="green" icon={<UserOutlined />}>Partner</Tag>;
      default: return <Tag color="default" icon={<UserOutlined />}>Unknown</Tag>;
    }
  };
  const getStatusDisplay = (isActive: boolean) => {
    return isActive ? (
      <Tag color="success" icon={<CheckCircleOutlined />}>Active</Tag>
    ) : (
      <Tag color="error" icon={<CloseCircleOutlined />}>Inactive</Tag>
    );
  };
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };
  const getHighestRole = (roles: Role[]) => {
    if (!roles || roles.length === 0) return null;
    return roles.reduce((highest, current) => 
      getRoleLevel(current) > getRoleLevel(highest) ? current : highest
    );
  };
  const highestRole = getHighestRole(user.roles);
  return (
    <Modal
      title={
        <Space>
          <Avatar size="large" icon={<UserOutlined />} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {user.fullName}
            </Title>
            <Text type="secondary">@{user.username}</Text>
          </div>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      {}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={8} style={{ textAlign: 'center' }}>
            <Avatar size={80} icon={<UserOutlined />} />
            <div style={{ marginTop: 8 }}>
              {highestRole && (
                <Tag color={getRoleColor(highestRole)} style={{ fontSize: '12px' }}>
                  {getStringFromEnum(highestRole)}
                </Tag>
              )}
            </div>
          </Col>
          <Col span={16}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <Text strong>Status: </Text>
                {getStatusDisplay(user.isActive)}
              </div>
              <div>
                <Text strong>User Type: </Text>
                {getUserTypeDisplay(user.userType)}
              </div>
              <div>
                <Text strong>Total Roles: </Text>
                <Text>{user.roles?.length || 0}</Text>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
      <Divider orientation="left">Personal Information</Divider>
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="User ID" span={2}>
          <Text copyable code style={{ fontSize: '12px' }}>
            {user.id}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label={<><MailOutlined /> Email</>}>
          <Text copyable>{user.email}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Username">
          <Text strong>@{user.username}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="First Name">
          <Text>{user.firstName}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Last Name">
          <Text>{user.lastName}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Full Name" span={2}>
          <Text strong>{user.fullName}</Text>
        </Descriptions.Item>
      </Descriptions>
      <Divider orientation="left">Role & Permissions</Divider>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="Assigned Roles">
          {renderRoles(user.roles)}
        </Descriptions.Item>
        <Descriptions.Item label="User Type">
          {getUserTypeDisplay(user.userType)}
        </Descriptions.Item>
        <Descriptions.Item label="Account Status">
          {getStatusDisplay(user.isActive)}
        </Descriptions.Item>
        {highestRole && (
          <Descriptions.Item label="Highest Role Level">
            <Space>
              <Tag color={getRoleColor(highestRole)}>
                {getStringFromEnum(highestRole)}
              </Tag>
              <Text type="secondary">Level {getRoleLevel(highestRole)}</Text>
            </Space>
          </Descriptions.Item>
        )}
      </Descriptions>
      <Divider orientation="left">Activity Information</Divider>
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label={<><CalendarOutlined /> Created Date</>}>
          <Text>{formatDate(user.createdDate)}</Text>
        </Descriptions.Item>
        <Descriptions.Item label={<><ClockCircleOutlined /> Last Login</>}>
          <Text>
            {user.lastLoginAt ? formatDate(user.lastLoginAt) : (
              <Text type="secondary">Never logged in</Text>
            )}
          </Text>
        </Descriptions.Item>
      </Descriptions>
      {}
      <Card size="small" style={{ marginTop: 16 }}>
        <Title level={5} style={{ marginBottom: 8 }}>
          Role Hierarchy Reference
        </Title>
        <Space size={[0, 4]} wrap>
          {Object.values(Role)
            .filter((role): role is Role => typeof role === 'number')
            .sort((a, b) => getRoleLevel(b) - getRoleLevel(a))
            .map(role => (
              <Tag 
                key={role} 
                color={getRoleColor(role)}
                style={{ fontSize: '11px' }}
              >
                {getStringFromEnum(role)} (Lv.{getRoleLevel(role)})
              </Tag>
            ))}
        </Space>
      </Card>
    </Modal>
  );
};
export default UserDetailsModal;


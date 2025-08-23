import React, { useState } from 'react';
import {
  Modal,
  Select,
  Space,
  Button,
  Tag,
  Typography,
  message,
  Divider,
  Row,
  Col,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Role } from '../../types/auth.types';
import { getStringFromEnum, getRoleLevel } from '../../utils/roleUtils';
import type { UserInfo } from '../../types/auth.types';
const { Option } = Select;
const { Text, Title } = Typography;
interface UserRoleManagementProps {
  visible: boolean;
  onCancel: () => void;
  user: UserInfo | null;
  onRoleUpdate: (updatedUser: UserInfo) => void;
}
const UserRoleManagement: React.FC<UserRoleManagementProps> = ({
  visible,
  onCancel,
  user,
  onRoleUpdate
}) => {
  const [selectedRolesToAdd, setSelectedRolesToAdd] = useState<Role[]>([]);
  const [selectedRolesToRemove, setSelectedRolesToRemove] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  if (!user) return null;
  const availableRolesToAdd = Object.values(Role).filter(
    (role): role is Role => 
      typeof role === 'number' && !user.roles.includes(role)
  );
  const availableRolesToRemove = user.roles || [];
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
  const handleAddRoles = async () => {
    if (selectedRolesToAdd.length === 0) {
      message.warning('Please select roles to add');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_access_token');
      const response = await fetch(`/api/user/${user.id}/roles/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rolesToAdd: selectedRolesToAdd
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          message.success(data.message);
          onRoleUpdate(data.user);
          setSelectedRolesToAdd([]);
        } else {
          message.error(data.message);
        }
      } else {
        message.error('Failed to add roles');
      }
    } catch (err) {
      console.error('Error adding roles:', err);
      message.error(err instanceof Error ? err.message : 'Error adding roles');
    } finally {
      setLoading(false);
    }
  };
  const handleRemoveRoles = async () => {
    if (selectedRolesToRemove.length === 0) {
      message.warning('Please select roles to remove');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_access_token');
      const response = await fetch(`/api/user/${user.id}/roles/remove`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rolesToRemove: selectedRolesToRemove
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          message.success(data.message);
          onRoleUpdate(data.user);
          setSelectedRolesToRemove([]);
        } else {
          message.error(data.message);
        }
      } else {
        message.error('Failed to remove roles');
      }
    } catch (err) {
      console.error('Error removing roles:', err);
      message.error(err instanceof Error ? err.message : 'Error removing roles');
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setSelectedRolesToAdd([]);
    setSelectedRolesToRemove([]);
    onCancel();
  };
  return (
    <Modal
      title={
        <Space>
          <InfoCircleOutlined />
          Manage Roles for {user.fullName}
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={600}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          User: <strong>{user.username}</strong> ({user.email})
        </Text>
      </div>
      {}
      <div style={{ marginBottom: 24 }}>
        <Title level={5}>Current Roles</Title>
        <Space size={[0, 8]} wrap>
          {availableRolesToRemove.length > 0 ? (
            availableRolesToRemove
              .sort((a, b) => getRoleLevel(b) - getRoleLevel(a))
              .map(role => (
                <Tag key={role} color={getRoleColor(role)}>
                  {getStringFromEnum(role)}
                  <Tooltip title={`Role Level: ${getRoleLevel(role)}`}>
                    <InfoCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </Tag>
              ))
          ) : (
            <Text type="secondary">No roles assigned</Text>
          )}
        </Space>
      </div>
      <Divider />
      {}
      {availableRolesToAdd.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Title level={5}>
            <PlusOutlined /> Add Roles
          </Title>
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Select roles to add"
                value={selectedRolesToAdd}
                onChange={setSelectedRolesToAdd}
                maxTagCount="responsive"
              >
                {availableRolesToAdd.map(role => (
                  <Option key={role} value={role}>
                    <Tag color={getRoleColor(role)} style={{ margin: 0 }}>
                      {getStringFromEnum(role)}
                    </Tag>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={8}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddRoles}
                loading={loading}
                disabled={selectedRolesToAdd.length === 0}
                block
              >
                Add Roles
              </Button>
            </Col>
          </Row>
        </div>
      )}
      {}
      {availableRolesToRemove.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Title level={5}>
            <MinusOutlined /> Remove Roles
          </Title>
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Select roles to remove"
                value={selectedRolesToRemove}
                onChange={setSelectedRolesToRemove}
                maxTagCount="responsive"
              >
                {availableRolesToRemove.map(role => (
                  <Option key={role} value={role}>
                    <Tag color={getRoleColor(role)} style={{ margin: 0 }}>
                      {getStringFromEnum(role)}
                    </Tag>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={8}>
              <Button
                type="primary"
                danger
                icon={<MinusOutlined />}
                onClick={handleRemoveRoles}
                loading={loading}
                disabled={selectedRolesToRemove.length === 0}
                block
              >
                Remove Roles
              </Button>
            </Col>
          </Row>
        </div>
      )}
      {availableRolesToAdd.length === 0 && availableRolesToRemove.length === 0 && (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Text type="secondary">No role management actions available</Text>
        </div>
      )}
      <Divider />
      {}
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>Role Hierarchy (Higher = More Privileges)</Title>
        <Space size={[0, 4]} wrap>
          {Object.values(Role)
            .filter((role): role is Role => typeof role === 'number')
            .sort((a, b) => getRoleLevel(b) - getRoleLevel(a))
            .map(role => (
              <Tag 
                key={role} 
                color={getRoleColor(role)}
                style={{ cursor: 'help' }}
              >
                {getStringFromEnum(role)} (Level {getRoleLevel(role)})
              </Tag>
            ))}
        </Space>
      </div>
    </Modal>
  );
};
export default UserRoleManagement;


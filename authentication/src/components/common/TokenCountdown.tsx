import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Tag, Button, Row, Col } from 'antd';
import { 
  ClockCircleOutlined, 
  ReloadOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  FieldTimeOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { tokenService } from '../../services/tokenService';
const { Text } = Typography;
interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}
const TokenCountdown: React.FC = () => {
  const { logout, refreshToken, isAdmin } = useAuth();
  const [accessTokenTime, setAccessTokenTime] = useState<TimeRemaining | null>(null);
  const [refreshTokenTime, setRefreshTokenTime] = useState<TimeRemaining | null>(null);
  const [isRememberMe, setIsRememberMe] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const calculateTimeRemaining = (expiresAt: Date): TimeRemaining => {
    const now = new Date().getTime();
    const expiry = expiresAt.getTime();
    const totalSeconds = Math.max(0, Math.floor((expiry - now) / 1000));
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds, totalSeconds };
  };
  const formatTimeForClock = (time: TimeRemaining): { 
    display: string; 
    parts: { days: string; hours: string; minutes: string; seconds: string } 
  } => {
    const parts = {
      days: time.days.toString().padStart(2, '0'),
      hours: time.hours.toString().padStart(2, '0'),
      minutes: time.minutes.toString().padStart(2, '0'),
      seconds: time.seconds.toString().padStart(2, '0')
    };
    if (time.days > 0) {
      return {
        display: `${parts.days}:${parts.hours}:${parts.minutes}:${parts.seconds}`,
        parts
      };
    } else {
      return {
        display: `${parts.hours}:${parts.minutes}:${parts.seconds}`,
        parts
      };
    }
  };
  const getStatusTag = (totalSeconds: number) => {
    if (totalSeconds <= 0) {
      return <Tag color="red" icon={<ExclamationCircleOutlined />}>EXPIRED</Tag>;
    } else if (totalSeconds <= 300) { // 5 minutes
      return <Tag color="orange" icon={<ExclamationCircleOutlined />}>EXPIRING</Tag>;
    } else {
      return <Tag color="green" icon={<CheckCircleOutlined />}>ACTIVE</Tag>;
    }
  };
  const getCountdownStyle = (totalSeconds: number) => {
    if (totalSeconds <= 0) {
      return { backgroundColor: '#fff2f0', color: '#ff4d4f' };
    } else if (totalSeconds <= 300) {
      return { backgroundColor: '#fff7e6', color: '#fa8c16' };
    } else {
      return { backgroundColor: '#f6ffed', color: '#52c41a' };
    }
  };
  const handleRefreshToken = React.useCallback(async () => {
    if (isRefreshing) return;
    try {
      setIsRefreshing(true);
      await refreshToken();
    } catch (err) {
      console.error('Error refreshing token:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshToken, isRefreshing]);
  const handleLogout = React.useCallback(async () => {
    await logout();
  }, [logout]);
  useEffect(() => {
    const updateCountdowns = () => {
      const accessTokenExpiry = tokenService.getAccessTokenExpiry();
      const refreshTokenExpiry = tokenService.getRefreshTokenExpiry();
      const isRememberMeActive = tokenService.isRememberMeSession();
      if (accessTokenExpiry) {
        const accessTime = calculateTimeRemaining(accessTokenExpiry);
        setAccessTokenTime(accessTime);
      }
      if (refreshTokenExpiry) {
        const refreshTime = calculateTimeRemaining(refreshTokenExpiry);
        setRefreshTokenTime(refreshTime);
        if (refreshTime.totalSeconds <= 0) {
          handleLogout();
        }
      }
      setIsRememberMe(isRememberMeActive);
    };
    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [isRefreshing, handleRefreshToken, handleLogout]);
  if (!accessTokenTime && !refreshTokenTime) {
    return null;
  }
  return (
    <Card 
      title={
        <Space>
          <ClockCircleOutlined />
          <span>Token Status</span>
        </Space>
      }
      size="small"
      style={{ marginBottom: '16px' }}
    >
      <Row gutter={[16, 16]}>
        {}
        {accessTokenTime && (
          <Col xs={24} md={12}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Space>
                  <ClockCircleOutlined style={{ color: '#1890ff' }} />
                  <Text strong>Access Token</Text>
                </Space>
                {getStatusTag(accessTokenTime.totalSeconds)}
              </div>
              <div style={{ 
                ...getCountdownStyle(accessTokenTime.totalSeconds),
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: accessTokenTime.totalSeconds <= 300 ? '#fa8c16' : '#52c41a',
                textAlign: 'center',
                fontFamily: 'monospace',
                fontSize: '18px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                {accessTokenTime.totalSeconds > 0 ? (
                  <div>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                      {formatTimeForClock(accessTokenTime).display}
                    </div>
                    <Text style={{ fontSize: '10px', opacity: 0.8 }}>
                      {accessTokenTime.days > 0 ? 'DD:HH:MM:SS' : 'HH:MM:SS'}
                    </Text>
                  </div>
                ) : (
                  <div style={{ color: '#ff4d4f' }}>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                      EXPIRED
                    </div>
                    <Text style={{ fontSize: '10px', opacity: 0.8 }}>
                      Token has expired
                    </Text>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {accessTokenTime.totalSeconds > 0 ? 'Expires in' : 'Expired'}
                </Text>
                {accessTokenTime.totalSeconds <= 300 && accessTokenTime.totalSeconds > 0 && (
                  <Text type="danger" style={{ fontSize: '10px', fontWeight: 'bold' }}>
                    ⚠️ Expiring soon!
                  </Text>
                )}
              </div>
            </div>
          </Col>
        )}
        {}
        {refreshTokenTime && (
          <Col xs={24} md={12}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Space>
                  <FieldTimeOutlined style={{ color: '#722ed1' }} />
                  <Text strong>Refresh Token</Text>
                </Space>
                <Space>
                  {getStatusTag(refreshTokenTime.totalSeconds)}
                  {isAdmin() && (
                    <Button 
                      type="text" 
                      size="small"
                      icon={<ReloadOutlined />}
                      loading={isRefreshing}
                      onClick={handleRefreshToken}
                      style={{ 
                        padding: '4px',
                        minWidth: 'auto',
                        height: '24px',
                        width: '24px'
                      }}
                      title="Refresh Token"
                    />
                  )}
                </Space>
              </div>
              <div style={{ 
                ...getCountdownStyle(refreshTokenTime.totalSeconds),
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: refreshTokenTime.totalSeconds <= 3600 ? '#fa8c16' : '#722ed1',
                textAlign: 'center',
                fontFamily: 'monospace',
                fontSize: '18px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                {refreshTokenTime.totalSeconds > 0 ? (
                  <div>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                      {formatTimeForClock(refreshTokenTime).display}
                    </div>
                    <Text style={{ fontSize: '10px', opacity: 0.8 }}>
                      {refreshTokenTime.days > 0 ? 'DD:HH:MM:SS' : 'HH:MM:SS'}
                    </Text>
                  </div>
                ) : (
                  <div style={{ color: '#ff4d4f' }}>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                      EXPIRED
                    </div>
                    <Text style={{ fontSize: '10px', opacity: 0.8 }}>
                      Logging out...
                    </Text>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {refreshTokenTime.totalSeconds > 0 ? 'Session expires in' : 'Session ended'}
                </Text>
                {refreshTokenTime.totalSeconds <= 3600 && refreshTokenTime.totalSeconds > 0 && (
                  <Text type="danger" style={{ fontSize: '10px', fontWeight: 'bold' }}>
                    ⚠️ Session ending soon!
                  </Text>
                )}
              </div>
            </div>
          </Col>
        )}
        {}
        {isRememberMe && (
          <Col xs={24}>
            <div style={{ 
              marginTop: '12px', 
              padding: '8px 12px', 
              backgroundColor: '#f6ffed', 
              border: '1px solid #b7eb8f', 
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text style={{ color: '#52c41a', fontSize: '12px', fontWeight: '500' }}>
                  Remember Me Active - Persistent Login Session
                </Text>
              </Space>
            </div>
          </Col>
        )}
      </Row>
    </Card>
  );
};
export default TokenCountdown;


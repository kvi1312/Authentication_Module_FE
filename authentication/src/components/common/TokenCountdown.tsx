import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Tag, Button } from 'antd';
import { 
  ClockCircleOutlined, 
  ReloadOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  FieldTimeOutlined,
  HistoryOutlined
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
  const { logout, refreshToken } = useAuth();
  const [accessTokenTime, setAccessTokenTime] = useState<TimeRemaining | null>(null);
  const [refreshTokenTime, setRefreshTokenTime] = useState<TimeRemaining | null>(null);
  const [rememberMeTokenTime, setRememberMeTokenTime] = useState<TimeRemaining | null>(null);
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

  const getCountdownStyle = (totalSeconds: number) => {
    if (totalSeconds <= 0) return { color: '#ff4d4f', backgroundColor: '#fff2f0' };
    if (totalSeconds <= 300) return { color: '#fa8c16', backgroundColor: '#fff7e6' }; // 5 minutes
    if (totalSeconds <= 1800) return { color: '#faad14', backgroundColor: '#fffbe6' }; // 30 minutes
    return { color: '#52c41a', backgroundColor: '#f6ffed' };
  };

  const getStatusTag = (totalSeconds: number) => {
    if (totalSeconds <= 0) {
      return <Tag color="red" icon={<ExclamationCircleOutlined />}>Expired</Tag>;
    } else if (totalSeconds <= 300) { // 5 minutes
      return <Tag color="orange" icon={<ExclamationCircleOutlined />}>Expiring Soon</Tag>;
    } else {
      return <Tag color="green" icon={<CheckCircleOutlined />}>Active</Tag>;
    }
  };

  const handleRefreshToken = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshToken();
    } catch {
      // Refresh failed
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshToken]);

  const handleLogout = React.useCallback(async () => {
    await logout();
  }, [logout]);

  useEffect(() => {
    const updateCountdowns = () => {
      // Get all token expiration times
      const accessTokenExpiry = tokenService.getAccessTokenExpiry();
      const refreshTokenExpiry = tokenService.getRefreshTokenExpiry();
      const rememberMeTokenExpiry = tokenService.getRememberMeTokenExpiry();

      if (accessTokenExpiry) {
        const accessTime = calculateTimeRemaining(accessTokenExpiry);
        setAccessTokenTime(accessTime);

        // Auto-refresh logic removed to prevent conflicts with short token lifetimes
        // Users can manually refresh using the button below
      }

      if (refreshTokenExpiry) {
        const refreshTime = calculateTimeRemaining(refreshTokenExpiry);
        setRefreshTokenTime(refreshTime);

        // Auto logout when refresh token expires
        if (refreshTime.totalSeconds <= 0) {
          handleLogout();
        }
      }

      if (rememberMeTokenExpiry) {
        const rememberMeTime = calculateTimeRemaining(rememberMeTokenExpiry);
        setRememberMeTokenTime(rememberMeTime);
      }
    };

    // Update immediately
    updateCountdowns();

    // Update every second
    const interval = setInterval(updateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [isRefreshing, handleRefreshToken, handleLogout]); // Include all dependencies

  if (!accessTokenTime && !refreshTokenTime && !rememberMeTokenTime) {
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
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Access Token Countdown */}
        {accessTokenTime && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <Space>
                <ClockCircleOutlined style={{ color: '#1890ff' }} />
                <Text strong>Access Token</Text>
              </Space>
              {getStatusTag(accessTokenTime.totalSeconds)}
            </div>
            
            {/* Digital Clock Display */}
            <div style={{ 
              ...getCountdownStyle(accessTokenTime.totalSeconds),
              padding: '16px',
              borderRadius: '8px',
              border: '2px solid',
              borderColor: accessTokenTime.totalSeconds <= 300 ? '#fa8c16' : '#52c41a',
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: '24px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              marginBottom: '12px'
            }}>
              {accessTokenTime.totalSeconds > 0 ? (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>
                    {formatTimeForClock(accessTokenTime).display}
                  </div>
                  <Text style={{ fontSize: '12px', opacity: 0.8 }}>
                    {accessTokenTime.days > 0 ? 'DD:HH:MM:SS' : 'HH:MM:SS'}
                  </Text>
                </div>
              ) : (
                <div style={{ color: '#ff4d4f' }}>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>
                    EXPIRED
                  </div>
                  <Text style={{ fontSize: '12px', opacity: 0.8 }}>
                    Token has expired
                  </Text>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Refresh Token Countdown */}
        {refreshTokenTime && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <Space>
                <FieldTimeOutlined style={{ color: '#722ed1' }} />
                <Text strong>Refresh Token</Text>
              </Space>
              {getStatusTag(refreshTokenTime.totalSeconds)}
            </div>
            
            {/* Digital Clock Display */}
            <div style={{ 
              ...getCountdownStyle(refreshTokenTime.totalSeconds),
              padding: '16px',
              borderRadius: '8px',
              border: '2px solid',
              borderColor: refreshTokenTime.totalSeconds <= 3600 ? '#fa8c16' : '#722ed1',
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: '24px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              marginBottom: '12px'
            }}>
              {refreshTokenTime.totalSeconds > 0 ? (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>
                    {formatTimeForClock(refreshTokenTime).display}
                  </div>
                  <Text style={{ fontSize: '12px', opacity: 0.8 }}>
                    {refreshTokenTime.days > 0 ? 'DD:HH:MM:SS' : 'HH:MM:SS'}
                  </Text>
                </div>
              ) : (
                <div style={{ color: '#ff4d4f' }}>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>
                    EXPIRED
                  </div>
                  <Text style={{ fontSize: '12px', opacity: 0.8 }}>
                    Logging out...
                  </Text>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {refreshTokenTime.totalSeconds > 0 ? 'Session expires in' : 'Session ended'}
              </Text>
              
              {refreshTokenTime.totalSeconds <= 3600 && refreshTokenTime.totalSeconds > 0 && ( // 1 hour warning
                <Text type="danger" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  ⚠️ Session ending soon!
                </Text>
              )}
            </div>
          </div>
        )}

        {/* Remember Me Token Countdown */}
        {rememberMeTokenTime && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <Space>
                <HistoryOutlined style={{ color: '#52c41a' }} />
                <Text strong>Remember Me Token</Text>
              </Space>
              {getStatusTag(rememberMeTokenTime.totalSeconds)}
            </div>
            
            {/* Digital Clock Display */}
            <div style={{ 
              ...getCountdownStyle(rememberMeTokenTime.totalSeconds),
              padding: '16px',
              borderRadius: '8px',
              border: '2px solid',
              borderColor: rememberMeTokenTime.totalSeconds <= 86400 ? '#fa8c16' : '#52c41a', // 1 day warning
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: '24px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              marginBottom: '12px'
            }}>
              {rememberMeTokenTime.totalSeconds > 0 ? (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>
                    {formatTimeForClock(rememberMeTokenTime).display}
                  </div>
                  <Text style={{ fontSize: '12px', opacity: 0.8 }}>
                    {rememberMeTokenTime.days > 0 ? 'DD:HH:MM:SS' : 'HH:MM:SS'}
                  </Text>
                </div>
              ) : (
                <div style={{ color: '#ff4d4f' }}>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>
                    EXPIRED
                  </div>
                  <Text style={{ fontSize: '12px', opacity: 0.8 }}>
                    Remember me expired
                  </Text>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {rememberMeTokenTime.totalSeconds > 0 ? 'Remember me expires in' : 'Remember me ended'}
              </Text>
              
              {rememberMeTokenTime.totalSeconds <= 86400 && rememberMeTokenTime.totalSeconds > 0 && ( // 1 day warning
                <Text type="warning" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  ⚠️ Remember me ending soon!
                </Text>
              )}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div style={{ 
          borderTop: '1px solid #f0f0f0', 
          paddingTop: '16px', 
          marginTop: '16px',
          display: 'flex',
          gap: '8px',
          justifyContent: 'center'
        }}>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            loading={isRefreshing}
            onClick={handleRefreshToken}
            size="small"
          >
            Refresh Token
          </Button>
          <Button
            danger
            icon={<ExclamationCircleOutlined />}
            onClick={handleLogout}
            size="small"
          >
            Logout
          </Button>
        </div>
      </Space>
    </Card>
  );
};

export default TokenCountdown;

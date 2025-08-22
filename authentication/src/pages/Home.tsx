import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Layout, 
  Button, 
  Row, 
  Col, 
  Typography, 
  Space
} from 'antd';
import {
  SafetyOutlined,
  LockOutlined,
  TeamOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const Home: React.FC = () => {
  return (
    <Layout className="app-container">
      {/* Navigation */}
      <Header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SafetyOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '8px' }} />
          <Text className="app-logo">AuthModule</Text>
        </div>
        <Space>
          <Link to="/login">
            <Button type="text">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button type="primary" className="gradient-btn">
              Get Started
            </Button>
          </Link>
        </Space>
      </Header>

      <Content>
        {/* Hero Section */}
        <div style={{ 
          background: '#fff',
          padding: '120px 24px 80px',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
              }}>
                <SafetyOutlined style={{ fontSize: '60px', color: 'white' }} />
              </div>
            </div>
            
            <Title level={1} style={{ 
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Secure Authentication
            </Title>
            
            <Paragraph style={{ 
              fontSize: '20px',
              color: '#666',
              marginBottom: '48px',
              lineHeight: '1.6'
            }}>
              Modern authentication system with JWT tokens, role-based access control, and enterprise-grade security
            </Paragraph>
            
            <Space size="large">
              <Link to="/register">
                <Button 
                  type="primary" 
                  size="large" 
                  className="gradient-btn"
                  icon={<ArrowRightOutlined />}
                  style={{ 
                    height: '56px', 
                    padding: '0 40px',
                    fontSize: '16px',
                    fontWeight: '600',
                    borderRadius: '12px'
                  }}
                >
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="large" 
                  style={{ 
                    height: '56px', 
                    padding: '0 40px',
                    fontSize: '16px',
                    fontWeight: '600',
                    borderRadius: '12px',
                    border: '2px solid #667eea',
                    color: '#667eea'
                  }}
                >
                  Sign In
                </Button>
              </Link>
            </Space>
          </div>
        </div>

        {/* Key Features */}
        <div style={{ padding: '80px 24px', background: '#fafafa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <Title level={2} style={{ fontSize: '36px', marginBottom: '16px' }}>
                Why Choose AuthModule?
              </Title>
              <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                Enterprise-grade security features designed for modern applications
              </Paragraph>
            </div>

            <Row gutter={[48, 48]} justify="center">
              <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '24px' }}>
                  <SafetyOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                </div>
                <Title level={4} style={{ marginBottom: '16px' }}>JWT Authentication</Title>
                <Paragraph style={{ color: '#666' }}>
                  Secure token-based authentication with refresh token rotation
                </Paragraph>
              </Col>
              
              <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '24px' }}>
                  <TeamOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                </div>
                <Title level={4} style={{ marginBottom: '16px' }}>Role-Based Access</Title>
                <Paragraph style={{ color: '#666' }}>
                  Admin, Partner, and User roles with granular permissions
                </Paragraph>
              </Col>
              
              <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '24px' }}>
                  <LockOutlined style={{ fontSize: '48px', color: '#f5222d' }} />
                </div>
                <Title level={4} style={{ marginBottom: '16px' }}>Enterprise Security</Title>
                <Paragraph style={{ color: '#666' }}>
                  CORS protection, XSS prevention, and HTTP-only cookies
                </Paragraph>
              </Col>
            </Row>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ padding: '80px 24px', background: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Title level={2} style={{ marginBottom: '16px' }}>
              Ready to secure your application?
            </Title>
            <Paragraph style={{ fontSize: '18px', color: '#666', marginBottom: '40px' }}>
              Join developers who trust AuthModule for their authentication needs
            </Paragraph>
            <Link to="/register">
              <Button 
                type="primary" 
                size="large"
                className="gradient-btn"
                icon={<ArrowRightOutlined />}
                style={{ 
                  height: '56px', 
                  padding: '0 40px',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '12px'
                }}
              >
                Start Building Today
              </Button>
            </Link>
          </div>
        </div>
      </Content>

      {/* Footer */}
      <Footer className="app-footer">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <SafetyOutlined style={{ color: '#1890ff' }} />
            <Text strong>AuthModule</Text>
          </Space>
          <Text type="secondary">
            © 2025 Authentication Module. Built with React & .NET 8.0
          </Text>
        </div>
      </Footer>
    </Layout>
  );
};

export default Home;

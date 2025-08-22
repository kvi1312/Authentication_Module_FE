import React from 'react';
import { Link } from 'react-router-dom';
import {
  CogIcon,
  KeyIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { TokenConfigProvider } from '../contexts/TokenConfigContext';
import TokenConfigPanel from '../components/admin/TokenConfigPanel';
import Layout from '../components/layout/Layout';

const AdminDashboard: React.FC = () => {
  const adminCards = [
    {
      name: 'Token Configuration',
      description: 'Manage JWT token expiry settings',
      href: '#token-config',
      icon: KeyIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'User Management',
      description: 'Manage user accounts and permissions',
      href: '/admin/users',
      icon: UsersIcon,
      color: 'bg-green-500',
      disabled: true,
    },
    {
      name: 'System Logs',
      description: 'View authentication and security logs',
      href: '/admin/logs',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      disabled: true,
    },
    {
      name: 'Security Settings',
      description: 'Configure security policies',
      href: '/admin/security',
      icon: ShieldCheckIcon,
      color: 'bg-red-500',
      disabled: true,
    },
  ];

  const stats = [
    {
      name: 'Active Users',
      value: '124',
      icon: UsersIcon,
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'Token Refreshes',
      value: '2,847',
      icon: ClockIcon,
      change: '+4.3%',
      changeType: 'increase',
    },
    {
      name: 'Login Attempts',
      value: '1,234',
      icon: ShieldCheckIcon,
      change: '-2.1%',
      changeType: 'decrease',
    },
    {
      name: 'System Health',
      value: '99.9%',
      icon: ChartBarIcon,
      change: '+0.1%',
      changeType: 'increase',
    },
  ];

  return (
    <Layout>
      <TokenConfigProvider>
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <CogIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">
                  Manage system configuration and monitor authentication services
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <stat.icon className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change} from last month
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Admin Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Admin Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminCards.map((card) => (
                <div key={card.name} className="relative">
                  {card.href.startsWith('#') ? (
                    <a
                      href={card.href}
                      className={`group block bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-colors ${
                        card.disabled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`p-2 rounded-md ${card.color}`}>
                          <card.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {card.name}
                          </h3>
                          <p className="text-sm text-gray-600">{card.description}</p>
                        </div>
                      </div>
                    </a>
                  ) : (
                    <Link
                      to={card.href}
                      className={`group block bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-colors ${
                        card.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`p-2 rounded-md ${card.color}`}>
                          <card.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {card.name}
                          </h3>
                          <p className="text-sm text-gray-600">{card.description}</p>
                        </div>
                      </div>
                    </Link>
                  )}
                  {card.disabled && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Token Configuration Section */}
          <div id="token-config">
            <TokenConfigPanel />
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                disabled
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UsersIcon className="h-4 w-4 mr-2" />
                Export User Data
              </button>
              <button
                disabled
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Generate Report
              </button>
              <button
                disabled
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                Security Audit
              </button>
            </div>
          </div>
        </div>
      </TokenConfigProvider>
    </Layout>
  );
};

export default AdminDashboard;

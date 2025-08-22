import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserCircleIcon,
  CogIcon,
  ChartBarIcon,
  ClockIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { useAuth, usePermissions } from '../hooks/useAuth';
import { USER_TYPE_LABELS } from '../utils/constants';
import Layout from '../components/layout/Layout';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isPartner } = usePermissions();

  const quickActions = [
    {
      name: 'Profile Settings',
      description: 'Update your personal information',
      href: '/profile',
      icon: UserCircleIcon,
      show: true,
    },
    {
      name: 'Admin Panel',
      description: 'Manage system configuration',
      href: '/admin',
      icon: CogIcon,
      show: isAdmin,
    },
    {
      name: 'Partner Portal',
      description: 'Access partner resources',
      href: '/partner',
      icon: ChartBarIcon,
      show: isPartner,
    },
    {
      name: 'Token Configuration',
      description: 'Configure authentication tokens',
      href: '/admin/token-config',
      icon: KeyIcon,
      show: isAdmin,
    },
  ].filter(action => action.show);

  const stats = [
    {
      name: 'User Type',
      value: user ? USER_TYPE_LABELS[user.userType as keyof typeof USER_TYPE_LABELS] : 'Unknown',
      icon: UserCircleIcon,
    },
    {
      name: 'Account Status',
      value: user?.isActive ? 'Active' : 'Inactive',
      icon: ChartBarIcon,
    },
    {
      name: 'Last Login',
      value: user?.lastLoginAt 
        ? new Date(user.lastLoginAt).toLocaleDateString()
        : 'First time',
      icon: ClockIcon,
    },
    {
      name: 'Member Since',
      value: user?.createdDate 
        ? new Date(user.createdDate).toLocaleDateString()
        : 'Unknown',
      icon: UserCircleIcon,
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <UserCircleIcon className="h-12 w-12 text-blue-500" />
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <p className="text-gray-600">
                {user?.fullName} • {user?.email}
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
                  <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="group block bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-colors"
              >
                <div className="flex items-center">
                  <action.icon className="h-8 w-8 text-blue-500 group-hover:text-blue-600" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      {action.name}
                    </h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* User Roles */}
        {user?.roles && user.roles.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Roles</h2>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role: string) => (
                <span
                  key={role}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <ClockIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Logged in successfully</p>
                <p className="text-sm text-gray-500">Today</p>
              </div>
            </div>
            
            {user?.lastLoginAt && (
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <UserCircleIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Previous login</p>
                  <p className="text-sm text-gray-500">
                    {new Date(user.lastLoginAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

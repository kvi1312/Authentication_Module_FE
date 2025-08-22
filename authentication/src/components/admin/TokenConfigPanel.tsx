import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  CogIcon,
  ClockIcon,
  KeyIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useTokenConfigLoader, useTokenConfigForm } from '../../hooks/useTokenConfig';
import { TOKEN_PRESETS } from '../../utils/constants';
import type { UpdateTokenConfigRequest } from '../../types/auth.types';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const TokenConfigPanel: React.FC = () => {
  const { config, loading: configLoading, error: configError, isLoaded } = useTokenConfigLoader();
  const {
    loading: actionLoading,
    error: actionError,
    isDirty,
    handleSave,
    handleReset,
    handlePreset,
    setDirty,
    clearError,
  } = useTokenConfigForm();

  const [, setSelectedPreset] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateTokenConfigRequest>({
    defaultValues: {
      accessTokenExpiryMinutes: 30,
      refreshTokenExpiryDays: 7,
      rememberMeTokenExpiryDays: 30,
    },
  });

  // Watch form values to detect changes
  const formValues = watch();

  useEffect(() => {
    if (config && isLoaded) {
      setValue('accessTokenExpiryMinutes', config.accessTokenExpiryMinutes);
      setValue('refreshTokenExpiryDays', config.refreshTokenExpiryDays);
      setValue('rememberMeTokenExpiryDays', config.rememberMeTokenExpiryDays);
      reset({
        accessTokenExpiryMinutes: config.accessTokenExpiryMinutes,
        refreshTokenExpiryDays: config.refreshTokenExpiryDays,
        rememberMeTokenExpiryDays: config.rememberMeTokenExpiryDays,
      });
    }
  }, [config, isLoaded, setValue, reset]);

  useEffect(() => {
    if (config) {
      const hasChanges = 
        formValues.accessTokenExpiryMinutes !== config.accessTokenExpiryMinutes ||
        formValues.refreshTokenExpiryDays !== config.refreshTokenExpiryDays ||
        formValues.rememberMeTokenExpiryDays !== config.rememberMeTokenExpiryDays;
      
      setDirty(hasChanges);
    }
  }, [formValues, config, setDirty]);

  const onSubmit = async (data: UpdateTokenConfigRequest) => {
    try {
      clearError();
      const success = await handleSave(data);
      if (success) {
        toast.success('Token configuration updated successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update configuration');
    }
  };

  const onReset = async () => {
    try {
      clearError();
      const success = await handleReset();
      if (success) {
        toast.success('Token configuration reset to defaults');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset configuration');
    }
  };

  const onApplyPreset = async (preset: string) => {
    try {
      clearError();
      const success = await handlePreset(preset);
      if (success) {
        toast.success(`Applied ${TOKEN_PRESETS[preset as keyof typeof TOKEN_PRESETS].name} preset`);
        setSelectedPreset('');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to apply preset');
    }
  };

  if (configLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" message="Loading token configuration..." />
      </div>
    );
  }

  if (configError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <XMarkIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading configuration
            </h3>
            <p className="text-sm text-red-700 mt-2">{configError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <KeyIcon className="h-8 w-8 text-blue-500" />
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">Token Configuration</h1>
            <p className="text-gray-600">
              Manage JWT token expiry settings and security parameters
            </p>
          </div>
        </div>
      </div>

      {/* Current Configuration Display */}
      {config && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Current Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <ClockIcon className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Access Token</p>
                <p className="text-sm text-gray-600">{config.accessTokenExpiryDisplay}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ArrowPathIcon className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Refresh Token</p>
                <p className="text-sm text-gray-600">{config.refreshTokenExpiryDisplay}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CogIcon className="h-6 w-6 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Remember Me</p>
                <p className="text-sm text-gray-600">{config.rememberMeTokenExpiryDisplay}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Update Configuration</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Access Token Expiry */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Access Token Expiry (minutes)
            </label>
            <div className="mt-1">
              <input
                {...register('accessTokenExpiryMinutes', {
                  required: 'Access token expiry is required',
                  min: { value: 1, message: 'Minimum 1 minute' },
                  max: { value: 1440, message: 'Maximum 1440 minutes (24 hours)' },
                  valueAsNumber: true,
                })}
                type="number"
                min="1"
                max="1440"
                className={`block w-full px-3 py-2 border ${
                  errors.accessTokenExpiryMinutes ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.accessTokenExpiryMinutes && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.accessTokenExpiryMinutes.message}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Short-lived tokens for API access (1-1440 minutes)
              </p>
            </div>
          </div>

          {/* Refresh Token Expiry */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Refresh Token Expiry (days)
            </label>
            <div className="mt-1">
              <input
                {...register('refreshTokenExpiryDays', {
                  required: 'Refresh token expiry is required',
                  min: { value: 1, message: 'Minimum 1 day' },
                  max: { value: 90, message: 'Maximum 90 days' },
                  valueAsNumber: true,
                })}
                type="number"
                min="1"
                max="90"
                className={`block w-full px-3 py-2 border ${
                  errors.refreshTokenExpiryDays ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.refreshTokenExpiryDays && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.refreshTokenExpiryDays.message}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Long-lived tokens for automatic refresh (1-90 days)
              </p>
            </div>
          </div>

          {/* Remember Me Token Expiry */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Remember Me Token Expiry (days)
            </label>
            <div className="mt-1">
              <input
                {...register('rememberMeTokenExpiryDays', {
                  required: 'Remember me token expiry is required',
                  min: { value: 1, message: 'Minimum 1 day' },
                  max: { value: 365, message: 'Maximum 365 days' },
                  valueAsNumber: true,
                })}
                type="number"
                min="1"
                max="365"
                className={`block w-full px-3 py-2 border ${
                  errors.rememberMeTokenExpiryDays ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.rememberMeTokenExpiryDays && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.rememberMeTokenExpiryDays.message}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Extended expiry when "Remember Me" is checked (1-365 days)
              </p>
            </div>
          </div>

          {/* Error Display */}
          {actionError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <XMarkIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-600">{actionError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between space-x-4">
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={!isDirty || actionLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onReset}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Reset to Defaults
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Preset Configurations */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Presets</h2>
        <p className="text-sm text-gray-600 mb-6">
          Apply pre-configured token settings for common scenarios
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(TOKEN_PRESETS).map(([key, preset]) => (
            <div
              key={key}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <h3 className="text-sm font-medium text-gray-900">{preset.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{preset.description}</p>
              <button
                onClick={() => onApplyPreset(key)}
                disabled={actionLoading}
                className="mt-3 w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dirty State Warning */}
      {isDirty && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <CogIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                You have unsaved changes. Don't forget to save your configuration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenConfigPanel;

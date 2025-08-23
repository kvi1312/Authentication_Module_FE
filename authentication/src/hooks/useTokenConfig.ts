// Re-export useTokenConfig hook for convenience
export { useTokenConfig } from '../contexts/TokenConfigContext';

import { useTokenConfig } from '../contexts/TokenConfigContext';
import { useEffect } from 'react';

// Hook to auto-load token config when component mounts
export const useTokenConfigLoader = () => {
  const { config, loading, error, loadConfig } = useTokenConfig();

  useEffect(() => {
    if (!config && !loading && !error) {
      loadConfig().catch(() => {});
    }
  }, [config, loading, error, loadConfig]);

  return {
    config,
    loading,
    error,
    isLoaded: !!config,
  };
};

// Hook for token config form management
export const useTokenConfigForm = () => {
  const { 
    config, 
    loading, 
    error, 
    isDirty, 
    updateConfig, 
    resetConfig, 
    applyPreset, 
    setDirty, 
    clearError 
  } = useTokenConfig();

  const handleSave = async (formData: any) => {
    try {
      await updateConfig(formData);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleReset = async () => {
    try {
      await resetConfig();
      return true;
    } catch (error) {
      return false;
    }
  };

  const handlePreset = async (presetName: string) => {
    try {
      await applyPreset(presetName);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    config,
    loading,
    error,
    isDirty,
    handleSave,
    handleReset,
    handlePreset,
    setDirty,
    clearError,
  };
};

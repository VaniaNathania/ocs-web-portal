import { useContext } from 'react';
import { ConfigUserContext } from './ConfigUserContext';

const useUserContext = () => {
  const context = useContext(ConfigUserContext);

  if (!context) throw new Error('useUserContext must be used within AuthProvider');

  return context;
};

export { useUserContext };

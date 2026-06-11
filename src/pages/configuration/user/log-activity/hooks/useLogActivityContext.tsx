import { useContext } from 'react';
import { LogActivityContext } from './LogActivityContext';

const useLogActivityContext = () => {
  const context = useContext(LogActivityContext);

  if (!context) throw new Error('useLogActivityContext must be used within AuthProvider');

  return context;
};

export { useLogActivityContext };

import { useContext } from 'react';
import { FixedClassificationContext } from './FixedClassificationContext';

const useFixedClassificationContext = () => {
  const context = useContext(FixedClassificationContext);

  if (!context) throw new Error('useFixedClassificationContext must be used within AuthProvider');

  return context;
};

export { useFixedClassificationContext };

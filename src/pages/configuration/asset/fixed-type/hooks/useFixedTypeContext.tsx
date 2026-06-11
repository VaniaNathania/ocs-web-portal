import { useContext } from 'react';
import { FixedTypeContext } from './FixedTypeContext';

const useFixedTypeContext = () => {
  const context = useContext(FixedTypeContext);

  if (!context) throw new Error('useFixedTypeContext must be used within AuthProvider');

  return context;
};

export { useFixedTypeContext };

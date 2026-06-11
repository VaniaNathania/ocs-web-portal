import { useContext } from 'react';
import { SupplierContext } from './SupplierContext';

const useSupplierContext = () => {
  const context = useContext(SupplierContext);

  if (!context) throw new Error('useSupplierContext must be used within AuthProvider');

  return context;
};

export { useSupplierContext };

import { useContext } from 'react';
import { RequestOrderCategoryContext } from './RequestOrderCategoryContext';

const useRequestOrderCategoryContext = () => {
  const context = useContext(RequestOrderCategoryContext);

  if (!context) throw new Error('useRequestOrderCategoryContext must be used within AuthProvider');

  return context;
};

export { useRequestOrderCategoryContext };

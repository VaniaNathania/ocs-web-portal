import { useContext } from 'react';
import { GoodsCategoryContext } from './GoodsCategoryContext';

const useGoodsCategoryContext = () => {
  const context = useContext(GoodsCategoryContext);

  if (!context) throw new Error('useGoodsCategoryContext must be used within AuthProvider');

  return context;
};

export { useGoodsCategoryContext };

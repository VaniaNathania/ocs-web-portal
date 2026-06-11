import { useContext } from 'react';
import { GoodsContext } from './GoodsContext';

const useGoodsContext = () => {
  const context = useContext(GoodsContext);

  if (!context) throw new Error('useGoodsContext must be used within AuthProvider');

  return context;
};

export { useGoodsContext };

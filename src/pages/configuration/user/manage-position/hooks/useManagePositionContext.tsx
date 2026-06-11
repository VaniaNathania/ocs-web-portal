import { useContext } from 'react';
import { ManagePositionContext } from './ManagePositionContext';

const useManagePositionContext = () => {
  const context = useContext(ManagePositionContext);

  if (!context) throw new Error('useManagePositionContext must be used within ManagePositionContextProvider');

  return context;
};

export { useManagePositionContext };

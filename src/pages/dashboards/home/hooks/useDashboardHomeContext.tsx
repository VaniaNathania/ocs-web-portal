import { useContext } from 'react';
import { DashboardHomeContext } from './DashboardHomeContext';

const useDashboardHomeContext = () => {
  const context = useContext(DashboardHomeContext);

  if (!context) throw new Error('useDashboardHomeContext must be used within AuthProvider');

  return context;
};

export { useDashboardHomeContext };

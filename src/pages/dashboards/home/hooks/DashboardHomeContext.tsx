import React, { createContext, useCallback, useState } from 'react';

interface ContextProps {}

const initialProps: ContextProps = {};

const DashboardHomeContext = createContext<ContextProps>(initialProps);

const DashboardHomeContextProvider = ({ children }: { children: React.ReactNode }) => {
  /* state */

  /* action */

  return <DashboardHomeContext.Provider value={{}}>{children}</DashboardHomeContext.Provider>;
};

export { DashboardHomeContextProvider, DashboardHomeContext };

/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import { ProgressBarLoader, ScreenLoader } from "@/components/loaders";
import { useAuthContext } from "@/auth";

export interface ILoadersProvider {
  contentLoader: boolean;
  setContentLoader: (state: boolean) => void;
  progressBarLoader: boolean;
  setProgressBarLoader: (state: boolean) => void;
  screenLoader: boolean;
  setScreenLoader: (state: boolean) => void;
}

const initialProps: ILoadersProvider = {
  contentLoader: false,
  setContentLoader: (state: boolean) => {},
  progressBarLoader: false,
  setProgressBarLoader: (state: boolean) => {},
  screenLoader: false,
  setScreenLoader: (state: boolean) => {},
};

const LoadersContext = createContext<ILoadersProvider>(initialProps);
const useLoaders = () => useContext(LoadersContext);

const LoadersProvider = ({ children }: PropsWithChildren) => {
  const [contentLoader, setContentLoader] = useState(false);
  const { loading } = useAuthContext();
  const [progressBarLoader, setProgressBarLoader] = useState(false);
  const [screenLoader, setScreenLoader] = useState(false);

  useEffect(() => {
    // console.log("Progress bar", loading);
    setScreenLoader(loading);
  }, [loading]);

  return (
    <LoadersContext.Provider
      value={{
        contentLoader,
        setContentLoader,
        progressBarLoader,
        setProgressBarLoader,
        screenLoader,
        setScreenLoader,
      }}
    >
      {loading && <ProgressBarLoader />}
      {screenLoader && <ScreenLoader />}
      {children}
    </LoadersContext.Provider>
  );
};

export { LoadersProvider, useLoaders };

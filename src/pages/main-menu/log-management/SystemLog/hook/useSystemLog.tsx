import { useContext } from "react";
import { SystemLogContext } from "./SystemLogProvider";

export const useSystemLog = () => {
  const context = useContext(SystemLogContext);
  if (!context) {
    throw new Error("useAppList must be used within LogManagementProvider");
  }
  return context;
};

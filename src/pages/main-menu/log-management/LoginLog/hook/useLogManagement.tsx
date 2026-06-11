import { useContext } from "react";
import { LogManagementContext } from "./LogManagementProvider";

export const useLogManagement = () => {
  const context = useContext(LogManagementContext);
  if (!context) {
    throw new Error("useAppList must be used within LogManagementProvider");
  }
  return context;
};

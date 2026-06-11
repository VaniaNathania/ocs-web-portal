import { useContext } from "react";
import { DirMenuManagementContext } from "./DirMenuManagementProvider";

// Optional: helper hook to use context
export const useDirMenuManagement = () => {
  const context = useContext(DirMenuManagementContext);
  if (!context) {
    throw new Error(
      "useDirMenuManagement must be used within a DirMenuManagementProvider"
    );
  }
  return context;
};

import { useContext } from "react";
import { AuditLogContext } from "./AuditLogProvider";

export const useAuditLog = () => {
  const context = useContext(AuditLogContext);
  if (!context) {
    throw new Error("useAppList must be used within LogManagementProvider");
  }
  return context;
};

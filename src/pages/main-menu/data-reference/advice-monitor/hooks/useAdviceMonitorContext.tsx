import { useContext } from "react";
import { AdviceMonitorListContext } from "./AdviceMonitorContext";

const useAdviceMonitorContext = () => {
  const context = useContext(AdviceMonitorListContext);
  if (!context) throw new Error("useAdviceMonitorContext must be used within AuthProvider");
  return context;
};

export { useAdviceMonitorContext };

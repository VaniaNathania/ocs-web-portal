import { useContext } from "react";
import { WorkFlowRuleModuleContext } from "./WorkFlowRuleModuleContext";

const useWorkRuleModuleContext = () => {
  const context = useContext(WorkFlowRuleModuleContext);

  if (!context) {
    throw new Error(
      "useWorkRuleModuleContext must be used within AuthProvider"
    );
  };
  return context;
};

export { useWorkRuleModuleContext };

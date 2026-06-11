import { useContext } from "react";
import { ModifyHistoryListContext } from "./ModifyHistoryContext";

const useModifyHistoryListContext = () => {
  const context = useContext(ModifyHistoryListContext);
  if (!context) throw new Error("useModifyHistoryListContext must be used within AuthProvider");

  return context;
};

export { useModifyHistoryListContext };

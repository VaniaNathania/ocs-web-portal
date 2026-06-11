import { useContext } from "react";
import { AdviceTypeListContext } from "./AdviceTypeContext";

const useAdviceTypeContext = () => {
  const context = useContext(AdviceTypeListContext);
  if (!context) throw new Error("useAdviceTypeContext must be used within AuthProvider");
  return context;
};

export { useAdviceTypeContext };

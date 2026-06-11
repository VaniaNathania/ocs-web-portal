import { useContext } from "react";
import { AccumulationContext } from "./AccumulationContext";

const useAccumulationContext = () => {
  const context = useContext(AccumulationContext);
  if (!context) {
    throw new Error(
      "useAccumulationContext must be used within a AccumulationContextProvider"
    );
  }
  return context;
};

export { useAccumulationContext };

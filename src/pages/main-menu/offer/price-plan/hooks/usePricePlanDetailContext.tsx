import { useContext } from "react";
import { PricePlanDetailContext } from "./PricePlanDetailContext";

const usePricePlanDetailContext = () => {
  const context = useContext(PricePlanDetailContext);

  if (!context)
    throw new Error(
      "usePricePlanDetailContext must be used within AuthProvider"
    );

  return context;
};

export { usePricePlanDetailContext };

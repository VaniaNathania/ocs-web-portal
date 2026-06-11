import { useContext } from "react";
import { PricePlanDetailContext } from "./PricePlanDetailContext";

const usePricePlanDetailContextProvider = () => {
  const context = useContext(PricePlanDetailContext);

  if (!context)
    throw new Error(
      "usePricePlanDetailContextProvider must be used within PricePlanDetailContextProvider"
    );

  return context;
};

export { usePricePlanDetailContextProvider};

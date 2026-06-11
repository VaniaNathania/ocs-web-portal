import { useContext } from "react";
import { PricePlanListContext } from "./PricePlanListContext";

const usePricePlanListContext = () => {
  const context = useContext(PricePlanListContext);

  if (!context)
    throw new Error(
      "usePricePlanListContext must be used within AuthProvider"
    );

  return context;
};

export { usePricePlanListContext };

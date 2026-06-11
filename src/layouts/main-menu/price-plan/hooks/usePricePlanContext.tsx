import { useContext } from "react";
import { PricePlanListContext } from "./PricePlanContext";

const usePricePlanListContext = () => {
  const context = useContext(PricePlanListContext);

  if (!context) {
    throw new Error(
      "usePricePlanListContext must be used within a AccountBalanceProvider"
    );
  }

  return context;
};

export default usePricePlanListContext;

import { useContext } from "react";
import { BenefitContext } from "./BenefitContext";

const useBenefitContext = () => {
  const context = useContext(BenefitContext);

  if (!context) {
    throw new Error(
      "useBenefitContext must be used within a BenefitContextProvider"
    );
  }

  return context;
};

export default useBenefitContext;

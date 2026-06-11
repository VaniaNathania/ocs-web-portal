import { useContext } from "react";
import { AccountFeatureContext } from "./AccountFeatureContext";

const useAccountFeatureContext = () => {
  const context = useContext(AccountFeatureContext);

  if (!context) {
    throw new Error(
      "useAccountFeatureContext must be used within a AccountFeatureProvider"
    );
  }

  return context;
};

export default useAccountFeatureContext;

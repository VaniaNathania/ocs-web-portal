import { useContext } from "react";
import { UsagePriceCreateContext } from "./UsagePriceCreateContext";

const useUsagePriceCreateContext = () => {
  const context = useContext(UsagePriceCreateContext);

  if (!context)
    throw new Error(
      "useUsagePriceCreateContext must be used within ReceiverProvider"
    );

  return context;
};

export { useUsagePriceCreateContext };

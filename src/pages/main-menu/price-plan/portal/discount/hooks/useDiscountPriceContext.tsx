import { useContext } from "react";
import { DiscountPriceContext } from "./DiscountPriceContext";

const useDiscountPriceContext = () => {
  const context = useContext(DiscountPriceContext);

  if (!context)
    throw new Error(
      "useDiscountPriceContext must be used within ReceiverProvider"
    );

  return context;
};

export { useDiscountPriceContext };

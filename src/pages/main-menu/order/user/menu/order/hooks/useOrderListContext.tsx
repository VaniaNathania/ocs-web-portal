import { useContext } from "react";
import { OrderListContext } from "./OrderListContext";

const useOrderListContext = () => {
  const context = useContext(OrderListContext);

  if (!context)
    throw new Error(
      "OrderListContext must be used within OrderListContextProvider",
    );

  return context;
};

export { useOrderListContext };

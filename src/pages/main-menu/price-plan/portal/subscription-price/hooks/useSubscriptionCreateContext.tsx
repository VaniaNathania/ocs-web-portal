import { useContext } from "react";
import { SubscriptionCreateContext} from "./SubscriptionCreateContext";

const useSubscriptionPriceCreateContext = () => {
  const context = useContext(SubscriptionCreateContext);

  if (!context)
    throw new Error(
      "useSubscriptionPriceCreateContext must be used within ReceiverProvider"
    );

  return context;
};

export { useSubscriptionPriceCreateContext };

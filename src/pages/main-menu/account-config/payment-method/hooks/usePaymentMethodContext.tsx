import { useContext } from "react";
import { PaymentMethodContext } from "./PaymentMethodContext";

const usePaymentMethod = () => {
  const context = useContext(PaymentMethodContext);

  if (!context) {
    throw new Error(
      "usePaymentMethod must be used within a PaymentMethodProvider"
    );
  }

  return context;
};

export default usePaymentMethod;

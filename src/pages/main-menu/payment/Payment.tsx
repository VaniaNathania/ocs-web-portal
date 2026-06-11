import Main from "./blocks/main";
import { PaymentProvider } from "./hooks/PaymentContext";

const Payment = () => {
  return (
    <PaymentProvider>
      <Main />
    </PaymentProvider>
  );
};

export default Payment;

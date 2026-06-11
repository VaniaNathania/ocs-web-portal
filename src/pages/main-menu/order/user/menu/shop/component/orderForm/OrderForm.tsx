import Main from "./blocks/main";
import { OrderFormProvider } from "./hooks/context";

const OrderForm = () => {
  return (
    <OrderFormProvider>
      <Main />
    </OrderFormProvider>
  );
};

export default OrderForm;

import Main from "./block/main";
import { OrderAccBalProvider } from "./hooks/balInfoContext";

const AccBalanceMain = () => {
  return (
    <OrderAccBalProvider>
      <Main />
    </OrderAccBalProvider>
  );
};

export default AccBalanceMain;

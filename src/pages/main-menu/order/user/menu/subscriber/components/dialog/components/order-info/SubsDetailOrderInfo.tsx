import Main from "./blocks/main";
import { OrderSubsDetailOrderInfoProvider } from "./hooks/SubsDetailOrderInfoContext";

const SubsDetailOrderInfo = () => {
  return (
    <OrderSubsDetailOrderInfoProvider>
      <Main />
    </OrderSubsDetailOrderInfoProvider>
  );
};

export default SubsDetailOrderInfo;

import Main from "./block/main";
import { OrderAccInfoProvider } from "./hooks/accInfoContext";

const AccInfoMain = () => {
  return (
    <OrderAccInfoProvider>
      <Main />
    </OrderAccInfoProvider>
  );
};

export default AccInfoMain;

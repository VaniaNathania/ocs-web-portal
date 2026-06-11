import Main from "./blocks/main";
import { OrderSubsDetailAccInfoProvider } from "./hooks/SubsDetailAccInfoContext";

const SubsDetailAccInfo = () => {
  return (
    <OrderSubsDetailAccInfoProvider>
      <Main />
    </OrderSubsDetailAccInfoProvider>
  );
};

export default SubsDetailAccInfo;

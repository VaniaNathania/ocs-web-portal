import Main from "./blocks/main";
import { OrderSubsDetailSubsInfoProvider } from "./hooks/SubsDetailSubsInfoContext";

const SubsDetailSubsInfo = () => {
  return (
    <OrderSubsDetailSubsInfoProvider>
      <Main />
    </OrderSubsDetailSubsInfoProvider>
  );
};

export default SubsDetailSubsInfo;

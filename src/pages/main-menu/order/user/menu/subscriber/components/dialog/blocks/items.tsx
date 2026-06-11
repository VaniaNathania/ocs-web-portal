import SubsDetailAccInfo from "../components/acc-info/SubsDetailAccInfo";
import SubsDetailOrderInfo from "../components/order-info/SubsDetailOrderInfo";
import SubsDetailSubsInfo from "../components/subs-info/SubsDetailSubsInfo";
import { useOrderSubsDetail } from "../hooks/SubsDetailContext";

const SubsDetailItems = () => {
  const { selectedMenu } = useOrderSubsDetail();

  if (selectedMenu === "subscriber") return <SubsDetailSubsInfo />;
  if (selectedMenu === "order") return <SubsDetailOrderInfo />;
  if (selectedMenu === "account") return <SubsDetailAccInfo />;
};

export default SubsDetailItems;

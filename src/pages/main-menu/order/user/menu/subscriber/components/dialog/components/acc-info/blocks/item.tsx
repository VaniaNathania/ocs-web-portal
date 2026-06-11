import UnderConstruction from "@/components/common/UnderConstruction";
import { useOrderSubsDetailAccInfo } from "../hooks/SubsDetailAccInfoContext";
import AcctInfoAcctDetail from "../components/AcctInfo";
import Deposit from "../components/Deposit";
import PaymentInfo from "../components/PaymentInfo";
import DebtInfo from "../components/DebtInfo";
import AccBalTable from "@/pages/main-menu/order/user/menu/accBalance/block/AccBalTable";
import { useSubscriberListContext } from "../../../../../hooks";

const Item = () => {
  const { selectedMenu } = useOrderSubsDetailAccInfo();
  const { selectedSubs } = useSubscriberListContext();

  switch (selectedMenu) {
    case "acct info":
      return <AcctInfoAcctDetail />;
    case "deposit":
      return <Deposit />;
    case "payment":
      return <PaymentInfo />;
    case "debt":
      return <DebtInfo />;
    case "acct bal":
      return <AccBalTable acctId={selectedSubs?.acctId} />;
    default:
      return <UnderConstruction desc={selectedMenu} />;
  }
};

export default Item;

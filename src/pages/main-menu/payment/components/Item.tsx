import { lazy, Suspense } from "react";
import UnderConstruction from "@/components/common/UnderConstruction";
import { usePayment } from "../hooks/PaymentContext";
import { Loading } from "../../role-management/block/loadingBlock";

// lazy imports
const CurrBillTable = lazy(() => import("./curr-bill/CurrBill"));
const BillDetailPage = lazy(() => import("./bill-detail/BillDetailPage"));
const HistoryBillPage = lazy(() => import("./history-bill/HistoryBillPage"));
const AccountBillTable = lazy(() => import("./acct-bal/AccountBal"));
const BonusRuleTable = lazy(() => import("./bonus-rule/BonusRule"));
const ShareFromOtherTable = lazy(() => import("./share-from-other/ShareFromOther"));
const ShareToOtherTable = lazy(() => import("./share-to-other/ShareToOther"));
const AllBillTable = lazy(() => import("./all-bill/AllBillPage"));
const PaymentPlanTable = lazy(() => import("./payment-plan/PaymentPlan"));

const ItemPayment = () => {
  const { selectedMenu } = usePayment();

  const renderContent = () => {
    switch (selectedMenu) {
      case "curr bill":
        return <CurrBillTable />;
      case "bill detail":
        return <BillDetailPage />;
      case "history":
        return <HistoryBillPage />;
      case "acct balance":
        return <AccountBillTable />;
      case "bonus rule":
        return <BonusRuleTable />;
      case "share from other":
        return <ShareFromOtherTable />;
      case "share to other":
        return <ShareToOtherTable />;
      case "all bill":
        return <AllBillTable />;
      case "payment plan":
        return <PaymentPlanTable />;
      default:
        return <UnderConstruction desc={selectedMenu} />;
    }
  };

  return <Suspense fallback={<Loading />}>{renderContent()}</Suspense>;
};

export default ItemPayment;

import { lazy, useState } from "react";
import { usePayment } from "../hooks/PaymentContext";
import PaymentDetail from "../components/PaymentDetail";
import PaymentQuery from "../components/PaymentQuery";
import Menu from "../components/Menu";
import ItemPayment from "../components/Item";
import ReverseDialog from "../components/reverse/ReverseDialog";
import RefundDialog from "../components/refund/Refund";
import { Loading } from "../../role-management/block/loadingBlock";
import AdvanceSearchDialog from "../../tcel-balance-management/blocks/advance-search/AdvanceSearch";

const InstantInvoiceDialog = lazy(
  () => import("../components/instant-invoice/InstantInvoiceDialog"),
);

const Main = () => {
  const {
    isLoading,
    setIsLoading,
    query,
    setQuery,
    rows,
    totalRows,
    selectedRow,
    setSelectedRow,
  } = usePayment();
  const [showSearch, setShowSearch] = useState<boolean>(false);

  // const mockData = mockAcc
  return (
    <div className="flex flex-col p-5 gap-2">
      {isLoading && <Loading />}
      {/* acc nbr */}
      <PaymentQuery setShowSearch={setShowSearch} />
      {/* cust detail */}
      <PaymentDetail />
      {/* menu */}
      <Menu />
      {/* item */}
      <ItemPayment />
      <AdvanceSearchDialog
        isOpen={showSearch}
        handleDialog={setShowSearch}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
      />
      <ReverseDialog />
      <RefundDialog />
      <InstantInvoiceDialog />
    </div>
  );
};

export default Main;

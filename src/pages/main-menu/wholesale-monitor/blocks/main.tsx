import { useEffect, useState } from "react";
import BatchDetailDialog from "../components/BatchDetail/batchDetailDialog";
import OperatorDialog from "../components/operator/operatorDialog";
import Query from "../components/query";
import Table from "../components/table";
import { useWholesaleMonitor } from "../hooks/context";
import { AcctInfoPayment } from "../../payment/interfaces";
import AdvanceSearchDialog from "../../tcel-balance-management/blocks/advance-search/AdvanceSearch";

const Main = () => {
  const { showCustSearch, setShowCustSearch, setTempQuery } =
    useWholesaleMonitor();
  const [selectedRow, setSelectedRow] = useState<AcctInfoPayment>();

  useEffect(() => {
    if (selectedRow)
      setTempQuery((prev) => ({
        ...prev,
        custId: selectedRow?.custId,
        custName: selectedRow?.custName,
      }));
  }, [selectedRow]);
  return (
    <div className="flex flex-col gap-5 p-5">
      <Query />
      <Table />
      <BatchDetailDialog />
      <OperatorDialog />
      <AdvanceSearchDialog
        isOpen={showCustSearch}
        handleDialog={setShowCustSearch}
        setSelectedRow={setSelectedRow}
        selectedRow={selectedRow}
      />
    </div>
  );
};

export default Main;

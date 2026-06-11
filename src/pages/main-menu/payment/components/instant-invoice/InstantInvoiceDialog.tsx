import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import { usePayment } from "../../hooks/PaymentContext";
import ListToolbar from "./blocks/ListToolbar";
import Main from "./blocks/Main";
import BillDetail from "./blocks/BillDetail";

const instantInvoiceDialog = () => {
  const { showInstantInvoice, setShowInstantInvoice } = usePayment();
  return (
    <DialogWrapper isOpen={showInstantInvoice} title="Instant Invoice" handleDialog={setShowInstantInvoice}>
      <div className="h-fit overflow-y-auto">
        <ListToolbar />

        <Main />

        <BillDetail />
      </div>
    </DialogWrapper>
  );
};

export default instantInvoiceDialog;

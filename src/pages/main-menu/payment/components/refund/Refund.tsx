import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import { usePayment } from "../../hooks/PaymentContext";
import Main from "./blocks/main";

const RefundDialog = () => {
  const { showRefund, setShowRefund } = usePayment();

  return (
    <DialogWrapper
      isOpen={showRefund}
      handleDialog={setShowRefund}
      title="Refund"
      size={{}}
    >
      <Main />
    </DialogWrapper>
  );
};

export default RefundDialog;

import { ParentDialogProps } from "@/pages/main-menu/role-management/generalUseComp";
import { OrderPaymentHistoryAccInfoProvider } from "./hook/paymentHistoryContext";
import Main from "./block/main";

const PaymentHistoryAccInfo = ({ isOpen, handleDialog }: ParentDialogProps) => {
  return (
    <OrderPaymentHistoryAccInfoProvider>
      <Main isOpen={isOpen} handleDialog={handleDialog} />
    </OrderPaymentHistoryAccInfoProvider>
  );
};

export default PaymentHistoryAccInfo;

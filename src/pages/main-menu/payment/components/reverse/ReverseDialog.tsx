import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import { usePayment } from "../../hooks/PaymentContext";
import Main from "./blocks/main";
import { ReverseDialogProvider } from "./hooks/context";

const ReverseDialog = () => {
  const { showReverse, setShowReverse } = usePayment();

  return (
    <DialogWrapper isOpen={showReverse} handleDialog={setShowReverse} title="Reverse" size={{}}>
      <ReverseDialogProvider>
        <Main />
      </ReverseDialogProvider>
    </DialogWrapper>
  );
};

export default ReverseDialog;

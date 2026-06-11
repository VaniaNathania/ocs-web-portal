import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import { useOrderListContext } from "../../hooks";
import { OrderOrderDetailProvider } from "./hooks/context";
import Main from "./blocks/main";

const OrderDetail = () => {
  const { showDetail, setShowDetail } = useOrderListContext();
  return (
    <DialogWrapper
      isOpen={showDetail}
      handleDialog={setShowDetail}
      title="Order Detail"
      size={{ width: "6xl" }}
    >
      <OrderOrderDetailProvider>
        <Main />
      </OrderOrderDetailProvider>
    </DialogWrapper>
  );
};

export default OrderDetail;

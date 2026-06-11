import { Container, DataGridInner } from "@/components";
import { OrderListContextProvider } from "./hooks";
import OrderDetail from "./components/detail/orderDetail";
import OrderSearch from "./components/searchDialog";

export default function OrderListPage() {
  return (
    <OrderListContextProvider>
      <Container className="p-1">
        <OrderDetail />
        <OrderSearch />

        <DataGridInner />
        {/* <div className="grid gap-5 lg:gap-7.5">
                    </div> */}
      </Container>
    </OrderListContextProvider>
  );
}

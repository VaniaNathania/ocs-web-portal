import Main from "./blocks/Main";
import { BillDetailProvider } from "./hooks/context";

const BillDetailPage = () => {
  return (
    <BillDetailProvider>
      <Main />
    </BillDetailProvider>
  );
};

export default BillDetailPage;

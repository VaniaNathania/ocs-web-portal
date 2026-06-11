import Main from "./blocks/Main";
import HistoryBillContext, { HistoryBillProvider } from "./hooks/context";

const HistoryBillPage = () => {
  return (
    <HistoryBillProvider>
      <Main />
    </HistoryBillProvider>
  );
};

export default HistoryBillPage;

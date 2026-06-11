import Main from "./blocks/Main";
import { AllBillProvider } from "./hooks/AllBillContext";

const AllBillPage = () => {
  return (
    <AllBillProvider>
      <Main />
    </AllBillProvider>
  );
};

export default AllBillPage;

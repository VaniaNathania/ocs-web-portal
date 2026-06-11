import { DataGridInner } from "@/components";
import { BankProvider } from "./hooks/BankContext";

const Bank = () => {
  return (
    <>
      <BankProvider>
        <h1></h1>
      </BankProvider>
    </>
  );
};

export default Bank;

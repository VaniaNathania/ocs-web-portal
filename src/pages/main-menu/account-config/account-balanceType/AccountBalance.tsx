import { DataGridInner } from "@/components";
import { AccountBalanceProvider } from "./hooks/AccountBalanceContext";
import BalanceEditDialog from "./blocks/BalanceEditDialog";

const AccountBalance = () => {
  return (
    <>
      <AccountBalanceProvider>
        <div className="border-l-4 border-red-500 bg-white px-6 py-4 shadow-sm m-4">
          <h1 className="text-2xl font-bold text-gray-900">Account Balance</h1>
          <p className="text-sm text-gray-500 mt-1">Manage Account Balance</p>
        </div>
        <div className="grid gap-5 lg:gap-7.5 my-3 mx-5">
          <DataGridInner />
        </div>
        {/* <BalanceEditDialog /> */}
      </AccountBalanceProvider>
    </>
  );
};

export default AccountBalance;

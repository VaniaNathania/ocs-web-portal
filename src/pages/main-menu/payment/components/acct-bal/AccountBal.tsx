import Main from "./blocks/main";
import { AccountBalanceProvider } from "./hooks/context";

const AccountBillTable = () => {
  return (
    <AccountBalanceProvider>
      <Main />
    </AccountBalanceProvider>
  );
};

export default AccountBillTable;

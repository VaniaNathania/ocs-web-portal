import { DataGridInner } from "@/components";
import { AccountItemProvider } from "./hooks/AccountItemContext";
import AddDialog from "./blocks/AddDialog";
import UpdateDialog from "./blocks/UpdateDialog";
import DeleteDialog from "./blocks/DeleteDialog";

const AccountItem = () => {
  return (
    <>
      <AccountItemProvider>
        <div className="border-l-4 border-red-500 bg-white px-6 py-4 shadow-sm m-4">
          <h1 className="text-2xl font-bold text-gray-900">Account Item Type</h1>
          <p className="text-sm text-gray-500 mt-1">Manage Account Item Type</p>
        </div>{" "}
        <div className="grid gap-5 lg:gap-7.5 my-3 mx-5">
          <DataGridInner />
        </div>
        {/* <BalanceEditDialog /> */}
        <AddDialog />
        <UpdateDialog />
        <DeleteDialog />
      </AccountItemProvider>
    </>
  );
};

export default AccountItem;

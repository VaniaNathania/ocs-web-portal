import { DataGridInner } from "@/components";
import { AccountFeatureProvider } from "./hooks/AccountFeatureContext";

const AccountFeature = () => {
  return (
    <div>
      <AccountFeatureProvider>
        <div className="border-l-4 border-red-500 bg-white px-6 py-4 shadow-sm m-4">
          <h1 className="text-2xl font-bold text-gray-900">Account Feature</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage Account Feature Provider
          </p>
        </div>
        <div className="grid gap-5 lg:gap-7.5 my-3 mx-5">
          <DataGridInner />
        </div>
      </AccountFeatureProvider>
    </div>
  );
};

export default AccountFeature;

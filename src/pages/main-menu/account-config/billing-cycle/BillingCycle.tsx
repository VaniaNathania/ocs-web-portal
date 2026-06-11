import { DataGridInner } from "@/components";
import { BillingCycleTypeProvider } from "./hooks/BillingCycleTypeContext";

const BillingCycle = () => {
  return (
    <>
      <BillingCycleTypeProvider>
        <div className="border-l-4 border-red-500 bg-white px-6 py-4 shadow-sm m-4">
          <h1 className="text-2xl font-bold text-gray-900">Billing Cycle</h1>
          <p className="text-sm text-gray-500 mt-1">Manage Billing Cycle Type</p>
        </div>
        <div className="grid gap-5 lg:gap-7.5  mx-5">
          <DataGridInner />
        </div>
      </BillingCycleTypeProvider>
    </>
  );
};

export default BillingCycle;

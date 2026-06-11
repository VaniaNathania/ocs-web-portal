import { DataGridInner } from "@/components";
import { PaymentMethodProvider } from "./hooks/PaymentMethodContext";
import FormDialog from "./blocks/FormDialog";
import ParameterDialog from "./blocks/ParameterDialog";

const PaymentMethod = () => {
  return (
    <div>
      <PaymentMethodProvider>
        <div className="border-l-4 border-red-500 bg-white px-6 py-4 shadow-sm m-4">
          <h1 className="text-2xl font-bold text-gray-900">Payment Method</h1>
          <p className="text-sm text-gray-500 mt-1">Manage Payment Method</p>
        </div>
        <div className="grid gap-5 lg:gap-7.5 my-3 mx-5">
          <DataGridInner />
        </div>
      </PaymentMethodProvider>
    </div>
  );
};

export default PaymentMethod;

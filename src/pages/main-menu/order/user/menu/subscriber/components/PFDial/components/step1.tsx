import CustInfoForm from "@/pages/main-menu/order/component/CustomerInfoForm";
import { usePFDial } from "../hooks/context";
import { useState } from "react";
import { useSubscriberListContext } from "../../../hooks";

const Step1 = () => {
  const { form, setForm } = usePFDial();
  const [errors, setErrors] = useState<Record<string, string>>({});
  return (
    <div className="w-full p-5">
      <CustInfoForm
        form={form}
        setForm={setForm}
        errors={errors}
        setErrors={setErrors}
        isNew={true}
        showPassField={false}
      />
    </div>
  );
};

export default Step1;

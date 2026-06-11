import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import { useRegisterCustInfo } from "../hooks/context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { suspensionReason } from "../../SURSTEPS/interface/mock";
import SectionTitle from "../../sectionTitle";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { useSubscriberListContext } from "../../../hooks";

const RCIStep1 = () => {
  const { form, setForm, RCIUseQuery, allData } = useRegisterCustInfo();
  const { orderUseQuery } = useOrder();
  const { selectedSubs } = useSubscriberListContext();

  return (
    <div className="flex flex-col gap-5 w-full">
      <SectionTitle title="Offer Information" />

      <div className="grid grid-cols-2 gap-10 gap-y-2 w-full">
        <BuildFormRow label="Subscription Plan">
          <Input size="sm" value={selectedSubs?.subsPlanName} disabled />
        </BuildFormRow>

        <BuildFormRow label="Order Number">
          <Input size="sm" value={allData?.custOrderNbr} disabled />
        </BuildFormRow>

        <BuildFormRow label="Service Number">
          <Input size="sm" value={selectedSubs?.accNbr} disabled />
        </BuildFormRow>

        <BuildFormRow label="Payment Account">
          <Input size="sm" value={selectedSubs?.acctNbr} disabled />
        </BuildFormRow>

        <BuildFormRow label="Default Language">
          <Select
            value={form.language?.toString()}
            onValueChange={(value) =>
              setForm((prev) => ({
                ...prev,
                language: Number(value),
              }))
            }
            disabled
          >
            <SelectTrigger size="sm" className="flex-1">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {orderUseQuery.data?.defLang.map((item) => (
                <SelectItem
                  key={item.defLangId}
                  value={item.defLangId.toString()}
                >
                  {item.defLangName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </BuildFormRow>

        <BuildFormRow label="User Type">
          <Select
            value={form.userTypeId?.toString()}
            onValueChange={(value) =>
              setForm((prev) => ({
                ...prev,
                userTypeId: Number(value),
              }))
            }
            disabled
          >
            <SelectTrigger size="sm" className="flex-1">
              <SelectValue placeholder="Select User Type" />
            </SelectTrigger>
            <SelectContent>
              {RCIUseQuery.data?.billingCycleType.map((item) => (
                <SelectItem
                  key={item.billingCycleTypeId}
                  value={item.billingCycleTypeId.toString()}
                >
                  {item.billingCycleTypeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </BuildFormRow>
      </div>
    </div>
  );
};

export default RCIStep1;

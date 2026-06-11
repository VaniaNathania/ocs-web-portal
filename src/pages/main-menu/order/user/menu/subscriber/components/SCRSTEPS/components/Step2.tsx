import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubscriberListContext } from "../../../hooks";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { MockUserType } from "../interfaces/mock";
import { useSCR } from "../hooks/context";
import { suspensionReason } from "../../SURSTEPS/interface/mock";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import SectionTitle from "../../sectionTitle";

const SCRStep2 = () => {
  const { selectedSubs } = useSubscriberListContext();
  const { orderUseQuery } = useOrder();
  const { form, setForm, SCRInfoUseQuery, allData } = useSCR();

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* ================= Offer Information ================= */}
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
              {SCRInfoUseQuery.data?.billingCycleType.map((item) => (
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

      {/* ================= Order Information ================= */}
      <SectionTitle title="Order Information" className="mt-5" />

      <div className="grid grid-cols-2 gap-10 gap-y-2 w-full">
        <BuildFormRow label="Suspension Reason">
          <Select
            value={form.susPensionReasonId?.toString()}
            onValueChange={(value) =>
              setForm((prev) => ({
                ...prev,
                susPensionReasonId: Number(value),
              }))
            }
            disabled
          >
            <SelectTrigger size="sm" className="flex-1">
              <SelectValue placeholder="Select Suspension Reason" />
            </SelectTrigger>
            <SelectContent>
              {suspensionReason.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
              {SCRInfoUseQuery.data?.orderReason.map((item) => (
                <SelectItem
                  key={item.orderReasonId}
                  value={item.orderReasonId.toString()}
                >
                  {item.orderReasonName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </BuildFormRow>

        {form.otherReason !== "" && (
          <BuildFormRow label="Other Order Reason">
            <Input
              size="sm"
              value={form.otherReason}
              disabled
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  otherReason: e.target.value,
                }))
              }
            />
          </BuildFormRow>
        )}
      </div>
    </div>
  );
};

export default SCRStep2;

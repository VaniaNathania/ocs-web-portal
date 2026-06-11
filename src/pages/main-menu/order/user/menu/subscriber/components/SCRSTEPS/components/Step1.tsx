import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { MockUserType } from "../interfaces/mock";
import { suspensionReason } from "../../SURSTEPS/interface/mock";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import SectionTitle from "../../sectionTitle";
import { useOrderUser } from "@/pages/main-menu/order/user/hooks/context";
import { useEffect } from "react";
import { useSCR } from "../hooks/context";

const SCRStep1 = () => {
  const { orderUseQuery } = useOrder();
  const {} = useOrder();
  const { form, setForm, SCRInfoUseQuery } = useSCR();

  useEffect(() => {
    //  console.log(form);

    const isInOrder: number | undefined =
      SCRInfoUseQuery.data?.orderReason.findIndex(
        (item) => item.orderReasonId === form.susPensionReasonId,
      );

    const temp = !isInOrder
      ? ""
      : isInOrder <= 0
        ? ""
        : SCRInfoUseQuery.data?.orderReason[isInOrder].orderReasonName;

    setForm((prev) => ({ ...prev, otherReason: temp ?? "" }));
  }, [form.susPensionReasonId]);

  return (
    <div className="flex flex-col">
      {/* ================= Current Information ================= */}
      {/* <SectionTitle title="Current Information" /> */}

      {/* <div className="grid grid-cols-2 gap-10 gap-y-2 w-full">
        <BuildFormRow label="Default Language">
          <Select
            value={form.language?.toString()}
            onValueChange={(value) =>
              setForm((prev) => ({
                ...prev,
                language: Number(value),
              }))
            }
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

        <BuildFormRow label="User Type" isRequired>
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
      </div> */}

      {/* ================= Order Information ================= */}
      <SectionTitle title="Order Information" className="" />

      <div
        className={`grid grid-cols-2 gap-10 ${!form.susPensionReasonId ? "gap-y-0" : "gap-y-2"} w-full`}
      >
        <BuildFormRow label="Order Reason">
          <div
            className={`flex items-center ${!form.susPensionReasonId ? "gap-0" : "gap-2"}  w-full`}
          >
            <Select
              value={form.susPensionReasonId?.toString()}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  susPensionReasonId: Number(value),
                }))
              }
            >
              <SelectTrigger size="sm" className="flex-1">
                <SelectValue placeholder="Select Order Reason" />
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

            <div
              className={`overflow-hidden transition-all duration-300 ${
                !form.susPensionReasonId ? "max-w-0" : "max-w-[40px]"
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    susPensionReasonId: undefined,
                  }))
                }
              >
                <KeenIcon icon="cross" />
              </Button>
            </div>
          </div>
        </BuildFormRow>

        <div
          className={`transition-all duration-300 overflow-hidden ${
            !form.susPensionReasonId
              ? "opacity-0 max-h-0"
              : "opacity-100 max-h-20"
          }`}
        >
          <BuildFormRow label="Other Order Reason">
            <Input
              size="sm"
              value={form.otherReason}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  otherReason: e.target.value,
                }))
              }
            />
          </BuildFormRow>
        </div>
      </div>
    </div>
  );
};

export default SCRStep1;

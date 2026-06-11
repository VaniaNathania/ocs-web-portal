import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRUR } from "../hooks/context";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { suspensionReason } from "../../SURSTEPS/interface/mock";

const RURStep1 = () => {
  const { form, setForm, isOpen, setIsOpen } = useRUR();

  return (
    <>
      {/* <PopUpDialog isOpen={isOpen} handleDialog={setIsOpen} title="Warning" type="alert" desc="Reservation Date can not be earlier than the current date." /> */}
      <div className="grid grid-cols-2 gap-5">
        <BuildFormRow label="Suspension Reason">
          <div className="flex flex-row items-center flex-1">
            <Select value={form.suspensionReasonId ?? ""} onValueChange={(value) => setForm((prev) => (prev = { ...prev, suspensionReasonId: value ?? null }))}>
              <SelectTrigger className="flex-1" size="sm">
                <SelectValue placeholder="Select Suspension Reason" />
              </SelectTrigger>
              <SelectContent>
                {suspensionReason.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className={`overflow-hidden transition-all duration-300 ${!form.suspensionReasonId ? "max-w-[0px]" : "max-w-[40px]"}`}>
              <Button variant={"ghost"} size={"sm"} onClick={() => setForm((prev) => (prev = { ...prev, suspensionReasonId: null }))}>
                <KeenIcon icon="cross" />
              </Button>
            </div>
          </div>
        </BuildFormRow>
        {form.suspensionReasonId == "1" && (
          <BuildFormRow label="Other Order Reason">
            <Input size={"sm"} className="flex-1" value={form.orderReason} onChange={(e) => setForm((prev) => (prev = { ...prev, orderReason: e.target.value }))} />
          </BuildFormRow>
        )}
      </div>
    </>
  );
};

export default RURStep1;

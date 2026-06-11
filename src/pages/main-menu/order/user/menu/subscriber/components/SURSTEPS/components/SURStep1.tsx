import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  periodType,
  reactivationTime,
  suspensionReason,
} from "../interface/mock";
import { useSUR } from "../hooks/context";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { useSubscriberListContext } from "../../../hooks";

const SURStep1 = () => {
  const { form, setForm, isOpen, setIsOpen } = useSUR();
  const { isLoading } = useSubscriberListContext();

  return (
    <>
      <PopUpDialog
        isOpen={isOpen}
        handleDialog={setIsOpen}
        title="Warning"
        type="alert"
        desc="Reservation Date can not be earlier than the current date."
      />
      <div className="grid grid-cols-2 gap-5">
        {isLoading && <Loading />}
        <BuildFormRow label="Suspension Reason">
          <div className="flex flex-row items-center flex-1">
            <Select
              value={form.susPensionReasonId ?? ""}
              onValueChange={(value) =>
                setForm(
                  (prev) =>
                    (prev = { ...prev, susPensionReasonId: value ?? null }),
                )
              }
            >
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
            <div
              className={`overflow-hidden transition-all duration-300 ${!form.susPensionReasonId ? "max-w-[0px]" : "max-w-[40px]"}`}
            >
              <Button
                variant={"ghost"}
                size={"sm"}
                onClick={() =>
                  setForm(
                    (prev) => (prev = { ...prev, susPensionReasonId: null }),
                  )
                }
              >
                <KeenIcon icon="cross" />
              </Button>
            </div>
          </div>
        </BuildFormRow>
        {form.susPensionReasonId == "1" && (
          <BuildFormRow label="Other Order Reason">
            <Input
              size={"sm"}
              className="flex-1"
              value={form.orderReason}
              onChange={(e) =>
                setForm(
                  (prev) => (prev = { ...prev, orderReason: e.target.value }),
                )
              }
            />
          </BuildFormRow>
        )}

        <BuildFormRow label="Reservation Time">
          <input
            type="datetime-local"
            className={`input input-sm bg-white flex-1 ${!form.resrvTime ? "border-red-500 hover:border-red-500" : ""}`}
            value={form.resrvTime}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, resrvTime: e.target.value }));
              //  console.log("form", e.target.value);
              e.target.blur();
            }}
            step={1}
          />
        </BuildFormRow>

        <BuildFormRow label="Remarks">
          <Input
            size={"sm"}
            className="flex-1"
            value={form.comments}
            onChange={(e) =>
              setForm((prev) => (prev = { ...prev, comments: e.target.value }))
            }
          />
        </BuildFormRow>

        <BuildFormRow label="Reactivation Time" isRequired>
          <div className="flex-1 flex flex-row justify-center">
            <Select
              value={form.reactTimeId ?? ""}
              onValueChange={(value) =>
                setForm(
                  (prev) => (prev = { ...prev, reactTimeId: value ?? "" }),
                )
              }
            >
              <SelectTrigger
                className="flex-1 transition-all duration-300"
                size="sm"
              >
                <SelectValue placeholder="Select Reactivation Time" />
              </SelectTrigger>
              <SelectContent>
                {reactivationTime.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div
              className={`overflow-hidden transition-all duration-300 ${!form.reactTimeId ? "max-w-[0px]" : "max-w-[40px]"}`}
            >
              <Button
                variant={"ghost"}
                size={"sm"}
                onClick={() => {
                  setForm((prev) => (prev = { ...prev, reactTimeId: null }));
                }}
              >
                <KeenIcon icon="cross" />
              </Button>
            </div>
          </div>
        </BuildFormRow>

        {form.reactTimeId === "T" && (
          <BuildFormRow label="Period" isRequired>
            <div className="flex-1 flex flex-row gap-2">
              <Input
                size={"sm"}
                className="w-1/4"
                type="number"
                value={form.periodTime}
                min={1}
                onChange={(e) =>
                  setForm(
                    (prev) =>
                      (prev = {
                        ...prev,
                        periodTime: parseInt(e.target.value),
                      }),
                  )
                }
              />
              <Select
                value={form.periodTypeId}
                onValueChange={(value) =>
                  setForm((prev) => (prev = { ...prev, periodTypeId: value }))
                }
              >
                <SelectTrigger className="flex-1" size="sm">
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  {periodType.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </BuildFormRow>
        )}
        {form.reactTimeId === "Y" && (
          <BuildFormRow label="Time" isRequired>
            <input
              type="datetime-local"
              className="input input-sm bg-white flex-1"
              value={form.exactTime}
              onChange={(e) =>
                setForm(
                  (prev) => (prev = { ...prev, exactTime: e.target.value }),
                )
              }
              step={1}
            />
          </BuildFormRow>
        )}
      </div>
    </>
  );
};

export default SURStep1;

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTermination } from "../hooks/context";
import { useEffect } from "react";
import clsx from "clsx";

const TermStep1 = () => {
  const { form, setForm, orderReason, setDateError, dateError } =
    useTermination();

  useEffect(() => {
    setForm((prev) => ({ ...prev, termReason: "", orderReasonId: 0 }));
  }, [form.susPensionReasonId]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-row items-center gap-2">
        <div className="h-5 w-2 rounded-sm bg-primary" />
        <div>Termination</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-row items-center gap-2">
          <Label className="flex flex-row gap-2 w-1/4">
            <div className="flex-1">Reason</div>
            <Input
              className="w-[15px] h-[15px]"
              type="radio"
              checked={form.susPensionReasonId === "0"}
              onChange={() =>
                setForm((prev) => (prev = { ...prev, susPensionReasonId: "0" }))
              }
              size={"sm"}
            />
          </Label>
          <Select
            value={`${form.orderReasonId}#${form.termReason}`}
            disabled={form.susPensionReasonId != "0"}
            onValueChange={(value) =>
              setForm(
                (prev) =>
                  (prev = {
                    ...prev,
                    termReason: value.split("#")[1] ?? "",
                    orderReasonId: Number(value.split("#")[0]),
                  }),
              )
            }
          >
            <SelectTrigger className="flex-1" size="sm">
              <SelectValue placeholder="Select Order Reason" />
            </SelectTrigger>
            <SelectContent>
              {/* <SelectItem key={"Not In Use"} value={"Not In Use"}>
                Not In Use
              </SelectItem>
              <SelectItem key={"SIM Card Lost"} value={"SIM Card Lost"}>
                SIM Card Lost
              </SelectItem> */}
              {orderReason.map((item) => (
                <SelectItem
                  key={item.orderReasonId}
                  value={`${item.orderReasonId.toString()}#${item.orderReasonName}`}
                >
                  {item.orderReasonName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className={`flex flex-row gap-2 items-center `}>
          <Label className="flex flex-row gap-2 w-1/4 items-center">
            <div className="flex-1">Other Reason</div>
            <Input
              className="w-[15px] h-[15px]"
              type="radio"
              checked={form.susPensionReasonId === "1"}
              onChange={() =>
                setForm((prev) => (prev = { ...prev, susPensionReasonId: "1" }))
              }
              size={"sm"}
            />
          </Label>
          <Input
            size={"sm"}
            disabled={form.susPensionReasonId != "1"}
            className="flex-1"
            value={form.susPensionReasonId == "1" ? form.termReason : ""}
            onChange={(e) =>
              setForm(
                (prev) => (prev = { ...prev, termReason: e.target.value }),
              )
            }
          />
        </div>
        <div className="flex flex-row gap-2 items-center  mt-2">
          <Label className="w-1/4">Reservation Time</Label>
          <input
            type="datetime-local"
            className={clsx(
              "flex-1 input input-sm",
              dateError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500",
            )}
            value={form.resrvTime}
            onChange={(e) => {
              const value = e.target.value;

              if (!value) return;

              const selected = new Date(value);
              const today = new Date();

              // normalize both to date-only
              selected.setHours(0, 0, 0, 0);
              today.setHours(0, 0, 0, 0);

              if (selected <= today) {
                setDateError("Date must be after today");
              } else {
                setDateError("");
              }

              setForm(
                (prev) => (prev = { ...prev, resrvTime: e.target.value }),
              );
            }}
          />
        </div>
        <div className="flex flex-row gap-2 items-center  mt-2">
          <Label className="w-1/4">Remarks</Label>
          <Input
            size={"sm"}
            className="flex-1"
            value={form.comments}
            onChange={(e) =>
              setForm((prev) => (prev = { ...prev, comments: e.target.value }))
            }
          />
        </div>
      </div>
    </div>
  );
};

export default TermStep1;

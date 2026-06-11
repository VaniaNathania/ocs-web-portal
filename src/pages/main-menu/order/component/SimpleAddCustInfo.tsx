import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustForm } from "./CustomerInfoForm";
import { useOrder } from "../hooks/orderContext";
import { TooltipLabel } from "../../role-management/generalUseComp";
import { MasterDataOrder } from "../models/interfaces";

const SimpleAddCustInfo = ({
  disable = false,
  form,
  setForm,
  isNew = true,
  errors,
  setErrors,
}: CustForm) => {
  const { orderUseQuery } = useOrder();
  const _masterDataOrder: MasterDataOrder = orderUseQuery.data!;
  const { title, certType, attr, impGrade } = _masterDataOrder || {};
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row items-center gap-2">
        <div className="h-4 border-r-4 border-primary" />
        <h2>New Customer Information</h2>
      </div>
      <div className="grid grid-cols-2 text-sm gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Customer Name" required />
            <Input
              disabled={disable}
              className="flex-1"
              size={"sm"}
              value={form?.custName}
              onChange={(e) => {
                if (!setForm) return;

                const value = e.target.value;

                setForm((prev) => ({ ...prev, custName: value }));

                if (!setErrors) return;

                setErrors((prev) => {
                  if (!prev) return prev; // or return {}
                  const { custName: _, ...rest } = prev;
                  return rest;
                });
              }}
            />
          </div>
          {(errors ?? {})["custName"] && (
            <div className="flex flex-row items-center">
              <div className="w-40" />
              <span className="text-red-500">Please fill this field</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Customer Type" required />
            <Select
              disabled
              onValueChange={(e) => {
                if (!setForm) return;
                setForm((prev) => ({ ...prev, custType: e }));
                if (!setErrors) return;

                setErrors((prev) => {
                  if (!prev) return prev; // or return {}
                  const { custType: _, ...rest } = prev;
                  return rest;
                });
              }}
              value={form?.custType}
            >
              <SelectTrigger className="flex-1" size="sm">
                <SelectValue placeholder="Select Customer Type" />
              </SelectTrigger>
              <SelectContent>
                {/* {attr.map((item) => (
                    <SelectItem
                      key={item.valueMark}
                      value={item.attrValueId.toString()}
                    >
                      {item.valueMark}
                    </SelectItem>
                  ))} */}
                <SelectItem key={"A"} value={"A"}>
                  Individual Customer
                </SelectItem>
                <SelectItem key={"C"} value={"C"}>
                  Corporate Customer
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(errors ?? {})["custType"] && (
            <div className="flex flex-row items-center">
              <div className="w-40" />
              <span className="text-red-500">Please fill this field</span>
            </div>
          )}
        </div>

        <div className="flex flex-row items-center">
          <TooltipLabel className="w-40" text="Important Grade" />
          <Select
            disabled={disable}
            onValueChange={(e) => {
              if (!setForm) return;

              setForm((prev) => ({ ...prev, impGradeId: parseInt(e) }));
            }}
            value={
              form?.impGradeId?.toString() !== "0"
                ? form?.impGradeId?.toString()
                : ""
            }
          >
            <SelectTrigger className="flex-1" size="sm">
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent>
              {impGrade?.map((item) => (
                <SelectItem
                  key={item.impGradeId?.toString()}
                  value={item.impGradeId?.toString()}
                >
                  {item.impGradeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-row items-center">
          <TooltipLabel className="w-40" text="Gender" />
          <div className="flex-1 flex flex-row gap-2">
            <label className="flex items-center gap-2">
              <Input
                type="radio"
                disabled={disable}
                checked={form?.gender === "M"}
                onChange={() => {
                  if (!setForm) return;

                  setForm((prev) => ({ ...prev, gender: "M" }));
                }}
                className="w-[15px] h-[15px] accent-primary"
              />
              <span>Male</span>
            </label>
            <label className="flex items-center gap-2">
              <Input
                type="radio"
                disabled={disable}
                checked={form?.gender === "F"}
                onChange={() => {
                  if (!setForm) return;

                  setForm((prev) => ({ ...prev, gender: "F" }));
                }}
                className="w-[15px] h-[15px] accent-primary"
              />
              <span>Female</span>
            </label>
          </div>
        </div>

        <div className="flex flex-row items-center">
          <TooltipLabel className="w-40" text="Title" />
          <Select
            disabled={disable}
            onValueChange={(e) => {
              if (!setForm) return;

              setForm((prev) => ({ ...prev, custTitleId: parseInt(e) }));
            }}
            value={
              form?.custTitleId?.toString() !== "0"
                ? form?.custTitleId?.toString()
                : ""
            }
          >
            <SelectTrigger className="flex-1" size="sm">
              <SelectValue placeholder="Select Title" />
            </SelectTrigger>
            <SelectContent>
              {title?.map((item) => (
                <SelectItem
                  key={item.titleId?.toString()}
                  value={item.titleId?.toString()}
                >
                  {item.titleName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-row items-center">
          <TooltipLabel className="w-40" text="Birthday" />
          <input
            type="date"
            disabled={disable}
            className="flex-1 border-[0.8px] p-1 rounded-md border-slate-200 
                      focus:border-primary focus:ring-primary outline-none 
                      disabled:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            value={form?.birthdayDay}
            onChange={(e) => {
              if (!setForm) return;

              setForm((prev) => ({ ...prev, birthdayDay: e.target.value }));
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Doc Type" required />
            <Select
              disabled={disable}
              onValueChange={(e) => {
                if (!setForm) return;

                setForm((prev) => ({ ...prev, certTypeId: parseInt(e) }));
                if (!setErrors) return;

                setErrors((prev) => {
                  if (!prev) return prev; // or return {}
                  const { certTypeId: _, ...rest } = prev;
                  return rest;
                });
              }}
              value={
                form?.certTypeId?.toString() !== "0"
                  ? form?.certTypeId?.toString()
                  : ""
              }
            >
              <SelectTrigger className="flex-1" size="sm">
                <SelectValue placeholder="Select Document Type" />
              </SelectTrigger>
              <SelectContent>
                {certType.map((item) => (
                  <SelectItem
                    key={item.certTypeId?.toString()}
                    value={item.certTypeId?.toString()}
                  >
                    {item.certTypeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(errors ?? {})["certTypeId"] && (
            <div className="flex flex-row items-center">
              <div className="w-40" />
              <span className="text-red-500">Please fill this field</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Doc Number" required />
            <Input
              disabled={disable}
              className="flex-1"
              size={"sm"}
              value={form?.certNbr}
              onChange={(e) => {
                if (!setForm) return;

                setForm((prev) => ({ ...prev, certNbr: e.target.value }));
                if (!setErrors) return;

                setErrors((prev) => {
                  if (!prev) return prev; // or return {}
                  const { certNbr: _, ...rest } = prev;
                  return rest;
                });
              }}
            />
          </div>
          {(errors ?? {})["certNbr"] && (
            <div className="flex flex-row items-center">
              <div className="w-40" />
              <span className="text-red-500">Please fill this field</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleAddCustInfo;

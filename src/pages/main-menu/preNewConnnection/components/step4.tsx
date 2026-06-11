import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePreNew } from "../hooks/context";
import useStep4 from "../services/useStep4";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
import CustomerSearch from "../blocks/CustomerSearch";
const PncStep4 = () => {
  const { form, setForm, triggerSubmit } = usePreNew();
  const { handleCustSearch, getDetail } = useStep4();

  return (
    <div className="flex flex-col gap-5">
      <CustomerSearch
        isOpen={form.showDialog}
        handleDialog={(open) => {
          setForm((prev) => ({
            ...prev,
            showDialog: open,
          }));
        }}
      />
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-row gap-2 items-center">
          <Label className="w-32">Action Type</Label>
          <Input value={form.actionType === "0" ? "Pre-New Connection" : ""} className=" flex-1 h-8" readOnly />
        </div>

        <div className="flex flex-row gap-2 items-center">
          <Label className="w-32">Subscription Plan</Label>
          <Input value={""} className=" flex-1 h-8" readOnly />
        </div>

        <div className="flex flex-row gap-2 col-span-2 items-center">
          <Label className="w-32">Price Plan</Label>
          <Input value={getDetail("PRICEPLAN")} title={getDetail("PRICEPLAN")} className=" flex-1 h-8 truncate" readOnly />
        </div>

        <div className="flex flex-row gap-2 col-span-2 items-center">
          <Label className="w-32">Service</Label>
          <Input value={getDetail("SERVICE")} title={getDetail("SERVICE")} className=" flex-1 h-8 truncate" readOnly />
        </div>

        <div className="flex flex-row gap-2 items-center">
          <Label className="w-32">Resource Type</Label>
          <Input value={getDetail("RESOURCETYPE")} className=" flex-1 h-8" readOnly />
        </div>
      </div>

      <hr />

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-row gap-2 items-center">
          <Label className="w-32">
            <span className="text-red-500">*</span>Telecom Region
          </Label>
          <div className={`input input-sm bg-white flex-1 h-8 ${!form.selectedAreaId && triggerSubmit ? "border-red-500 hover:border-red-500" : ""}`}>
            <Select
              onValueChange={(val) => {
                setForm((prev) => ({
                  ...prev,
                  selectedAreaId: Number(val),
                }));
              }}
              value={String(form.selectedAreaId ?? "")}
            >
              <SelectTrigger className="flex-1 h-7 w-10 border-none">
                <SelectValue placeholder="Select..." />
                {form.selectedAreaId && (
                  <div className="flex flex-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          selectedAreaId: undefined,
                        }));
                      }}
                    >
                      <KeenIcon icon="cross" />
                    </Button>
                  </div>
                )}
              </SelectTrigger>
              <SelectContent>
                {form.areaDetail.length > 0 &&
                  form.areaDetail.map((item) => (
                    <SelectItem key={item.areaId} value={String(item.areaId)}>
                      {item.areaName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-row gap-2 items-center">
          <Label className="w-32">Customer</Label>
          <div className="input input-sm bg-white flex-1 h-8">
            <Input className="border-none" value={form.custName ?? ""} title={form.custName ?? ""} readOnly onClick={handleCustSearch} />
            <div className="flex flex-1 justify-end">
              {form.custName && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      custId: undefined,
                      custName: undefined,
                    }));
                  }}
                >
                  <KeenIcon icon="cross" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-2 items-center">
          <Label className="w-32">
            <span className="text-red-500">*</span>Company
          </Label>
          <div className={`input input-sm bg-white flex-1 h-8 ${!form.selectedOrgId && triggerSubmit ? "border-red-500 hover:border-red-500" : ""}`}>
            <Select
              onValueChange={(val) => {
                setForm((prev) => ({
                  ...prev,
                  selectedOrgId: Number(val),
                }));
              }}
              value={String(form.selectedOrgId ?? "")}
            >
              <SelectTrigger className="flex-1 h-7 w-10 border-none">
                <SelectValue placeholder="Select..." />
                {form.selectedOrgId && (
                  <div className="flex flex-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          selectedOrgId: undefined,
                        }));
                      }}
                    >
                      <KeenIcon icon="cross" />
                    </Button>
                  </div>
                )}
              </SelectTrigger>
              <SelectContent>
                {form.orgData.length > 0 &&
                  form.orgData.map((item) => (
                    <SelectItem key={item.orgId} value={String(item.orgId)}>
                      {item.orgName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-row gap-2 items-center">
          <Label className="w-32">
            <span className="text-red-500">*</span>Run Time
          </Label>
          <div className={`input input-sm h-8 bg-white flex-1 ${!form.reqDate && triggerSubmit ? "border-red-500 hover:border-red-500" : ""}`}>
            <input
              type="datetime-local"
              step="1"
              className="flex-1 border-none input input-sm"
              value={form.reqDate ?? ""}
              onChange={(e) => {
                e.target.blur();
                setForm((prev) => ({
                  ...prev,
                  reqDate: e.target.value,
                }));
              }}
            />
          </div>
        </div>

        <div className="flex flex-row gap-2 items-center">
          <Label className="w-32">Remarks</Label>
          <div className="input input-sm bg-white flex-1 h-8">
            <Input
              className="border-none"
              value={form.remarks ?? ""}
              title={form.remarks ?? ""}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, remarks: e.target.value }));
              }}
            />
            <div className="flex flex-1 justify-end">
              {form.remarks && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      remarks: null,
                    }));
                  }}
                >
                  <KeenIcon icon="cross" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-2 items-center">
          <Label className="w-32">
            <span className="text-red-500">*</span>Default Language
          </Label>
          <div className={`input input-sm bg-white flex-1 h-8 ${!form.selectedDefLangId && triggerSubmit ? "border-red-500 hover:border-red-500" : ""}`}>
            <Select
              onValueChange={(val) => {
                // setSelectedDefLangId(Number(val));
                setForm((prev) => ({
                  ...prev,
                  selectedDefLangId: Number(val),
                }));
              }}
              value={String(form.selectedDefLangId ?? "")}
            >
              <SelectTrigger className="flex-1 h-7 w-10 border-none">
                <SelectValue placeholder="Select..." />
                {form.selectedDefLangId && (
                  <div className="flex flex-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          selectedDefLangId: undefined,
                        }));
                      }}
                    >
                      <KeenIcon icon="cross" />
                    </Button>
                  </div>
                )}
              </SelectTrigger>
              <SelectContent>
                {form.defLanguage.length > 0 &&
                  form.defLanguage.map((item) => (
                    <SelectItem key={item.defLangId} value={String(item.defLangId)}>
                      {item.defLangName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PncStep4;

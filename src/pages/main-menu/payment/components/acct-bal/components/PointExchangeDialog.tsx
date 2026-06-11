import { BuildFormRow } from "@/components/common/BuildFormRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogWrapper, PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { useAccountBalance } from "../hooks/context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockBalanceExchangeRule } from "../models/mock";
import { KeenIcon } from "@/components";
import { usePayment } from "../../../hooks/PaymentContext";

const PointExchangeDialog = () => {
  const {
    selectedRows,
    pointExchangeDialog,
    setPointExchangeDialog,
    pointExchangeDialogForm,
    setPointExchangeDialogForm,
    getObjAcctType,
    handleSubmitPointExchange,
    srcDisplayValue,
    setSrcDisplayValue,
    objDisplayValue,
    setObjDisplayValue,
    dialogType,
    setDialogType,
    triggerSubmit,
    setTriggerSubmit,
  } = useAccountBalance();
  const { formatedValue } = usePayment();

  return (
    <DialogWrapper size={{ width: "5xl" }} isOpen={pointExchangeDialog} handleDialog={setPointExchangeDialog} title="Point Exchange">
      <PopUpDialog isOpen={dialogType !== null} handleDialog={() => setDialogType(null)} title="Information" type="alert" desc="Fail to validate participants." />
      <div className="gap-2 mt-5">
        <BuildFormRow label="Source Account Type">
          <div className="input input-sm">
            <Input value={selectedRows?.acctResName} size={"sm"} className="border-none" disabled />
          </div>
        </BuildFormRow>
        <BuildFormRow label="Maximum Exchange Value">
          <div className="input input-sm">
            <Input size={"sm"} className="border-none" value={selectedRows?.isCurrency === "Y" ? formatedValue(selectedRows?.grossBal) : selectedRows?.grossBal.toString().replace("-", "")} disabled />
          </div>
        </BuildFormRow>
        <div>
          <BuildFormRow label="Balance Exchange Value" isRequired>
            <div className="input input-sm">
              <Select
                onValueChange={(val) => {
                  const selectedVal = mockBalanceExchangeRule.find((item) => item.balExchangeRuleId === val);

                  const rawAmount = Number(selectedVal?.srcValue);
                  const amount = rawAmount / 100000;

                  setPointExchangeDialogForm((prev) => ({ ...prev, balExchangeRuleId: val, objAcctResId: selectedVal?.objAcctResId ?? null, spendAmount: rawAmount ? rawAmount : null, objAmount: selectedVal?.objValue ?? null }));

                  if (amount !== null && amount !== undefined) {
                    const obj = amount / 2;
                    setSrcDisplayValue(
                      amount.toLocaleString("en-US", {
                        minimumFractionDigits: 5,
                        maximumFractionDigits: 5,
                      }),
                    );
                    setObjDisplayValue(
                      obj.toLocaleString("en-US", {
                        minimumFractionDigits: 5,
                        maximumFractionDigits: 5,
                      }),
                    );
                  } else {
                    setSrcDisplayValue("");
                    setObjDisplayValue("");
                  }
                }}
                value={String(pointExchangeDialogForm?.balExchangeRuleId ?? "")}
              >
                <SelectTrigger className="flex-1 h-7 w-10 border-none">
                  <SelectValue placeholder="Select..." />
                  {pointExchangeDialogForm.objAcctResId && (
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
                          setPointExchangeDialogForm((prev) => ({ ...prev, balExchangeRuleId: null, objAcctResId: null, spendAmount: null, objAmount: null }));
                          setSrcDisplayValue("");
                          setObjDisplayValue("");
                        }}
                      >
                        <KeenIcon icon="cross" />
                      </Button>
                    </div>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {mockBalanceExchangeRule.length > 0 &&
                    mockBalanceExchangeRule.map((item) => (
                      <SelectItem key={item.balExchangeRuleId} value={String(item.balExchangeRuleId)}>
                        {item.balExchangeRuleName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </BuildFormRow>
          {triggerSubmit && pointExchangeDialogForm.balExchangeRuleId === null && <span className="text-red-500 text-sm">Balance Exchange Value is required.</span>}
        </div>
        <div>
          <BuildFormRow label="Object Account Type" isRequired>
            <div className="input input-sm flex flex-row">
              <Input value={getObjAcctType(pointExchangeDialogForm.objAcctResId ?? null)} size={"sm"} className="border-none" />
            </div>
          </BuildFormRow>
          {triggerSubmit && pointExchangeDialogForm.objAcctResId === null && <span className="text-red-500 text-sm">Object Account is required.</span>}
        </div>
        <div>
          <BuildFormRow label="Exchange Value" isRequired>
            <div className="input input-sm">
              <Input
                value={srcDisplayValue}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d.]/g, "");
                  setSrcDisplayValue(raw);
                  const amount = Number(raw);
                  setPointExchangeDialogForm((prev) => ({ ...prev, spendAmount: amount ? Math.round(amount * 100000) : null }));
                }}
                onBlur={() => {
                  if (!srcDisplayValue) return;
                  const amount = Number(srcDisplayValue);
                  if (amount === 0) {
                    setSrcDisplayValue("");
                    return;
                  }
                  const ObjValue = amount / 2;
                  setSrcDisplayValue(
                    amount.toLocaleString("en-US", {
                      minimumFractionDigits: 5,
                      maximumFractionDigits: 5,
                    }),
                  );

                  setObjDisplayValue(
                    ObjValue.toLocaleString("en-US", {
                      minimumFractionDigits: 5,
                      maximumFractionDigits: 5,
                    }),
                  );
                }}
                size={"sm"}
                className="border-none"
              />
            </div>
          </BuildFormRow>
          {triggerSubmit && pointExchangeDialogForm.spendAmount === null && <span className="text-red-500 text-sm">Please enter a number between 1 and 999999999999.</span>}
        </div>
        <BuildFormRow label="Object Value">
          <div className="input input-sm">
            <Input value={objDisplayValue} size={"sm"} className="border-none" disabled />
          </div>
        </BuildFormRow>
        <div className="col-span-2 flex justify-end gap-2 mt-2">
          <Button size={"sm"} onClick={() => handleSubmitPointExchange(pointExchangeDialogForm)}>
            OK
          </Button>
          <Button size={"sm"} variant={"outline"} onClick={() => setPointExchangeDialog(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </DialogWrapper>
  );
};

export default PointExchangeDialog;

import { DialogWrapper, PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { useAccountBalance } from "../hooks/context";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const BalanceDialog = () => {
  const { balAdd, setBalAdd, selectedRows, balanceDialogForm, setBalanceDialogForm, handleSubmitBalanceDialog, handleAmountBlur, handleAmountChange, displayValue, getDate, getBalance, dialogType, setDialogType, loading } =
    useAccountBalance();

  return (
    <DialogWrapper size={{ width: "5xl" }} isOpen={balAdd} handleDialog={setBalAdd} title="Balance">
      <PopUpDialog
        isOpen={dialogType !== null}
        handleDialog={() => setDialogType(null)}
        title="Information"
        type="alert"
        desc={`The ${dialogType === "Ceil" ? "cycle" : "daily"} upper limit must be greater than or equal to the ${dialogType === "Ceil" ? "cycle" : "daily"} lower limit`}
      />
      <div className="grid grid-cols-2 gap-2 mt-5">
        <BuildFormRow label="Balance Type">
          <div className="input input-sm">
            <Input value={selectedRows?.acctResName} size={"sm"} className="border-none" disabled />
          </div>
        </BuildFormRow>
        <BuildFormRow label="Cycle Upper Limit">
          <div className="input input-sm">
            <Input size={"sm"} className="border-none" value={displayValue.ceilLimit} onChange={(e) => handleAmountChange(e.target.value, "ceilLimit")} onBlur={() => handleAmountBlur("ceilLimit")} />
          </div>
        </BuildFormRow>
        <BuildFormRow label="Is Curency">
          <div className="input input-sm">
            <Input value={selectedRows?.isCurrency === "Y" ? "Yes" : "No"} size={"sm"} className="border-none" disabled />
          </div>
        </BuildFormRow>
        <BuildFormRow label="Cycle Lower Limit">
          <div className="input input-sm">
            <Input value={displayValue.floorLimit} onChange={(e) => handleAmountChange(e.target.value, "floorLimit")} onBlur={() => handleAmountBlur("floorLimit")} size={"sm"} className="border-none" />
          </div>
        </BuildFormRow>
        <BuildFormRow label="Balance">
          <div className="input input-sm">
            <Input value={getBalance(selectedRows?.grossBal!, selectedRows?.isCurrency!)} size={"sm"} className="border-none" disabled />
          </div>
        </BuildFormRow>
        <BuildFormRow label="Daily Upper Limit">
          <div className="input input-sm">
            <Input value={displayValue.dailyCeilLimit} onChange={(e) => handleAmountChange(e.target.value, "dailyCeilLimit")} onBlur={() => handleAmountBlur("dailyCeilLimit")} size={"sm"} className="border-none" />
          </div>
        </BuildFormRow>
        <BuildFormRow label="Effective Date">
          <div className="input input-sm">
            <input value={getDate(selectedRows?.effDate ?? "")} type="date" className="border-none disabled:cursor-not-allowed" disabled />
          </div>
        </BuildFormRow>
        <BuildFormRow label="Daily Lower Limit">
          <div className="input input-sm">
            <Input value={displayValue.dailyFloorLimit} onChange={(e) => handleAmountChange(e.target.value, "dailyFloorLimit")} onBlur={() => handleAmountBlur("dailyFloorLimit")} className="border-none" />
          </div>
        </BuildFormRow>
        <BuildFormRow label="Expiry Date">
          <div className="input input-sm">
            <input value={getDate(selectedRows?.expDate ?? "")} type="date" className="border-none disabled:cursor-not-allowed" disabled />
          </div>
        </BuildFormRow>
        <BuildFormRow label="Priority">
          <div className="input input-sm">
            <Input
              value={balanceDialogForm?.priority ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                const finalValue = value.replace(/[^\d.]/g, "");
                setBalanceDialogForm((prev) => ({ ...prev, priority: Number(finalValue) }));
              }}
              size={"sm"}
              className="border-none"
            />
          </div>
        </BuildFormRow>
        <div className="col-span-2 flex justify-end gap-2">
          <Button size={"sm"} onClick={() => handleSubmitBalanceDialog(balanceDialogForm)} disabled={loading}>
            {loading ? "Submit..." : "OK"}
          </Button>
          <Button size={"sm"} variant={"outline"} onClick={() => setBalAdd(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </DialogWrapper>
  );
};

export default BalanceDialog;

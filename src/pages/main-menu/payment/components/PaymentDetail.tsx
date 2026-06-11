import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayment } from "../hooks/PaymentContext";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PaymentDetailActionOps from "./PaymentDetailActionOps";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatAmount } from "../../order/user/menu/subscriber/components/general";
import { apiConfig } from "@/config/api.config";
import { useMemo, useState } from "react";
import ReceiptReqDialog from "./ReceiptDialog";
import { AccessWrapper } from "../../role-management/hook/useRoleCheck";
import CreditOrDebitBalanceFields from "./dynamic-fields/CreditOrDebitBalanceField";
import CheckField from "./dynamic-fields/CheckField";
import ScratchCardField from "./dynamic-fields/ScratchCardField";
import DeductDepositField from "./dynamic-fields/DeductDepositField";
import { KeenIcon } from "@/components";

const API_URL = apiConfig.service_payment;

const PaymentDetail = () => {
  const {
    selectedRow,
    isLoading,
    setShowReverse,
    paymentUseQuery,
    webRechargeUseQuery,
    error,
    setError,
    form,
    setForm,
    receiptPopUp,
    setReceiptPopUp,
    receiptBlob,
    OnCredit,
    menuPrivAccess,
  } = usePayment();
  const [selectedSubsIdx, setSelectedSubsIdx] = useState<string>();
  const [searchAcctRes, setSearchAcctRes] = useState<string>("");
  const [openAcctRes, setOpenAcctRes] = useState<boolean>(false);

  const BalTypeOptions = useMemo(
    () =>
      paymentUseQuery.data?.balanceType.filter((item) =>
        item.acctResName.toLowerCase().includes(searchAcctRes.toLowerCase()),
      ),
    [paymentUseQuery.data?.balanceType, searchAcctRes],
  );

  const SelectedBalType = useMemo(
    () =>
      BalTypeOptions?.find((e) => e.acctResId === form?.acctResId)
        ?.acctResName || "Please Select",
    [form?.acctResId, paymentUseQuery.data?.balanceType],
  );

  const IssueDateField = () => (
    <div className="flex flex-row items-center gap-2">
      <Label className="w-36">Issue Date</Label>
      <div className="input input-sm flex-1">
        <Input type="date" className="p-0 border-none" size="sm" />
      </div>
    </div>
  );

  const ExpiryDateField = () => (
    <div className="flex flex-row items-center gap-2">
      <Label className="w-36">Expiry Date</Label>
      <div className="input input-sm flex-1">
        <Input type="date" className="p-0 border-none" size="sm" />
      </div>
    </div>
  );

  const CreditOrDebitBalance = () => {
    return (
      <>
        {/* Card No */}
        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">
            Card No <span className="text-red-500">*</span>
          </Label>
          <div className="input input-sm flex-1">
            <Input className="p-0 border-none" size="sm" />
          </div>
        </div>

        {/* Issue Date date field */}
        <IssueDateField />

        {/* Expiry Date date field */}
        <ExpiryDateField />
      </>
    );
  };

  const Check = () => {
    return (
      <>
        {/* Bank Name */}
        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">
            Bank Name <span className="text-red-500">*</span>
          </Label>
          <div className="input input-sm flex-1">
            <Select
              value={
                form?.paymentMethodId?.toString() ??
                selectedRow?.paymentMethodId?.toString()
              }
              disabled={!selectedRow}
              onValueChange={(e) =>
                setForm((prev) => ({ ...prev, paymentMethodId: Number(e) }))
              }
            >
              <SelectTrigger className="border-none bg-transparent p-0">
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent>
                {/* {paymentUseQuery.data?.paymentMethod.map((item) => {
                  // if (item.paymentMethodId === 1 || item.paymentMethodId === 6)
                  return (
                    <SelectItem value={item.paymentMethodId.toString()} key={item.paymentMethodId}>
                      {item.paymentMethodName}
                    </SelectItem>
                  );
                })} */}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Issue Date date field */}
        <IssueDateField />

        {/* Check No */}
        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">
            Check No <span className="text-red-500">*</span>
          </Label>
          <div className="input input-sm flex-1">
            <Input className="p-0 border-none" size="sm" />
          </div>
        </div>

        {/* Expiry Date date field */}
        <ExpiryDateField />

        {/* Issue Date text field */}
        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">Issue Date</Label>
          <div className="input input-sm flex-1">
            <Input className="p-0 border-none" size="sm" />
          </div>
        </div>

        {/* Expiry Date text field */}
        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">Expiry Date</Label>
          <div className="input input-sm flex-1">
            <Input className="p-0 border-none" size="sm" />
          </div>
        </div>
      </>
    );
  };

  const ScratchCard = () => (
    // Scratch Card PIN
    <div className="flex flex-row items-center gap-2">
      <Label className="w-36">
        Scratch Card PIN <span className="text-red-500">*</span>
      </Label>
      <div className="input input-sm flex-1">
        <Input className="p-0 border-none" size="sm" />
      </div>
    </div>
  );

  const DeductDeposit = () => {
    return (
      <>
        {/* Issue Date date field */}
        <IssueDateField />

        {/* Expiry Date date field */}
        <ExpiryDateField />
      </>
    );
  };

  const renderDynamicMethod = () => {
    switch (form?.paymentMethodId) {
      case 2:
        return (
          <CreditOrDebitBalanceFields
            error={error.cardNo}
            value={form?.checkNbr ?? ""}
            onChange={(value) => {
              setForm((prev) => ({ ...prev, checkNbr: value }));

              setError((prev) => ({ ...prev, cardNo: false }));
            }}
          />
        );
      case 3:
        return (
          <CheckField
            errorBank={error.bankId}
            errorCheckNo={error.checkNo}
            valueBank={form.check?.bankId}
            valueCheckNo={form.check?.checkNo}
            onChange={(value) => {
              setForm((prev) => ({
                ...prev,
                check: {
                  ...prev?.check,
                  checkNo: value,
                },
              }));

              setError((prev) => ({ ...prev, checkNo: false }));
            }}
            onValueChange={(value) => {
              setForm((prev) => ({
                ...prev,
                check: {
                  ...prev?.check,
                  bankId: value,
                },
              }));

              setError((prev) => ({ ...prev, bankId: false }));
            }}
          />
        );
      case 4:
        return (
          <ScratchCardField
            error={error.scratchCardPin}
            value={form.scratchCardPin ?? ""}
            onChange={(value) => {
              setForm((prev) => ({ ...prev, scratchCardPin: value }));

              setError((prev) => ({ ...prev, scratchCardPin: false }));
            }}
          />
        );
      case 7:
        return <DeductDepositField />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-2 border-2 p-2">
      <div className=" grid grid-cols-1 relative sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full">
        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">Customer Name</Label>
          <div className="input input-sm flex-1">
            <Input
              className="p-0 border-none"
              size="sm"
              value={selectedRow?.custName ?? ""}
              disabled
            />
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">Account Number</Label>
          <div className="input input-sm flex-1">
            <Input
              className="p-0 border-none"
              size="sm"
              value={selectedRow?.acctNbr ?? ""}
              disabled
            />
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">Payment Source</Label>
          <div className="input input-sm flex-1">
            <Input
              className="p-0 border-none"
              size="sm"
              disabled={!selectedRow}
              value={form?.paymentSource ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, paymentSource: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">Real-Time Balance</Label>
          <div className="input input-sm flex-1">
            <Input
              className="p-0 border-none"
              size="sm"
              disabled
              value={formatAmount(
                webRechargeUseQuery?.data?.defaultBalInfo?.grossBal ?? 0,
              ).replace("-", "Credit ")}
            />
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">Overdue</Label>
          <div className="input input-sm flex-1">
            <Input
              className="p-0 border-none"
              size="sm"
              disabled
              value={formatAmount(
                webRechargeUseQuery?.data?.billDetail.due ?? 0,
              )}
            />
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">Remarks</Label>
          <div className="input input-sm flex-1">
            <Input
              className="p-0 border-none"
              size="sm"
              disabled={!selectedRow}
              value={form?.remarks ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, remarks: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">
            Sum Received <span className="text-red-600">*</span>
          </Label>
          <div
            className={`input input-sm flex-1 ${error["submitAmount"] ? "border-red-600" : ""}`}
          >
            <Input
              disabled={!selectedRow}
              className="p-0 border-none"
              size="sm"
              type="number"
              min={0}
              step={0.00001}
              value={form?.submitAmount ?? ""}
              onChange={(e) => {
                //  console.log(e.target.value);

                setError((prev) => ({ ...prev, submitAmount: false }));
                setForm((prev) => ({
                  ...prev,
                  submitAmount: e.target.value,
                }));
              }}
            />
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">Sum Receivable</Label>
          <div className="input input-sm flex-1">
            <Input className="p-0 border-none" size="sm" disabled />
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">Change</Label>
          <div className="input input-sm flex-1">
            <Input disabled className="p-0 border-none" size="sm" />
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">
            Payment Method<span className="text-red-600">*</span>
          </Label>
          <div className="input input-sm flex-1">
            {/* <Input
              className="p-0 border-none"
              size="sm"
              value={selectedRow?.paymentMethodName}
              disabled={!selectedRow}
            /> */}
            <Select
              value={
                form?.paymentMethodId?.toString() ??
                selectedRow?.paymentMethodId?.toString()
              }
              disabled={!selectedRow}
              onValueChange={(e) =>
                setForm((prev) => ({ ...prev, paymentMethodId: Number(e) }))
              }
            >
              <SelectTrigger className="border-none bg-transparent p-0">
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent>
                {paymentUseQuery.data?.paymentMethod.map((item) => {
                  // if (item.paymentMethodId === 1 || item.paymentMethodId === 6)
                  return (
                    <SelectItem
                      value={item.paymentMethodId.toString()}
                      key={item.paymentMethodId}
                    >
                      {item.paymentMethodName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">
            Balance Type<span className="text-red-600">*</span>
          </Label>
          {/* <div className="input input-sm flex-1">
            <Select
              disabled={!selectedRow}
              value={String(form?.acctResId) ?? ""}
              onValueChange={(e) =>
                setForm((prev) => ({ ...prev, acctResId: Number(e) }))
              }
            >
              <SelectTrigger className="border-none bg-transparent p-0">
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent>
                {paymentUseQuery.data?.balanceType.map((item) => (
                  <SelectItem
                    value={item.acctResId.toString()}
                    key={item.acctResId}
                  >
                    {item.acctResName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
          <div className="flex flex-1 min-w-0" title={SelectedBalType}>
            <Popover open={openAcctRes} onOpenChange={setOpenAcctRes}>
              <PopoverTrigger
                asChild
                className="flex-1 flex"
                disabled={!selectedRow}
              >
                <Button
                  className="justify-start flex-1 truncate"
                  variant="outline"
                  size={"sm"}
                >
                  <div className="flex flex-row w-full items-center justify-between">
                    {SelectedBalType}
                    <KeenIcon icon="down" />
                  </div>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                <Command>
                  <CommandInput
                    placeholder="Search..."
                    value={searchAcctRes}
                    onValueChange={setSearchAcctRes}
                  />

                  <CommandEmpty>No results</CommandEmpty>

                  <CommandGroup
                    className="overflow-y-auto max-h-[400px]"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    {BalTypeOptions?.map((item) => (
                      <CommandItem
                        key={item.acctResId}
                        onSelect={() => {
                          setForm((prev) => ({
                            ...prev,
                            acctResId: item.acctResId,
                          }));

                          setOpenAcctRes(false); // close popover
                        }}
                      >
                        {item.acctResName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">
            Service Number{" "}
            <span className="text-red-500">{`${form?.paymentMethodId === 4 ? "*" : ""}`}</span>
          </Label>
          <div
            className={`input input-sm flex-1 ${error.subsId ? "border-red-500" : ""}`}
          >
            <Select
              disabled={!selectedRow}
              value={selectedSubsIdx ?? ""}
              onValueChange={(e) => {
                setError((prev) => ({ ...prev, subsId: false }));
                setForm((prev) => ({
                  ...prev,
                  prefix: webRechargeUseQuery?.data?.subsList[Number(e)].prefix,
                  accNbr: webRechargeUseQuery?.data?.subsList[Number(e)].accNbr,
                  msisdn:
                    (webRechargeUseQuery?.data?.subsList[Number(e)].prefix ??
                      "") +
                    (webRechargeUseQuery?.data?.subsList[Number(e)].accNbr ??
                      ""),
                  subsId: webRechargeUseQuery?.data?.subsList[Number(e)].subsId,
                }));
                setSelectedSubsIdx(e);
              }}
            >
              <SelectTrigger className="border-none bg-transparent p-0">
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent>
                {webRechargeUseQuery?.data?.subsList.map((item, index) => (
                  <SelectItem value={index.toString()} key={item.subsId}>
                    {item.accNbr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Render Dynamic Method */}
        {paymentUseQuery?.data?.paymentMethod &&
          paymentUseQuery?.data?.paymentMethod.length > 0 &&
          renderDynamicMethod()}
      </div>
      <div className="grid grid-cols-1 relative sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full">
        <div className="flex flex-row items-center gap-2">
          <Label className="w-36">Without (giving) Change</Label>
          {/* <div className="input input-sm flex-1 flex items-center"> */}
          <Input
            type="checkbox"
            size="sm"
            className="p-0 border-none w-[14px] h-[14px]"
          />
          {/* </div> */}
        </div>

        <div className="flex flex-row gap-2 justify-end col-span-1 md:col-span-2">
          <AccessWrapper hasAccess={menuPrivAccess?.addStatus ?? false}>
            <Button
              disabled={!selectedRow}
              size="sm"
              onClick={() => OnCredit(true)}
            >
              Credit
            </Button>
          </AccessWrapper>
          <AccessWrapper hasAccess={menuPrivAccess?.addStatus ?? false}>
            <Button
              disabled={!selectedRow}
              size="sm"
              variant="outline"
              onClick={() => setShowReverse(true)}
            >
              Reverse
            </Button>
          </AccessWrapper>
          <PaymentDetailActionOps />
        </div>
      </div>
      <ReceiptReqDialog
        isOpen={receiptPopUp}
        handleDialog={setReceiptPopUp}
        blob={receiptBlob}
      />
    </div>
  );
};

export default PaymentDetail;

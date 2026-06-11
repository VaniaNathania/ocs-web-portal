import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { KeenIcon } from "@/components";
import TermStep2Container from "../block/TermStep2FirstPartContainer";
import { useTermination } from "../hooks/context";
import { mockCashDeskFee } from "../../modifysubscriber/model/mock";
import {
  CashDeskFee,
  QryDefaultBAL,
} from "../../modifysubscriber/model/interfaces";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { formatAmount } from "../../../../accBalance/block/AccBalTable";

const API_ORDER = apiConfigOrder.order;

const TermStep2 = () => {
  const {
    form,
    setForm,
    allData,
    setDefaultBal,
    paymentMethod,
    setPaymentMethod,
    amount,
    setAmount,
    setDateError,
    dateError,
    defaultBal,
  } = useTermination();
  const { GetData } = useCallApi();
  const [cashDesk, setCashDesk] = useState<CashDeskFee[]>();

  const fetchAccBal = async (): Promise<QryDefaultBAL | null> => {
    try {
      const resp = await GetData(
        `${API_ORDER}/api/order-entry/order-entry-order-initialize-V2/qry-default-bal`,
        { acctId: allData?.orderItemList[0].acctId },
      );

      if (!resp.status) {
        toast.error(resp.message);
        return null;
      }
      setDefaultBal(resp.data);
      return resp.data;
    } catch (error) {
      toast.error("Client Side Error");
      return null;
    }
  };

  const AccBalList: UseQueryResult<QryDefaultBAL | null> = useQuery({
    queryKey: ["acc-bal-term", allData?.acctId],
    queryFn: fetchAccBal,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setCashDesk(allData?.cashDeskFee ?? []);
  }, [allData?.cashDeskFee]);
  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex flex-row items-center gap-2">
        <div className="h-5 w-2 rounded-sm bg-primary" />
        <div>Tariff Information</div>
      </div>
      <TermStep2Container cashDeskFee={cashDesk ?? []} />
      <div className="flex flex-row items-center gap-2">
        <div className="h-5 w-2 rounded-sm bg-primary" />
        <div>Payment Method</div>
      </div>
      {/* payment method */}
      <div className="flex flex-row gap-2 text-sm">
        <div
          className={`rounded-md border-2 transition-all duration-300 relative py-2 px-4  overflow-hidden 
            ${paymentMethod.includes("0") ? "border-primary text-primary cursor-default" : "border-slate-200 text-slate-600 cursor-pointer"}`}
          onClick={() => {
            const tempPayment: string[] = paymentMethod;
            if (tempPayment.includes("0")) {
              setAmount((prev) => ({ ...prev, cash: "" }));
              return setPaymentMethod(
                tempPayment.filter((item) => item !== "0"),
              );
            } else return setPaymentMethod((prev) => [...prev, "0"]);
          }}
        >
          <div>Cash</div>
          <div
            className={`bg-primary absolute w-[40px] h-[40px] rotate-45 transition-all duration-300
                translate-x-1/2 translate-y-1/2 ${paymentMethod.includes("0") ? "right-0 bottom-0" : "-right-5 -bottom-5"}`}
          >
            <div className="absolute text-white -rotate-45 bottom-2 left-0">
              <KeenIcon icon="check" />
            </div>
          </div>
        </div>
        <div
          className={`rounded-md border-2 transition-all duration-300 relative py-2 px-4  overflow-hidden 
            ${paymentMethod.includes("1") ? "border-primary text-primary cursor-default" : "border-slate-200 text-slate-600 cursor-pointer"}`}
          onClick={() => {
            const tempPayment: string[] = paymentMethod;
            if (tempPayment.includes("1")) {
              setAmount((prev) => ({ ...prev, cash: "" }));
              return setPaymentMethod(
                tempPayment.filter((item) => item !== "1"),
              );
            } else return setPaymentMethod((prev) => [...prev, "1"]);
          }}
        >
          <div>Balance Deduction</div>
          <div
            className={`bg-primary absolute w-[40px] h-[40px] rotate-45 transition-all duration-300  translate-x-1/2 translate-y-1/2 ${paymentMethod.includes("1") ? "right-0 bottom-0" : "-right-5 -bottom-5"}`}
          >
            <div className="absolute text-white -rotate-45 bottom-2 left-0">
              <KeenIcon icon="check" />
            </div>
          </div>
        </div>
      </div>
      {paymentMethod.includes("0") && (
        <div className="flex flex-row w-1/2 items-center">
          <Label className="w-20">
            Payment Amount
            <span className="text-red-500">*</span>
          </Label>
          <Input
            size={"sm"}
            type="number"
            step={0.00001}
            value={amount.cash}
            onChange={(e) => {
              const val = e.target.value;
              if (
                Number(val) * 100000 + Number(amount.balance) * 100000 <
                (cashDesk ?? [])[0]?.receivableCharge -
                  (cashDesk ?? [])[0]?.discountCharge
              )
                setDateError("Insufficient Amount");
              else setDateError("");
              setAmount((prev) => ({ ...prev, cash: val }));
            }}
          />
        </div>
      )}
      {paymentMethod.includes("1") && (
        <div className="flex flex-row gap-5">
          <div className="flex flex-row gap-2 items-center">
            <Label className="w-20">Account</Label>
            <Input size={"sm"} disabled defaultValue={defaultBal?.acctId} />
          </div>
          <div className="flex flex-row gap-2 items-center">
            <Label className="w-20">Balance</Label>
            <Input
              size={"sm"}
              disabled
              defaultValue={formatAmount((defaultBal?.grossBal ?? 0) * -1)}
            />
          </div>
          <div className="flex flex-row gap-2 items-center">
            <Label className="w-20">
              Deduction
              <span className="text-red-500">*</span>
            </Label>
            <Input
              size={"sm"}
              type="number"
              step={0.00001}
              value={amount.balance}
              onChange={(e) => {
                const val = e.target.value;
                const a = Number(val) * 100000 + Number(amount.cash) * 100000;
                const b =
                  (cashDesk ?? [])[0]?.receivableCharge -
                  (cashDesk ?? [])[0]?.discountCharge;

                if (Math.abs(a - b) > 0.0001) {
                  // not equal
                  // console.log(a, b);

                  setDateError("Please put the exact Amount");
                } else setDateError("");
                setAmount((prev) => ({ ...prev, balance: val }));
              }}
            />
          </div>
        </div>
      )}
      <div className="flex flex-row h-[40px] bg-primary-clarity text-sm items-center justify-between py-2 px-4">
        <div className="flex flex-row gap-2">
          <div>Amount</div>
          <div className="text-orange-400">
            {formatAmount((cashDesk ?? [])[0]?.receivableCharge)}
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <div>Received</div>
          <div className="text-orange-400">
            {formatAmount(Number(amount.cash + amount.balance) * 100000)}
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <div>Pending Payment</div>
          <div className="text-orange-400">
            {(cashDesk ?? [])[0]?.receivableCharge >
            Number(amount.cash + amount.balance) * 100000
              ? formatAmount(
                  (cashDesk ?? [])[0]?.receivableCharge -
                    Number(amount.cash + amount.balance) * 100000,
                )
              : formatAmount(0)}
          </div>
        </div>

        <div className="flex flex-row gap-2">
          <div>Changes</div>
          <div className="text-orange-400">
            {(cashDesk ?? [])[0]?.receivableCharge <
            Number(amount.cash + amount.balance) * 100000
              ? formatAmount(
                  Number(amount.cash + amount.balance) * 100000 -
                    (cashDesk ?? [])[0]?.receivableCharge,
                )
              : formatAmount(0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermStep2;

import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiConfig, apiConfigOrder } from "@/config/api.config";
import { BalShareList } from "../../../../models/interfaces";
import { usePayment } from "@/pages/main-menu/payment/hooks/PaymentContext";
import {
  CheckNumber,
  PayloadBALShareRule,
  SubsInfoSimple,
} from "../models/interfaces";
import { useShareToOther } from "../../../../hooks/context";
import { AccBalList } from "@/pages/main-menu/order/user/menu/accBalance/models/interfaces";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AcctResListM } from "@/pages/main-menu/payment/interfaces";
import { OperationType } from "../models/type";

interface BalShareRuleContextType {
  mapSingleBalShare: (
    proccesType: "ADD" | "EDIT" | "DELETE",
    item?: BalShareList,
  ) => PayloadBALShareRule;
  form?: PayloadBALShareRule;
  setForm: Dispatch<SetStateAction<PayloadBALShareRule | undefined>>;
  setDefault: (type: "ADD" | "EDIT") => void;
  error: Record<string, string>;
  setError: Dispatch<SetStateAction<Record<string, string>>>;
  subsSimple?: SubsInfoSimple;
  setSubsSimple: Dispatch<SetStateAction<SubsInfoSimple | undefined>>;
  AccBalList: UseQueryResult<AccBalList[]>;
  AccResList: UseQueryResult<AcctResListM[]>;
  checkNumber: () => Promise<CheckNumber>;
}

// Create the context with proper typing
export const BalShareRuleContext = createContext<
  BalShareRuleContextType | undefined
>(undefined);

const API_URL = apiConfig.service_payment;
const API_ORDER = apiConfigOrder.order;

export const BalShareRuleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { selectedRow } = usePayment();
  const { GetData } = useCallApi();
  const { isBalShareAdding, selectedBal } = useShareToOther();
  const [form, setForm] = useState<PayloadBALShareRule>();
  const [subsSimple, setSubsSimple] = useState<SubsInfoSimple>();
  const [error, setError] = useState<Record<string, string>>({});

  const fetchAccBal = async (): Promise<AccBalList[]> => {
    try {
      const resp = await GetData(
        `${API_ORDER}/api/order-entry/order/web-qry-bal-list-filter-all-expire`,
        { acctId: selectedRow?.acctId },
      );

      if (!resp.status) {
        toast.error(resp.message);
        return [];
      }

      return resp.data;
    } catch (error) {
      toast.error("Client Side Error");
      return [];
    }
  };

  const AccBalList: UseQueryResult<AccBalList[]> = useQuery({
    queryKey: ["acc-bal", selectedRow?.acctId],
    queryFn: fetchAccBal,
    refetchOnWindowFocus: false,
  });

  const fetchAccRes = async (): Promise<AcctResListM[]> => {
    try {
      const resp = await GetData(
        `${API_URL}/api/payment/qry-acct-res-list-m?isCurrency=Y&refillable=Y&acctResIds=1`,
        {},
      );

      if (!resp.status) {
        toast.error(resp.message);
        return [];
      }

      //  console.log("ini act reslist m");

      return resp.data;
    } catch (error) {
      toast.error("Client Side Error");
      return [];
    }
  };

  const AccResList: UseQueryResult<AcctResListM[]> = useQuery({
    queryKey: ["acc-res-m", selectedRow?.acctId],
    queryFn: fetchAccRes,
    refetchOnWindowFocus: false,
  });

  const mapSingleBalShare = (
    proccesType: "ADD" | "EDIT" | "DELETE",
    item?: BalShareList,
  ): PayloadBALShareRule => {
    const tempError: Record<string, string> = {};
    const defaultNone = {
      acctId: selectedRow?.acctId ?? 0,
      pSubsId: 0,
      routingId: 1,
      balShare: {
        prefix: "",
        accNbr: selectedRow?.accNbr ?? "",
        ceilLimit: 0,
        dailyCeilLimit: 0,
        effDate: "",
        expDate: "",
        paymentForce: "",
        acctId: selectedRow?.acctId ?? 0,
        processType: proccesType,
        children: [],
      },
    };
    if (!item) {
      tempError["balShare"] = "Unchecked";
      setError(tempError);
      return defaultNone;
    }
    const child = item?.children?.[0];
    // if (!child) return defaultNone;

    return {
      acctId: item.acctId,
      pSubsId: child?.subsId ?? 0,
      routingId: child?.routingId ?? 1,
      balShare: {
        prefix: child?.prefix,
        accNbr: child?.accNbr,
        ceilLimit: item?.ceilLimit / 100000,
        dailyCeilLimit: item?.dailyCeilLimit / 100000,
        effDate: item.effDate,
        expDate: item.expDate,
        paymentForce: item?.paymentForce,
        acctId: item?.acctId,
        processType: item.processType ?? "EDIT",
        balShareId: item.balShareId,
        children: item.children.map((ch) => ({
          ...ch,
          balDesc: `${ch.acctResId}`,
          operType: "M",
          detailEffDate: ch.detailEffDate,
          detailExpDate: ch.detailExpDate,
          balShareId: item.balShareId,
        })),
        ownerSubsId: item.ownerSubsId,
      },
    };
  };

  const setDefault = async (type: "ADD" | "EDIT") => {
    try {
      const temp = mapSingleBalShare(type);
      setForm(temp);
    } catch (error) {}
  };

  const checkNumber = async (): Promise<CheckNumber> => {
    try {
      const tempError: Record<string, string> = {};
      if (!form?.balShare.prefix) {
        tempError["prefix"] = "Required";
      }
      if (!form?.balShare.accNbr) {
        tempError["accNbr"] = "Required";
      }
      if (!form?.balShare.paymentForce) {
        tempError["paymentForce"] = "Required";
      }
      if (!form?.balShare.effDate) {
        tempError["effDate"] = "Required";
      }
      if (form?.balShare.effDate && form.balShare.expDate) {
        const eff = new Date(form?.balShare.effDate);
        const exp = new Date(form.balShare.expDate);
        if (eff > exp)
          tempError["expDate"] = "Cannot be before the effective date";
      }
      const tempType: OperationType = form?.balShare
        .processType as OperationType;
      if (Object.values(tempError).length > 0) {
        if (tempType === "EDIT") setDefault(tempType ?? "EDIT");
        tempError["balShare"] = "Unchecked";

        toast.error("Please fill the form correctly");

        setError(tempError);
        return { status: false };
      }
      const resp = await GetData(
        `${API_URL}/api/payment/qry-subs-info-simple`,
        {
          accNbr: form?.balShare.accNbr,
          prefix: form?.balShare.prefix,
        },
      );
      if (!resp.status) {
        if (tempType === "EDIT") setDefault(tempType ?? "EDIT");

        toast.error("unsuccessfull to find the number");
        tempError["accNbr"] = "unsuccessfull to find the number";
        tempError["prefix"] = "unsuccessfull to find the number";

        tempError["balShare"] = "unsuccessfull to find the number";
        setError(tempError);

        return { status: false };
      }

      setSubsSimple(resp.data);
      setError(tempError);
      return { status: true, subsInfo: resp.data };
    } catch (error) {
      return { status: false };
    } finally {
    }
  };

  useEffect(() => {
    const tempForm = mapSingleBalShare(
      isBalShareAdding ? "ADD" : "EDIT",
      selectedBal,
    );
    //  console.log("ini temp form bal share", tempForm, selectedBal);
    setForm(tempForm);
  }, [selectedBal]);

  const value: BalShareRuleContextType = {
    mapSingleBalShare,
    setDefault,
    form,
    setForm,
    error,
    setError,
    subsSimple,
    setSubsSimple,
    AccBalList,
    AccResList,
    checkNumber,
  };

  return (
    <BalShareRuleContext.Provider value={value}>
      {children}
    </BalShareRuleContext.Provider>
  );
};

// Custom hook to use the context
export const useBalShareRule = () => {
  const context = useContext(BalShareRuleContext);
  if (context === undefined) {
    throw new Error(
      "useBalShareRule must be used within an BalShareRuleProvider",
    );
  }
  return context;
};

export default BalShareRuleContext;

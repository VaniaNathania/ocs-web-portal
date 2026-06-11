import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import {
  AccountBalanceDatasProps,
  AcctResList,
  BalanceDialogFields,
  BalanceDialogForm,
  DialogType,
  PointExchangeDialogForm,
} from "../models/interfaces";
import { usePayment } from "../../../hooks/PaymentContext";
import { toast } from "sonner";
import { mockObjAccountType } from "../models/mock";

interface AccountBalanceContextType {
  balAdd: boolean;
  setBalAdd: Dispatch<SetStateAction<boolean>>;
  pointExchangeDialog: boolean;
  setPointExchangeDialog: Dispatch<SetStateAction<boolean>>;
  balHistory: boolean;
  setBalHistory: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  accountBalanceDatas: AccountBalanceDatasProps[];
  selectedRows: AccountBalanceDatasProps | undefined;
  setSelectedRows: Dispatch<
    SetStateAction<AccountBalanceDatasProps | undefined>
  >;
  balanceDialogForm: BalanceDialogForm;
  setBalanceDialogForm: Dispatch<SetStateAction<BalanceDialogForm>>;
  initBalanceDialogForm: BalanceDialogForm;
  pointExchangeDialogForm: PointExchangeDialogForm;
  setPointExchangeDialogForm: Dispatch<SetStateAction<PointExchangeDialogForm>>;
  initPointExchangeDialogForm: PointExchangeDialogForm;
  getObjAcctType: (objAcctResId: string | null) => string;
  handleSubmitPointExchange: (datas: PointExchangeDialogForm) => void;
  handleSubmitBalanceDialog: (datas: BalanceDialogForm) => void;
  srcDisplayValue: string;
  setSrcDisplayValue: Dispatch<SetStateAction<string>>;
  objDisplayValue: string;
  setObjDisplayValue: Dispatch<SetStateAction<string>>;
  displayValue: Record<BalanceDialogFields, string>;
  setDisplayValue: Dispatch<
    SetStateAction<Record<BalanceDialogFields, string>>
  >;
  handleAmountBlur: (fields: BalanceDialogFields) => void;
  handleAmountChange: (value: string, fields: BalanceDialogFields) => void;
  scaleToPayload: (val: number) => number;
  getDate: (value: string) => string;
  getBalance: (value: number, isCurrency: string) => string | undefined;
  dialogType: DialogType;
  setDialogType: Dispatch<SetStateAction<DialogType>>;
  triggerSubmit: boolean;
  setTriggerSubmit: Dispatch<SetStateAction<boolean>>;
  refreshKey: number;
  setRefreshKey: Dispatch<SetStateAction<number>>;
  handleCheckbox: (isChecked: boolean) => void;
  isChecked: boolean;
  setIsChecked: Dispatch<SetStateAction<boolean>>;
}

// Create the context with proper typing
export const AccountBalanceContext = createContext<
  AccountBalanceContextType | undefined
>(undefined);

const API_URL = apiConfig.service_payment;

export const AccountBalanceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { PostData, GetData } = useCallApi();
  const { selectedMenu, selectedRow, formatedValue, webRechargeUseQuery } =
    usePayment();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<AccountBalanceDatasProps>();
  const [accountBalanceDatas, setAccountBalanceDatas] = useState<
    AccountBalanceDatasProps[]
  >([]);
  const [balAdd, setBalAdd] = useState<boolean>(false);
  const [pointExchangeDialog, setPointExchangeDialog] =
    useState<boolean>(false);
  const [balHistory, setBalHistory] = useState<boolean>(false);
  const [srcDisplayValue, setSrcDisplayValue] = useState<string>("");
  const [objDisplayValue, setObjDisplayValue] = useState<string>("");
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [triggerSubmit, setTriggerSubmit] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState(false);
  const [displayValue, setDisplayValue] = useState<
    Record<BalanceDialogFields, string>
  >({
    ceilLimit: "",
    floorLimit: "",
    dailyCeilLimit: "",
    dailyFloorLimit: "",
    priority: "",
  });

  const initBalanceDialogForm: BalanceDialogForm = {
    ceilLimit: null,
    floorLimit: null,
    dailyCeilLimit: null,
    dailyFloorLimit: null,
    priority: null,
  };

  const [balanceDialogForm, setBalanceDialogForm] = useState<BalanceDialogForm>(
    initBalanceDialogForm,
  );

  const initPointExchangeDialogForm: PointExchangeDialogForm = {
    subsId: null,
    acctId: selectedRow?.acctId ?? null,
    balExchangeRuleId: null,
    sourceBalId: null,
    contactChannelId: 1,
    objAcctResId: null,
    partyType: "A",
    spendAmount: null,
    objAmount: null,
  };

  const [pointExchangeDialogForm, setPointExchangeDialogForm] =
    useState<PointExchangeDialogForm>(initPointExchangeDialogForm);

  useEffect(() => {
    if (
      pointExchangeDialogForm.spendAmount !== null &&
      pointExchangeDialogForm.spendAmount !== 0
    ) {
      const objAmounVal = pointExchangeDialogForm.spendAmount / 2;

      setPointExchangeDialogForm({
        ...pointExchangeDialogForm,
        objAmount: objAmounVal,
      });
    }
  }, [pointExchangeDialogForm.spendAmount]);

  const fetchWebQryBalListFilterAllExpireAPI = async (
    acctId: number,
    routingId: number,
  ) => {
    try {
      setLoading(true);
      const response = await PostData(
        `${API_URL}/api/payment/webQryBalListFilterAllExpireAPI`,
        {
          acctId,
          routingId,
          isIncludeResvBal: true,
          isIncludeCcBal: true,
        },
      );

      if (response?.status) {
        setAccountBalanceDatas(response?.data);
        setSelectedRows(response?.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWebQryBalListAll = async (acctId: number, routingId: number) => {
    try {
      setLoading(true);
      const response = await PostData(`${API_URL}/api/payment/qryBalListAll`, {
        acctId,
        routingId,
        isIncludeResvBal: true,
        isIncludeCcBal: true,
      });

      if (response?.status) {
        setAccountBalanceDatas(response?.data);
        setSelectedRows(response?.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckbox = async (isChecked: boolean) => {
    if (!selectedRow?.acctId) return;
    if (loading) return;

    setLoading(true);

    try {
      const apiCall = isChecked
        ? fetchWebQryBalListAll
        : fetchWebQryBalListFilterAllExpireAPI;

      await apiCall(selectedRow.acctId, selectedRow.routingId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedRow?.acctId && !selectedRow?.routingId) return;

    if (selectedMenu === "acct balance") {
      fetchWebQryBalListFilterAllExpireAPI(
        selectedRow?.acctId,
        selectedRow?.routingId,
      );
    }
  }, [selectedRow?.acctId, selectedRow?.routingId, webRechargeUseQuery]);

  useEffect(() => {
    if (balAdd === false) {
      setBalanceDialogForm(initBalanceDialogForm);
    }

    if (pointExchangeDialog === false) {
      setPointExchangeDialogForm(initPointExchangeDialogForm);
      setSrcDisplayValue("");
      setObjDisplayValue("");
      setTriggerSubmit(false);
    }
  }, [balAdd, pointExchangeDialog, srcDisplayValue]);

  const getObjAcctType = (objAcctResId: string | null) => {
    const find = mockObjAccountType.find(
      (item) => item.acctResId === objAcctResId,
    );

    return find ? `${find.acctResName}` : "";
  };

  const handleSubmitPointExchange = (payload: PointExchangeDialogForm) => {
    setTriggerSubmit(true);
    const { objAcctResId, ...rest } = payload;
    //  console.log("payload submit point ex: ", rest);

    if (
      pointExchangeDialogForm.balExchangeRuleId &&
      pointExchangeDialogForm.objAcctResId &&
      pointExchangeDialogForm.spendAmount
    ) {
      setDialogType("PointExchange");
    }
  };

  const handleSubmitBalanceDialog = async (payload: BalanceDialogForm) => {
    if (!selectedRow) return;
    const ceilUnderFloor =
      balanceDialogForm?.ceilLimit != null &&
      balanceDialogForm?.floorLimit != null &&
      balanceDialogForm?.ceilLimit < balanceDialogForm?.floorLimit;

    const dailyCeilUnderDailyFloor =
      balanceDialogForm?.dailyCeilLimit != null &&
      balanceDialogForm?.dailyFloorLimit != null &&
      balanceDialogForm?.dailyCeilLimit < balanceDialogForm?.dailyFloorLimit;

    if (ceilUnderFloor) {
      setDialogType("Ceil");
      return;
    }

    if (dailyCeilUnderDailyFloor) {
      setDialogType("Daily");
      return;
    }

    try {
      setLoading(true);
      const newPayload = {
        acctId: selectedRows?.acctId,
        routingId: selectedRow?.routingId,
        balId: selectedRows?.balId,
        ...payload,
      };

      //  console.log("payload submit balance dialog: ", newPayload);

      const response = await PostData(
        `${API_URL}/api/payment/modBalLimit`,
        newPayload,
      );

      if (response?.status) {
        setBalAdd(false);
        setDialogType("BalanceSuccess");
        await fetchWebQryBalListFilterAllExpireAPI(
          selectedRow?.acctId,
          selectedRow?.routingId,
        );
        setRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  const scale = 100000;

  const scaleToPayload = (val: number) => Math.round(val * scale);

  const handleAmountChange = (value: string, fields: BalanceDialogFields) => {
    const raw = value.replace(/[^\d.]/g, "");
    const amount = Number(raw);
    setDisplayValue((prev) => ({
      ...prev,
      [fields]: raw,
    }));
    setBalanceDialogForm((prev) => ({
      ...prev,
      [fields]: raw ? scaleToPayload(amount) : null,
    }));
  };

  const handleAmountBlur = (fields: BalanceDialogFields) => {
    const amount = Number(displayValue[fields] ?? null);

    if (amount === 0) {
      setDisplayValue((prev) => ({
        ...prev,
        [fields]: "",
      }));
      return;
    }

    setDisplayValue((prev) => ({
      ...prev,
      [fields]: amount.toLocaleString("en-US", {
        minimumFractionDigits: 5,
        maximumFractionDigits: 5,
      }),
    }));
  };

  const getDate = (value: string) => {
    if (!value) return "";
    const splitDate = value.split("T")[0];

    return splitDate;
  };
  ``;
  const getBalance = (value: number, isCurrency: string) => {
    if (!value) return "0";
    const raw = value.toString().replace("-", "");
    const formated = isCurrency === "Y";
    const finalFormat = formated ? formatedValue(value) : raw;

    return `Credit ${finalFormat}`;
  };

  useEffect(() => {
    if (balAdd && selectedRows) {
      const responseToDisplay = (val: number | null) => {
        if (!val) return "";

        const amount = val / scale;

        return amount.toLocaleString("en-US", {
          minimumFractionDigits: 5,
          maximumFractionDigits: 5,
        });
      };

      setBalanceDialogForm({
        ceilLimit: selectedRows?.ceilLimit,
        floorLimit: selectedRows?.floorLimit,
        dailyCeilLimit: selectedRows?.dailyCeilLimit,
        dailyFloorLimit: selectedRows?.dailyFloorLimit,
        priority: selectedRows?.priority,
      });

      setDisplayValue({
        ceilLimit: responseToDisplay(selectedRows?.ceilLimit),
        floorLimit: responseToDisplay(selectedRows?.floorLimit),
        dailyCeilLimit: responseToDisplay(selectedRows?.dailyCeilLimit),
        dailyFloorLimit: responseToDisplay(selectedRows?.dailyFloorLimit),
        priority: String(selectedRows?.priority),
      });
    }
  }, [balAdd, selectedRows]);

  const value: AccountBalanceContextType = {
    selectedRows,
    setSelectedRows,
    balAdd,
    setBalAdd,
    balHistory,
    setBalHistory,
    loading,
    accountBalanceDatas,
    balanceDialogForm,
    setBalanceDialogForm,
    initBalanceDialogForm,
    pointExchangeDialog,
    setPointExchangeDialog,
    pointExchangeDialogForm,
    setPointExchangeDialogForm,
    initPointExchangeDialogForm,
    getObjAcctType,
    handleSubmitPointExchange,
    srcDisplayValue,
    setSrcDisplayValue,
    objDisplayValue,
    setObjDisplayValue,
    handleSubmitBalanceDialog,
    displayValue,
    setDisplayValue,
    scaleToPayload,
    handleAmountBlur,
    handleAmountChange,
    getDate,
    getBalance,
    dialogType,
    setDialogType,
    triggerSubmit,
    setTriggerSubmit,
    refreshKey,
    setRefreshKey,
    handleCheckbox,
    isChecked,
    setIsChecked,
  };

  return (
    <AccountBalanceContext.Provider value={value}>
      {children}
    </AccountBalanceContext.Provider>
  );
};

// Custom hook to use the context
export const useAccountBalance = () => {
  const context = useContext(AccountBalanceContext);
  if (context === undefined) {
    throw new Error(
      "useAccountBalance must be used within an AccountBalanceProvider",
    );
  }
  return context;
};

export default AccountBalanceContext;

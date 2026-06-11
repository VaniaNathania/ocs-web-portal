import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
  useEffect,
  Dispatch,
} from "react";
import { useCallApi } from "@/hooks";
import { apiConfig, apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import {
  AcctInfoPayment,
  MasterPayment,
  WebRechargeQuery,
} from "../interfaces";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Menu } from "../models/types";
import { PaymentCreditPayload, ReceiptReq } from "../models/interface";
import axios from "axios";
import { useAuthContext } from "@/auth";
import {
  menuAccess,
  useRoleCheck,
} from "../../role-management/hook/useRoleCheck";

interface PaymentContextType {
  query: payQuery;
  setQuery: React.Dispatch<SetStateAction<payQuery>>;
  rows: AcctInfoPayment[];
  selectedRow?: AcctInfoPayment;
  setSelectedRow: React.Dispatch<SetStateAction<AcctInfoPayment | undefined>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<SetStateAction<boolean>>;
  showReverse: boolean;
  setShowReverse: React.Dispatch<SetStateAction<boolean>>;
  showRefund: boolean;
  setShowRefund: React.Dispatch<SetStateAction<boolean>>;
  showInstantInvoice: boolean;
  setShowInstantInvoice: React.Dispatch<SetStateAction<boolean>>;
  formatedValue: (
    value: number | undefined,
    form?: "default" | "historical" | "preBalAndTotal",
  ) => string | undefined;

  selectedMenu: Menu;
  setSelectedMenu: React.Dispatch<SetStateAction<Menu>>;
  totalRows: number;

  webRechargeUseQuery: UseQueryResult<WebRechargeQuery>;
  paymentUseQuery: UseQueryResult<MasterPayment>;

  error: FormError;
  setError: Dispatch<SetStateAction<FormError>>;
  form?: PaymentCreditPayload;
  setForm: Dispatch<SetStateAction<PaymentCreditPayload | undefined>>;
  receiptPopUp: boolean;
  setReceiptPopUp: Dispatch<SetStateAction<boolean>>;
  receiptBlob?: Blob;
  setReceiptBlob: Dispatch<SetStateAction<Blob | undefined>>;
  OnCredit: (bool: boolean) => void;
  menuPrivAccess?: menuAccess;
  bankDatas: BankDatasProps[];
}

export const PaymentContext = createContext<PaymentContextType | undefined>(
  undefined,
);

const API_URL = apiConfig.service_user;
const API_PAYMENT = apiConfig.service_payment;
const API_ORDER = apiConfigOrder.order;

interface payQuery {
  accNbr?: number;
  acctNbr?: string;
  custName?: string;
  spId: number;
  page: number;
  size: number;
  sortBy: string;
  sortDirection: "asc" | "desc";
}

interface BankDatasProps {
  bankCode?: string;
  bankId?: number;
  comments?: string;
  bankName?: string;
  ibanFormat?: string;
  stateDate?: string;
  state?: string;
  spId?: number;
  bic?: string;
  child?: number;
  parentId?: number;
}

type FormType = {
  subsId?: number;
  submitAmount?: number;
  cardNo?: string;
  bankId?: number;
  checkNo?: string;
  scratchCardPin?: string;
};

type FormError = Partial<Record<keyof FormType, boolean>>;

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  // const { acctNbr } = useParams();
  const { userData } = useAuthContext();
  const { GetData, PostData } = useCallApi();
  const { checkMenusPriv } = useRoleCheck();
  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv("/main-menu/payment/Payment", "addStatus"),
    editStatus: checkMenusPriv("/main-menu/payment/Payment", "editStatus"),
    readStatus: checkMenusPriv("/main-menu/payment/Payment", "readStatus"),
    deleteStatus: checkMenusPriv("/main-menu/payment/Payment", "deleteStatus"),
  };
  // const navigate = useNavigate();

  const [rows, setRows] = useState<AcctInfoPayment[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [selectedRow, setSelectedRow] = useState<AcctInfoPayment>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu>("curr bill");
  const [showReverse, setShowReverse] = useState<boolean>(false);
  const [showRefund, setShowRefund] = useState<boolean>(false);
  const [showInstantInvoice, setShowInstantInvoice] = useState<boolean>(false);
  const [error, setError] = useState<FormError>({
    submitAmount: false,
    subsId: false,

    // dynamic fields
    cardNo: false,
    bankId: false,
    checkNo: false,
    scratchCardPin: false,
  });
  const [form, setForm] = useState<PaymentCreditPayload>();
  const [receiptPopUp, setReceiptPopUp] = useState<boolean>(false);
  const [receiptBlob, setReceiptBlob] = useState<Blob>();

  const [query, setQuery] = useState<payQuery>({
    acctNbr: selectedRow?.acctNbr ?? "",
    spId: 0,
    page: 1,
    size: 5,
    sortBy: "CUST_ID",
    sortDirection: "asc",
  });

  const bankDatas: BankDatasProps[] = [
    {
      bankCode: "014",
      bankId: 1,
      comments: "test",
      bankName: "BCA",
      ibanFormat: "222222",
      stateDate: "2025-10-14 12:42:10",
      state: "A",
      spId: 0,
      bic: "11111111",
      child: 1,
    },
    {
      bankCode: "023",
      bankId: 8,
      bankName: "BCA Cabang khusus",
      stateDate: "2025-10-15 16:41:07",
      state: "A",
      spId: 0,
      parentId: 1,
      child: 1,
    },
    {
      bankCode: "017",
      bankId: 10,
      bankName: "BCA Prioritas",
      stateDate: "2025-10-16 13:23:55",
      state: "A",
      spId: 0,
      parentId: 8,
    },
    {
      bankCode: "091",
      bankId: 12,
      bankName: "BNI",
      stateDate: "2025-10-21 15:44:33",
      state: "A",
      spId: 0,
    },
    {
      bankCode: "030",
      bankId: 9,
      bankName: "BRI",
      stateDate: "2025-10-15 18:37:13",
      state: "A",
      spId: 0,
    },
    {
      bankCode: "022",
      bankId: 7,
      bankName: "CIMB",
      stateDate: "2025-10-15 16:24:51",
      state: "A",
      spId: 0,
    },
  ];

  // useEffect(() => {
  //   console.log("FORM: ", form);
  // }, [form]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // if (selectedRow?.accNbr && selectedRow) {
      //   return;
      // }

      const resp = await GetData(
        `${API_URL}/api/balance-adjustment/qry-acct-info`,
        query,
      );

      if (!resp.status) return toast.error(resp.message);

      if (resp.data.length === 0) {
        setRows([]);
        return toast.warning("Can't find any matching data");
      }

      // if (resp.data.length === 1) {
      //   setSelectedRow(resp.data[0]);
      //   // navigate(`/payment/${resp.data[0].acctNbr}`);
      // }

      setTotalRows(resp.totalRows);
      setRows(resp.data);
    } catch (error) {
      //  console.log(error);
      return toast.error("Error fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (query.accNbr || query.acctNbr || query.custName) {
      fetchData();
      return;
    }
    setRows([]);
    setTotalRows(0);
  }, [query]);

  // ✅ webRecharge converted to useQuery
  const webRechargeUseQuery: UseQueryResult<WebRechargeQuery> = useQuery({
    queryKey: ["web-recharge", selectedRow?.acctId],
    queryFn: async () => {
      if (!selectedRow) throw new Error("No selectedRow");

      const resp = await GetData(
        `${API_PAYMENT}/api/payment/web-recharge-query`,
        {
          acctId: selectedRow.acctId.toString(),
          acctNbr: selectedRow.acctNbr,
          groupType: 0,
          partyType: "A",
          partyCode: 1,
        },
      );

      if (!resp.status) {
        toast.error(resp.message);
        throw new Error(resp.message);
      }

      return resp.data;
    },
    enabled: !!selectedRow,
    staleTime: 1000 * 60 * 5,
  });

  const fetchInitialDataUseQuery = async (): Promise<MasterPayment> => {
    const [paymentMethodResp, acctResListResp] = await Promise.all([
      GetData(
        `${API_ORDER}/api/order-entry/common-service/qry-payment-method`,
        { spId: -1 },
      ),
      GetData(`${API_ORDER}/api/order-entry/acct/qry-acct-res-list`, {
        isCurrency: "Y",
        // refillable: "Y",
      }),
    ]);

    const hasError = !paymentMethodResp.status || !acctResListResp.status;

    if (hasError) {
      toast.error("Failed to fetch neccesary data for order");
      return {
        paymentMethod: [],
        balanceType: [],
      };
    }

    return {
      paymentMethod: paymentMethodResp.data,
      balanceType: acctResListResp.data,
    };
  };

  const paymentUseQuery: UseQueryResult<MasterPayment> = useQuery({
    queryKey: ["payment-master-data"],
    queryFn: fetchInitialDataUseQuery,
    refetchOnMount: false,
    staleTime: 1000 * 60 * 10,
  });

  const formatedValue = (
    val: number | undefined,
    from?: "default" | "historical" | "preBalAndTotal",
  ) => {
    if (val === null || val === undefined) return;

    const stringVal = val.toString();
    const raw = stringVal.replace("-", "");

    const amount = Number(raw) / 100000;

    const finalAmount = amount.toLocaleString("en-US", {
      minimumFractionDigits: 5,
      maximumFractionDigits: 5,
    });

    if (from === "historical") {
      if (!val) return finalAmount;

      if (val > 0) return `Decrease ${finalAmount}`;
      if (val < 0) return `Increase ${finalAmount}`;
    }

    if (from === "preBalAndTotal")
      return `${!val ? "" : "Credit"} ${finalAmount}`;

    return finalAmount;
  };

  useEffect(() => {
    setForm({
      paymentMethodId: selectedRow?.paymentMethodId,
      acctResId:
        webRechargeUseQuery.data?.defaultBalInfo?.acctResId ?? undefined,
      // prefix: webRechargeUseQuery?.data?.subsList[0].prefix,
      // accNbr: webRechargeUseQuery?.data?.subsList[0].accNbr,
      // msisdn:
      //   (webRechargeUseQuery?.data?.subsList[0].prefix ?? "") +
      //   (webRechargeUseQuery?.data?.subsList[0].accNbr ?? ""),
      // subsId: webRechargeUseQuery?.data?.subsList[0].subsId,
    });
  }, [selectedRow, webRechargeUseQuery.status]);

  const ValidateDynamicFields = () => {
    const newError: FormError = {};

    switch (form?.paymentMethodId) {
      case 2:
        if (!form.checkNbr) {
          newError.cardNo = true;
        }
        break;
      case 3:
        if (!form.check?.bankId) {
          newError.bankId = true;
        }

        if (!form.check?.checkNo) {
          newError.checkNo = true;
        }
        break;
      case 4:
        if (!form.scratchCardPin) {
          newError.scratchCardPin = true;
        }

        if (!form.subsId) {
          newError.subsId = true;
        }
        break;
      case 7:
        break;
      default:
        break;
    }

    setError((prev) => ({
      ...prev,
      ...newError,
    }));

    return Object.keys(newError).length === 0;
  };

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      checkExpDate: null,
      checkIssueDate: null,
      bankId: null,
      checkNbr: null,
      scratchCardPin: null,
    }));
  }, [form?.paymentMethodId]);

  const OnCredit = async (isCredit: boolean) => {
    setIsLoading(true);
    try {
      //  console.log(form);

      setReceiptBlob(undefined);
      if (!form?.submitAmount) {
        setError((prev) => ({ ...prev, submitAmount: true }));
        return toast.error("Please fill the amount");
      }

      const validateError = ValidateDynamicFields();

      if (!validateError) {
        return toast.error("Please fill all required fields!");
      }
      // if (!form.subsId) {
      //   setError((prev) => ({ ...prev, subsId: true }));
      //   return toast.error("Please fill the service Number");
      // }

      const payload = {
        submitAmount:
          Number(form?.submitAmount) * -100000 * (isCredit ? 1 : -1),
        returnAmount: 0,
        bankId: form.paymentMethodId === 3 ? form.check?.bankId : null,
        checkNbr: form.checkNbr,
        checkIssueDate: form.checkIssueDate,
        checkExpDate: form.checkExpDate,
        charge: Number(form?.submitAmount) * -100000 * (isCredit ? 1 : -1),
        acctId: selectedRow?.acctId,
        partyType: "A",
        partyCode: 1,
        contactChannelId: 1,
        paymentMethodId: form?.paymentMethodId,
        acctResId: form?.acctResId,
        prefix: form?.prefix,
        accNbr: form?.accNbr,
        msisdn: form?.msisdn,
        subsId: form?.subsId,
        acctItemMergeList: [],
        overdueQryFeeResultList: [],
        selectedAcctItemIdList: [],
        overdue: 0,
        remarks: form?.remarks,
        paymentSource: form?.paymentSource,
        isNeedCdr: false,
        isSendAdvice: true,
        isAllowRechargeBlack: false,
        spId: 0,
      };

      const resp = await PostData(
        `${API_PAYMENT}/api/payment/web-recharge-application`,
        payload,
      );

      const instalment = await PostData(
        `${API_PAYMENT}/api/payment/qry-can-instalment-flag?acctId=${selectedRow?.acctId}`,
        {},
      );

      if (!resp?.status) {
        return toast.error(resp?.message);
      }
      toast.success(resp.message);
      webRechargeUseQuery.refetch();
      OnSuccess(resp.data.rechargeReceipt);
    } catch (error) {
      return console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const OnSuccess = async (payload: ReceiptReq) => {
    try {
      setReceiptPopUp(true);

      const clean = {
        ...payload,
        customerName: payload.custName,
        accNbr: form?.accNbr,
        prefix: form?.prefix,
        aboveSixBill: "$ " + payload.aboveSixBill,
        balance: "$ " + payload.balance,
        lastBill: "$ " + payload.lastBill,
        lastFifthBill: "$ " + payload.lastFifthBill,
        lastFourthBill: "$ " + payload.lastFourthBill,
        lastSecondBill: "$ " + payload.lastSecondBill,
        lastSixBill: "$ " + payload.lastSixBill,
        lastThirdBill: "$ " + payload.lastThirdBill,
        preBalance: "$ " + payload.preBalance,
        preStoreAmount: "$ " + payload.preStoreAmount,
        rechargeAmount: "$ " + payload.rechargeAmount,
        totalPaid: "$ " + payload.totalPaid,
        paymentId: Number(payload.paymentId),
        staff: userData()?.user.name,
      };

      const resp = await axios.post(
        `${API_PAYMENT}/api/generate-report/pdf`,
        clean,
        {
          responseType: "blob", // ✅ correct
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("ocs-portal-web-telkomcel-auth-v1=9.1.1") ?? '{"token":""}').token}`,
          },
        },
      );

      const blob = resp.data;

      // (optional safety)
      if (!(blob instanceof Blob)) {
        toast.error("Invalid PDF response");
        return;
      }

      // (optional debug)
      //  console.log("Blob type:", blob.type, "Size:", blob.size);

      setReceiptBlob(blob); // ✅ correct
    } catch (error) {
      return toast.error(String(error));
    }
  };

  const value = {
    query,
    setQuery,
    rows,
    selectedRow,
    setSelectedRow,
    isLoading,
    setIsLoading,
    showReverse,
    setShowReverse,
    showRefund,
    setShowRefund,
    selectedMenu,
    setSelectedMenu,
    totalRows,
    paymentUseQuery,
    webRechargeUseQuery,
    formatedValue,
    error,
    setError,
    form,
    setForm,
    receiptPopUp,
    setReceiptPopUp,
    receiptBlob,
    setReceiptBlob,
    OnCredit,
    menuPrivAccess,
    showInstantInvoice,
    setShowInstantInvoice,
    bankDatas,
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePayment must be used within an PaymentProvider");
  }
  return context;
};

export default PaymentContext;

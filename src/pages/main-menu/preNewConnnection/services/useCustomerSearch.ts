import { apiConfigOrder } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CustQueryCondProps } from "../blocks/CustomerSearch";
import { usePreNew } from "../hooks/context";

export interface CertTypeProps {
  certTypeId: number;
  certTypeName: string;
  comments: string;
  nbrMask: string | null;
  maxNbrLength: number | null;
  minNbrLength: number | null;
  custType: string | null;
  spId: number;
  nbrExample: string | null;
  custTypeName: string | null;
  certTypeCode: string;
}

interface UseCustomerSearchProps {
  handleDialog: (open: boolean) => void;
  isOpen: boolean;
}

const API_URL = apiConfigOrder.order;

const useCustomerSearch = ({
  handleDialog,
  isOpen,
}: UseCustomerSearchProps) => {
  const { GetData, PostData } = useCallApi();
  const { form, setForm } = usePreNew();
  const [certType, setCertType] = useState<CertTypeProps[]>([]);
  const [selectedItem, setSelectedItem] = useState<CustQueryCondProps>();
  const [selectedCertType, setSelectedCertType] = useState<number>();
  const [custName, setCustName] = useState<string | undefined>();
  const [custType, setCustType] = useState<string | undefined>();
  const [serviceNbr, setServiceNbr] = useState<string | undefined>();
  const [iccid, setIccid] = useState<string | undefined>();
  const [contactManName, setContactManName] = useState<string | undefined>();
  const [isEscape, setIsEscape] = useState<boolean>(false);
  const [qryTermination, setQryTermination] = useState<boolean>(false);
  const [docNbr, setDocNbr] = useState<string | undefined>();
  const [acctNbr, setAcctNbr] = useState<string | undefined>();
  const [datas, setDatas] = useState<CustQueryCondProps[]>([]);

  const handleSelectItem = (item: CustQueryCondProps) => {
    setSelectedItem(item);
  };

  const fetchCerType = async () => {
    setForm((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await GetData(
        `${API_URL}/api/order-entry/cert-type/qry-cert-type`,
        {
          custType: "A",
        },
      );

      if (response?.status) {
        setCertType(response.data);
      }
    } catch (err) {
      toast.error("Failed GetData!");
    } finally {
      setForm((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const buildQuery = () => {
    const rawQuery = {
      // custType: custType,
      custName: custName,
      // accNbr: docNbr,
      certTypeId: selectedCertType,
      certNbr: docNbr,
      iccid: iccid,
      acctNbr: acctNbr,
      contactMan: contactManName,
      isEscape: isEscape ? 1 : 0,
      qryTermination: qryTermination ? 1 : 0,
    };

    return Object.fromEntries(
      Object.entries(rawQuery).filter(
        ([, v]) => v !== undefined && v !== null && v !== "",
      ),
    );
  };

  const fetchCustQueryCond = async () =>
    // custName: string | undefined,
    // certTypeId: number | undefined,
    // certNbr: string | undefined,
    // iccid: string | undefined,
    // acctNbr: string | undefined,
    // contactManName: string | undefined,
    // isEscape: 0 | 1,
    // qryTermination: 0 | 1,
    {
      setForm((prev) => ({ ...prev, isLoading: true }));
      try {
        const payload = {
          ...buildQuery(),
          // isEscape: isEscape,
          // qryTermination: qryTermination,
        };
        //  console.log(payload);
        const response = await PostData(
          `${API_URL}/api/order-entry/custommer/cust-query-cond`,
          payload,
        );

        if (!response?.status) {
          toast.error("Failed GetData!");
        }

        setForm((prev) => ({ ...prev, custId: response?.data?.[0]?.custId }));

        setDatas(response?.data);

        setSelectedItem(response?.data?.[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setForm((prev) => ({ ...prev, isLoading: false }));
      }
    };

  const handleOk = () => {
    if (!selectedItem) return;

    setForm((prev) => ({
      ...prev,
      custId: selectedItem.custId,
      custName: selectedItem.custName,
    }));

    handleDialog(false);
  };

  const hasAditionalQuery = () => {
    return [
      selectedCertType,
      acctNbr,
      docNbr,
      serviceNbr,
      custName,
      iccid,
      contactManName,
    ].some((val) => val !== null && val !== undefined && val !== "");
  };

  const handleQuery = () => {
    // setQueryTrigger((prev) => prev + 1);
    if (!hasAditionalQuery()) {
      toast.info("Please enter at least one condition!");
      return;
    }

    fetchCustQueryCond();
  };

  const handleReset = () => {
    //  console.log("reset");
    setSelectedCertType(undefined);
    setCustName(undefined);
    setDocNbr(undefined);
    setAcctNbr(undefined);
    setIccid(undefined);
    setContactManName(undefined);
    setServiceNbr(undefined);
    setIsEscape(false);
    setQryTermination(false);
    setDatas([]);
  };

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }

    fetchCerType();
  }, [isOpen]);

  return {
    fetchCerType,
    handleOk,
    handleSelectItem,
    handleQuery,
    handleReset,
    certType,
    selectedItem,
    selectedCertType,
    setSelectedCertType,
    datas,
    iccid,
    setIccid,
    contactManName,
    setContactManName,
    custName,
    setCustName,
    custType,
    setCustType,
    serviceNbr,
    setServiceNbr,
    docNbr,
    setDocNbr,
    acctNbr,
    setAcctNbr,
    isEscape,
    setIsEscape,
    qryTermination,
    setQryTermination,
    hasAditionalQuery,
  };
};

export default useCustomerSearch;

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { BindingTempTable, IccidEndByCount, QryAccNbrEndByCount4SimNbrBinding, QryAccNbrWithBinded4SimNbrBinding, QryAccNbrWithUnbinded4SimNbrBinding, SimNumberBindUnbind } from "../interface/interface";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { menuAccess, useRoleCheck } from "../../role-management/hook/useRoleCheck";

export const SimNumberBindUnbindContext = createContext<SimNumberBindUnbind | undefined>(undefined);

const API_URL = apiConfigRef.ref;

export const SimNumberBindUnbindContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { GetData, PostData } = useCallApi();
  const {checkMenusPriv} = useRoleCheck();
  // const [accNbrWithUnbinded4SimNbrBinding, setAccNbrWithUnbinded4SimNbrBinding] = useState<QryAccNbrWithUnbinded4SimNbrBinding[]>([]);
  // const [accNbrWithBinded4SimNbrBinding, setAccNbrWithBinded4SimNbrBinding] = useState<QryAccNbrWithBinded4SimNbrBinding[]>([]);
  // const [accNbrEndByCount4SimNbrBinding, setAccNbrEndByCount4SimNbrBinding] = useState<QryAccNbrEndByCount4SimNbrBinding[]>([]);
  // const [simCardWithUnbinded, setSimCardWithUnbinded] = useState<any[]>([]);
  // const [iccidEndByCount, setIccidEndByCount] = useState<IccidEndByCount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadBtnRef = useRef<HTMLButtonElement>(null);
  const [selectedItem, setSelectedItem] = useState<BindingTempTable>();
  const [queryResult, setQueryResult] = useState<BindingTempTable[]>([]);
  const [tableName, setTableName] = useState<string>();
  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv("/main-menu/cvbs-sim-number-binding-unbinding/SimNumberBindUnbindPage", "addStatus"),
    deleteStatus: checkMenusPriv("/main-menu/cvbs-sim-number-binding-unbinding/SimNumberBindUnbindPage", "deleteStatus"),
    editStatus: checkMenusPriv("/main-menu/cvbs-sim-number-binding-unbinding/SimNumberBindUnbindPage", "editStatus"),
    readStatus: checkMenusPriv("/main-menu/cvbs-sim-number-binding-unbinding/SimNumberBindUnbindPage", "readStatus"),
  }
  

  const fetchQryAccNbrWithUnbinded4SimNbrBinding = async (prefix: string, accNbrBegin: string, accNbrEnd: string) => {
    setIsLoading(true);
    try {
      const payload = {
        prefix,
        accNbrBegin,
        accNbrEnd,
      };
      const response = await GetData(`${API_URL}/api/sim-card-binding-unbiding/qry-acc-nbr-with-unbinded-4-simNbr-binding`, payload);

      if (!response.status) {
        toast.error("Failed!");
      }

      // setAccNbrWithUnbinded4SimNbrBinding(response?.data);
      return response?.data;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQryAccNbrEndByCount4SimNbrBinding = async (prefix: string, accNbrBegin: string, accNbrQuantity: number) => {
    setIsLoading(true);
    try {
      const payload = {
        search: "",
        page: 1,
        size: accNbrQuantity,
        sortBy: "accNbrId",
        sortDirection: "asc",
        prefix,
        accNbrBegin,
      };
      const response = await GetData(`${API_URL}/api/sim-card-binding-unbiding/qry-acc-nbr-end-by-count-4-sim-nbr-binding`, payload);

      if (!response.status) {
        toast.error("Failed!");
      }

      // setAccNbrEndByCount4SimNbrBinding(response?.data);
      return response?.data;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQrySimCardWithUnbinded = async (iccidBegin: string, iccidEnd: string) => {
    setIsLoading(true);
    try {
      const payload = {
        iccidBegin,
        iccidEnd,
      };
      const response = await GetData(`${API_URL}/api/sim-card-binding-unbiding/qry-sim-card-with-unbinded`, payload);

      if (!response.status) {
        toast.error("Failed GetData!");
      }

      // setSimCardWithUnbinded(response?.data);
      return response?.data;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQryIccidEndByCount = async (iccidBegin: string, rownum: number) => {
    setIsLoading(true);
    try {
      const payload = {
        iccidBegin,
        rownum,
      };
      const response = await GetData(`${API_URL}/api/sim-card-binding-unbiding/qry-iccid-end-by-count`, payload);

      if (!response.status) {
        toast.error("Failed GetData!");
      }

      // setIccidEndByCount(response?.data);
      return response?.data;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQryAccNbrWithBinded4SimNbrBinding = async (prefix: string, accNbrBegin: string, accNbrEnd: string) => {
    setIsLoading(true);
    try {
      const payload = {
        prefix,
        accNbrBegin,
        accNbrEnd,
      };
      const response = await GetData(`${API_URL}/api/sim-card-binding-unbiding/qry-acc-nbr-with-binded-4-sim-nbr-binding`, payload);

      if (!response?.status) {
        toast.error("Failed GetData!");
      }

      // setAccNbrWithBinded4SimNbrBinding(response?.data);
      return response?.data;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQryBindingSimNbr = async (prefix: string, accNbrBegin: string, accNbrEnd: string) => {
    try {
      const payload = {
        prefix,
        accNbrBegin,
        accNbrEnd,
      };
      const response = await PostData(`${API_URL}/api/sim-card-binding-unbiding/qry-binding-sim-nbr`, payload);

      if (!response?.status) {
        toast.error(response?.message || "Failed GetData!");
      }

      setTableName(response?.data.tableName);
      return response?.data;
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQryBindingTempTableCount = async (tableName: string) => {
    try {
      const payload = {
        tableName,
      };
      const response = await GetData(`${API_URL}/api/sim-card-binding-unbiding/qry-binding-temp-table-count`, payload);

      if (!response?.status) {
        toast.error(response?.message || "Failed GetData!");
      }

      return response?.data;
    } catch (err) {
      console.error(err);
    }
  };
  const fetchQryBindingTempTable = async (tableName: string) => {
    try {
      const payload = {
        tableName,
      };
      const response = await GetData(`${API_URL}/api/sim-card-binding-unbiding/qry-binding-temp-table`, payload);

      if (!response?.status) {
        toast.error(response?.message || "Failed GetData!");
      }

      setQueryResult(response?.data);
      setSelectedItem(response.data[0]);
      return response?.data;
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQryAccNbrEndByCountUnbind4SimNbrBinding = async (prefix: string, accNbrBegin: string, accNbrQuantity: number) => {
    try {
      setIsLoading(true);
      const payload = {
        prefix,
        accNbrBegin,
        rownum: accNbrQuantity,
      };

      const response = await GetData(`${API_URL}/api/sim-card-binding-unbiding/qry-acc-nbr-end-by-count-unbind-4-sim-nbr-binding`, payload);

      if (!response?.status) {
        toast.error(response.message || "Failed GetData!");
      }

      return response?.data;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (item: BindingTempTable) => {
    //  console.log(item);
    setSelectedItem(item);
  };

  const fetchUnbindingSimNbr = async () => {
    try {
      const payload = {
        tableName,
        staffId: 1,
        partyType: "A",
        partyCode: "1",
      };
      const response = await PostData(`${API_URL}/api/sim-card-binding-unbiding/unbinding-sim-nbr`, payload);

      if (!response?.status) {
        toast.error(response?.message || "Failed!");
      }

      toast.success(response?.message || "Success!");
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQrySimNbrForBinding = async (prefix: string, accNbrBegin: string, accNbrEnd: string, iccidBegin: string, iccidEnd: string, matchFlag: string) => {
    try {
      const payload = {
        prefix,
        accNbrBegin,
        accNbrEnd,
        iccidBegin,
        iccidEnd,
        matchFlag,
        // hrldId: 0,
      };

      const response = await PostData(`${API_URL}/api/sim-card-binding-unbiding/qry-sim-nbr-for-binding`, payload);

      if (!response?.status) {
        toast.error(response?.message || "Failed");
      }

      return response?.data;
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = async (onReset: () => void, actionType: string) => {
    if (!tableName) {
      toast.error("Failed Submit because tableName null!");
      return;
    }

    try {
      setIsLoading(true);

      if (actionType === "1") {
        await fetchUnbindingSimNbr();

        onReset();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = () => {};

  const handleUploadClick = () => {};

  const handleDownloadTemplate = () => {};

  const value = {
    // accNbrEndByCount4SimNbrBinding,
    // accNbrWithUnbinded4SimNbrBinding,
    // setAccNbrEndByCount4SimNbrBinding,
    // setAccNbrWithUnbinded4SimNbrBinding,
    isLoading,
    setIsLoading,
    fileInputRef,
    uploadBtnRef,
    handleFileChange,
    handleUploadClick,
    handleDownloadTemplate,
    selectedItem,
    setSelectedItem,
    fetchQryAccNbrWithUnbinded4SimNbrBinding,
    // simCardWithUnbinded,
    // setSimCardWithUnbinded,
    fetchQrySimCardWithUnbinded,
    fetchQryIccidEndByCount,
    fetchQryAccNbrWithBinded4SimNbrBinding,
    fetchQryBindingSimNbr,
    fetchQryBindingTempTableCount,
    fetchQryBindingTempTable,
    queryResult,
    setQueryResult,
    handleRowClick,
    fetchQryAccNbrEndByCount4SimNbrBinding,
    onSubmit,
    fetchQryAccNbrEndByCountUnbind4SimNbrBinding,
    fetchUnbindingSimNbr,
    fetchQrySimNbrForBinding,
    menuPrivAccess,
  };

  return <SimNumberBindUnbindContext.Provider value={value}>{children}</SimNumberBindUnbindContext.Provider>;
};

export const useSimNumberBindUnbindContext = () => {
  const context = useContext(SimNumberBindUnbindContext);
  if (context === undefined) {
    throw new Error("useSimNumberBindUnbindContext must be used within an SimNumberBindUnbindContextProvider");
  }
  return context;
};

export default SimNumberBindUnbindContext;

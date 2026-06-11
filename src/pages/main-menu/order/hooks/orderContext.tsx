import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
  useEffect,
} from "react";
import { useOrderLayout } from "@/layouts/main-menu/order";
import { useCallApi } from "@/hooks";
import {
  apiConfigOffer,
  apiConfigOrder,
  apiConfigRef,
} from "@/config/api.config";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  AccountInfo,
  CustomerInfo,
  MasterDataOrder,
  OrderReason,
  OrderSideBar,
} from "../models/interfaces";
import { mockAcc } from "../models/mock";

interface OrderContextType {
  selectedSideBar?: OrderSideBar;
  setSelectedSideBar: React.Dispatch<SetStateAction<OrderSideBar | undefined>>;
  search: string;
  setSearch: React.Dispatch<SetStateAction<string>>;
  searchResult: CustomerInfo[];
  setSearchResult: React.Dispatch<SetStateAction<CustomerInfo[]>>;
  loadingSearch: boolean;

  selectedUser?: CustomerInfo;
  setSelectedUser: React.Dispatch<SetStateAction<CustomerInfo | undefined>>;

  accList?: AccountInfo[];
  selectedAcc?: AccountInfo;
  setSelectedAcc: React.Dispatch<SetStateAction<AccountInfo>>;

  showAddAcc: boolean;
  setShowAddAcc: React.Dispatch<SetStateAction<boolean>>;

  fetchSearch: () => void;
  fetchOrderReason: (subsEventId: number) => Promise<OrderReason[]>;
  orderUseQuery: UseQueryResult<MasterDataOrder>;
}

// Create the context with proper typing
export const OrderContext = createContext<OrderContextType | undefined>(
  undefined,
);

const API_ORDER = apiConfigOrder.order;
const API_OFFER = apiConfigOffer.offer;
const API_COMMON = apiConfigRef.ref;

// Provider component
interface OrderProviderProps {
  children: ReactNode;
}
export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const { menuPrivAccess, setActiveTab } = useOrderLayout();
  const { GetData } = useCallApi();
  const [selectedSideBar, setSelectedSideBar] = useState<OrderSideBar>();
  const [search, setSearch] = useState<string>("");
  const [searchResult, setSearchResult] = useState<CustomerInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<CustomerInfo>();
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [showAddAcc, setShowAddAcc] = useState<boolean>(false);

  const [accList, setAccList] = useState<AccountInfo[]>(mockAcc);
  const [selectedAcc, setSelectedAcc] = useState<AccountInfo>(mockAcc[0]);

  useEffect(() => {
    if (!selectedUser) {
      // console.log(selectedUser);
      // navigate("/order-entry");
      setActiveTab("main");
      // toast.error("Please select the user first");
    }
  }, [selectedUser]);

  const fetchSearch = async () => {
    try {
      setLoadingSearch(true);
      if (!search) return;
      const payload = {
        custNameAccBerCertNbr: search.trim(),
        custType: "A",
        spId: 0,
      };
      const resp = await GetData(
        `${API_ORDER}/api/order-entry/custommer/qry-cust-by-name-or-anbr-or-cnbr`,
        payload,
      );

      if (!resp.status) {
        return toast.error(resp.message || "Failed to fetch searched data");
      }

      if (resp.data.length === 1) {
        setSelectedUser(resp.data[0]);
        setSearch("");
        // navigate("/order-entry/user");
        setActiveTab("user");
      }

      setSearchResult(resp.data);
    } catch (error) {
      toast.error("Error on communicating with servers");
      setSearchResult([]);
      return;
    } finally {
      setLoadingSearch(false);
    }
  };
  // const fetchInitialData = async () => {
  //   try {
  //     const [
  //       titleResp,
  //       certTypeResp,
  //       areaResp,
  //       attrResp,
  //       industryResp,
  //       occupationResp,
  //       impGradeResp,
  //     ] = await Promise.all([
  //       GetData(`${API_ORDER}/api/order-entry/title/qry-title`, {}),
  //       GetData(`${API_ORDER}/api/order-entry/cert-type/qry-cert-type`, {}),
  //       GetData(`${API_ORDER}/api/order-entry/bfm-area/qry-area-detail`, {
  //         spId: 0,
  //       }),
  //       GetData(`${API_OFFER}/offer/attr/qry-attr-value`, {
  //         attrCode: "FJ_EXP_CUST_TYPE",
  //       }),
  //       GetData(`${API_ORDER}/api/order-entry/industry/qry-industry`, {}),
  //       GetData(`${API_ORDER}/api/order-entry/occupation/qry-occupation`, {}),
  //       GetData(`${API_ORDER}/api/order-entry/imp-grade/qry-imp-grade`, {}),
  //     ]);

  //     titleResp.status ? setTitle(titleResp.data) : setTitle([]);
  //     certTypeResp.status ? setCertType(certTypeResp.data) : setCertType([]);
  //     areaResp.status ? setAreas(areaResp.data) : setAreas([]);
  //     attrResp.status ? setAttr(attrResp.data) : setAttr([]);
  //     industryResp.status ? setIndustry(industryResp.data) : setIndustry([]);
  //     occupationResp.status
  //       ? setOccupation(occupationResp.data)
  //       : setOccupation([]);
  //     impGradeResp.status ? setImpGrade(impGradeResp.data) : setImpGrade([]);

  //     if (
  //       !titleResp.status ||
  //       !certTypeResp.status ||
  //       !areaResp.status ||
  //       !attrResp.status ||
  //       !industryResp.status ||
  //       !occupationResp.status ||
  //       !impGradeResp.status
  //     ) {
  //       toast.error("Failed to fetch some master data");
  //     }
  //   } catch (error) {
  //     toast.error("Failed to fetch master data");
  //   }
  // };

  const fetchInitialDataUseQuery = async (): Promise<MasterDataOrder> => {
    const [
      titleResp,
      certTypeResp,
      areaResp,
      attrResp,
      industryResp,
      occupationResp,
      impGradeResp,
      defLangResp,
    ] = await Promise.all([
      GetData(`${API_ORDER}/api/order-entry/title/qry-title`, {}),
      GetData(`${API_ORDER}/api/order-entry/cert-type/qry-cert-type`, {}),
      GetData(`${API_ORDER}/api/order-entry/bfm-area/qry-area-detail`, {
        spId: 0,
      }),
      GetData(`${API_OFFER}/offer/attr/qry-attr-value`, {
        attrCode: "FJ_EXP_CUST_TYPE",
      }),
      GetData(`${API_ORDER}/api/order-entry/industry/qry-industry`, {}),
      GetData(`${API_ORDER}/api/order-entry/occupation/qry-occupation`, {}),
      GetData(`${API_ORDER}/api/order-entry/imp-grade/qry-imp-grade`, {}),
      GetData(`${API_COMMON}/api/common/qry-def-lang`, {}),
    ]);

    const hasError =
      !titleResp.status ||
      !certTypeResp.status ||
      !areaResp.status ||
      !attrResp.status ||
      !industryResp.status ||
      !occupationResp.status ||
      !impGradeResp.status ||
      !defLangResp.status;

    if (hasError) {
      toast.error("Failed to fetch neccesary data for order");
      return {
        title: [],
        certType: [],
        areas: [],
        attr: [],
        industry: [],
        occupation: [],
        impGrade: [],
        defLang: [],
      };
    }

    return {
      title: titleResp.data,
      certType: certTypeResp.data,
      areas: areaResp.data,
      attr: attrResp.data,
      industry: industryResp.data,
      occupation: occupationResp.data,
      impGrade: impGradeResp.data,
      defLang: defLangResp.data,
    };
  };

  const orderUseQuery: UseQueryResult<MasterDataOrder> = useQuery({
    queryKey: ["order-entry-master-data"],
    queryFn: fetchInitialDataUseQuery,
    staleTime: 1000 * 60 * 10, // 10 minutes (master data rarely changes)
  });

  const fetchOrderReason = async (
    subsEventId: number,
  ): Promise<OrderReason[]> => {
    try {
      const resp = await GetData(
        `${API_ORDER}/api/order-entry/common-service/qry-order-reason`,
        { subsEventId: subsEventId, spId: 0 },
      );

      if (!resp.status) {
        toast.error(resp.message);
        return [];
      }
      return resp.data;
    } catch (error) {
      return [];
    }
  };

  const value = {
    selectedSideBar,
    setSelectedSideBar,
    search,
    setSearch,
    searchResult,
    setSearchResult,
    loadingSearch,

    selectedUser,
    setSelectedUser,

    accList,
    selectedAcc,
    setSelectedAcc,

    showAddAcc,
    setShowAddAcc,
    fetchSearch,
    orderUseQuery,
    fetchOrderReason,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

// Custom hook to use the context
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};

export default OrderContext;

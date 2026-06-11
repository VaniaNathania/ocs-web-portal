import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { apiConfigOrder, apiConfigRef } from "@/config/api.config";
import {
  menuAccess,
  useRoleCheck,
} from "../../role-management/hook/useRoleCheck";
import {
  DomainList,
  WholesaleMasterData,
  WholesaleMonitorList,
  WholesaleQuery,
} from "../models/interfaces";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

interface WholesaleMonitorContextType {
  menuPrivAccess: menuAccess;
  balAdd: boolean;
  setBalAdd: Dispatch<SetStateAction<boolean>>;
  balHistory: boolean;
  setBalHistory: Dispatch<SetStateAction<boolean>>;
  showDetail: boolean;
  setShowDetail: Dispatch<SetStateAction<boolean>>;
  showOperator: boolean;
  setShowOperator: Dispatch<SetStateAction<boolean>>;
  showCustSearch: boolean;
  setShowCustSearch: Dispatch<SetStateAction<boolean>>;
  selectedRow?: WholesaleMonitorList;
  setSelectedRow: Dispatch<SetStateAction<WholesaleMonitorList | undefined>>;
  masterData: UseQueryResult<WholesaleMasterData, Error>;
  query?: WholesaleQuery;
  setQuery: Dispatch<SetStateAction<WholesaleQuery | undefined>>;
  tempQuery?: WholesaleQuery;
  setTempQuery: Dispatch<SetStateAction<WholesaleQuery | undefined>>;
  stateRec: Record<string, string>;
  stateRecInst: Record<string, string>;
}

// Create the context with proper typing
export const WholesaleMonitorContext = createContext<
  WholesaleMonitorContextType | undefined
>(undefined);

const API_URL = apiConfigRef.ref;
const API_ORDER = apiConfigOrder.order;

export const WholesaleMonitorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { checkMenusPriv } = useRoleCheck();
  const { GetData } = useCallApi();
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [showOperator, setShowOperator] = useState<boolean>(false);
  const [showCustSearch, setShowCustSearch] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<WholesaleMonitorList>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<WholesaleQuery>();
  const [tempQuery, setTempQuery] = useState<WholesaleQuery>();
  const [stateRec, setStateRec] = useState<Record<string, string>>({});
  const [stateRecInst, setStateRecInst] = useState<Record<string, string>>({});

  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv(
      "/main-menu/wholesale-monitor/WholesaleMonitor",
      "addStatus",
    ),
    editStatus: checkMenusPriv(
      "/main-menu/wholesale-monitor/WholesaleMonitor",
      "editStatus",
    ),
    readStatus: checkMenusPriv(
      "/main-menu/wholesale-monitor/WholesaleMonitor",
      "readStatus",
    ),
    deleteStatus: checkMenusPriv(
      "/main-menu/wholesale-monitor/WholesaleMonitor",
      "deleteStatus",
    ),
  };
  const [balAdd, setBalAdd] = useState<boolean>(false);
  const [balHistory, setBalHistory] = useState<boolean>(false);

  const fetchAdvicetypes = async (): Promise<WholesaleMasterData> => {
    setIsLoading(true);
    try {
      const [subsEventResp, stateWholesale, stateWholesaleInst, orderState] =
        await Promise.all([
          GetData(`${API_URL}/api/event/qry-subs-event-list`, {
            sortBy: "SUBS_EVENT_ID",
            sortDirection: "asc",
          }),
          GetData(`${API_URL}/api/common/qry-domain`, {
            tableName: "WHOLESALE",
            columnName: "STATE",
          }),
          GetData(`${API_URL}/api/common/qry-domain`, {
            tableName: "WHOLESALE_INST",
            columnName: "STATE",
          }),
          GetData(
            `${API_ORDER}/api/order-entry/order/qry-order-item-state-for-distribution`,
            {},
          ),
        ]);

      const tempStateList: DomainList[] = stateWholesale.data;
      const tempStateInstList: DomainList[] = stateWholesaleInst.data;

      if (tempStateList.length > 0) {
        tempStateList.map((item) =>
          setStateRec((prev) => ({ ...prev, [item.value]: item.lookupName })),
        );
      }

      if (tempStateInstList.length > 0) {
        tempStateInstList.map((item) =>
          setStateRecInst((prev) => ({
            ...prev,
            [item.value]: item.lookupName,
          })),
        );
      }

      return {
        subsEvent: subsEventResp.data,
        queryState: stateWholesale.data,
        orderState: orderState.data,
      };
    } catch (error) {
      toast.error("error fetching data");
      return {
        subsEvent: [],
        queryState: [],
        orderState: [],
      };
    } finally {
      setIsLoading(false);
    }
  };

  const masterData: UseQueryResult<WholesaleMasterData, Error> = useQuery({
    queryFn: () => fetchAdvicetypes(),
    queryKey: ["wholesale-data"],
    refetchOnWindowFocus: false,
  });

  const value: WholesaleMonitorContextType = {
    menuPrivAccess,
    balAdd,
    setBalAdd,
    balHistory,
    setBalHistory,
    showDetail,
    setShowDetail,
    showOperator,
    setShowOperator,
    showCustSearch,
    setShowCustSearch,
    selectedRow,
    setSelectedRow,
    masterData,
    query,
    setQuery,
    tempQuery,
    setTempQuery,
    stateRec,
    stateRecInst,
  };

  return (
    <WholesaleMonitorContext.Provider value={value}>
      {children}
    </WholesaleMonitorContext.Provider>
  );
};

// Custom hook to use the context
export const useWholesaleMonitor = () => {
  const context = useContext(WholesaleMonitorContext);
  if (context === undefined) {
    throw new Error(
      "useWholesaleMonitor must be used within an WholesaleMonitorProvider",
    );
  }
  return context;
};

export default WholesaleMonitorContext;

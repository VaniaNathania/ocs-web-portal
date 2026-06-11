import { createContext, useEffect, useState } from "react";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { operationFlag } from "../blocks/utils/MapDisplayData";
import {
  menuAccess,
  useRoleCheck,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";

export interface RatableEventActionMasterProps {
  reActionName: string;
  reActionId: number;
  reActionCode: string;
  state: string;
  spId: number;
  comments?: string;
}

export interface PricePlanRecharge {
  pricePlanId: number;
  pricePlanName: string;
}

export interface TimeUnit {
  id: string;
  timeUnitName: string;
  comments: string;
}

export interface RatableEventActionContentProps {
  defPeriod: "Y" | "N";
  periodId: number;
  effDate: string;
  reActionId: number;
  operationFlag: string;
  pricePlanName: string;
  pricePlanId: number;
  spId: number;
  expDate?: string;
  reActionPricePlanId: number;
  relEffUnit?: string;
  periodRelUnit?: string;
  relExpTime?: string;
  relEffOffset?: number | null;
  relEffTime?: string;
  relExpOffset?: number;
  relExpUnit?: string;
  absEffDate?: string;
  absExpDate?: string;
}

interface ContextProps {
  fetchReAction: () => Promise<RatableEventActionMasterProps[] | undefined>;
  fetchReActionDetail: () => Promise<
    RatableEventActionContentProps[] | undefined
  >;
  reActionDatas: RatableEventActionMasterProps[];
  reActionDetailDatas: RatableEventActionContentProps[];
  pricePlanRecharge: PricePlanRecharge[];
  timeUnit: TimeUnit[];
  selectedItemMaster: RatableEventActionMasterProps | null;
  setSelectedItemMaster: (item: RatableEventActionMasterProps) => void;
  selectedItemContent: RatableEventActionContentProps | null;
  setSelectedItemContent: (item: RatableEventActionContentProps) => void;
  handleItemMasterClick: (item: RatableEventActionMasterProps) => void;
  handleItemContentClick: (item: RatableEventActionContentProps) => void;
  triggerEditMode: (item: any) => void;
  editTrigger: number;
  triggerDeleteMode: (item: any) => void;
  deleteTrigger: number;
  getOperationFlagName: (flagCode: string) => string;
  menuPrivAccess: menuAccess;
}

const initialProps: ContextProps = {
  fetchReAction: async () => [],
  fetchReActionDetail: async () => [],
  reActionDatas: [],
  reActionDetailDatas: [],
  pricePlanRecharge: [],
  timeUnit: [],
  selectedItemMaster: null,
  setSelectedItemMaster: () => {},
  selectedItemContent: null,
  setSelectedItemContent: () => {},
  handleItemMasterClick: () => {},
  handleItemContentClick: () => {},
  triggerEditMode: () => {},
  editTrigger: 0,
  triggerDeleteMode: () => {},
  deleteTrigger: 0,
  getOperationFlagName: () => "",
  menuPrivAccess: {
    addStatus: false,
    editStatus: false,
    deleteStatus: false,
    readStatus: false,
  },
};

const API_URL_REF = apiConfigRef.ref;

const RatableEventActionContext = createContext<ContextProps>(initialProps);

const RatableEventActionContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { GetData } = useCallApi();
  const { checkMenusPriv } = useRoleCheck();
  const [selectedItemMaster, setSelectedItemMaster] =
    useState<RatableEventActionMasterProps | null>(null);
  const [selectedItemContent, setSelectedItemContent] =
    useState<RatableEventActionContentProps | null>(null);
  const [reActionDatas, setReActionDatas] = useState<
    RatableEventActionMasterProps[]
  >([]);
  const [reActionDetailDatas, setReActionDetailDatas] = useState<
    RatableEventActionContentProps[]
  >([]);
  const [editTrigger, setEditTrigger] = useState<number>(0);
  const [deleteTrigger, setDeleteTrigger] = useState<number>(0);
  const [pricePlanRecharge, setPricePlanRecharge] = useState<
    PricePlanRecharge[] | []
  >([]);
  const [timeUnit, setTimeUnit] = useState<TimeUnit[] | []>([]);
  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv(
      "/main-menu/data-reference/ratable-event-action/RatableEventActionPage",
      "addStatus",
    ),
    editStatus: checkMenusPriv(
      "/main-menu/data-reference/ratable-event-action/RatableEventActionPage",
      "editStatus",
    ),
    deleteStatus: checkMenusPriv(
      "/main-menu/data-reference/ratable-event-action/RatableEventActionPage",
      "deleteStatus",
    ),
    readStatus: checkMenusPriv(
      "/main-menu/data-reference/ratable-event-action/RatableEventActionPage",
      "readStatus",
    ),
  };

  const fetchReAction = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/ratable-event-action/qry-re-action`,
        {
          spId: 0,
        },
      );
      if (response?.data) {
        setReActionDatas(response.data);
        return response.data;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReActionDetail = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/ratable-event-action/qry-re-action-price-plan`,
        {
          reActionId: selectedItemMaster?.reActionId,
          spId: 0,
        },
      );

      if (response?.data) {
        setReActionDetailDatas(response.data);
        setSelectedItemContent(response.data[0] ?? null);
        return response.data;
      }
    } catch (err) {
      console.error("fetchTimeSpanDetail error:", err);
    }
  };

  const fetchPricePlanRecharge = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/ratable-event-action/qry-subs-price-plan-for-recharge`,
        {
          spId: 0,
        },
      );

      if (response?.data) {
        setPricePlanRecharge(response.data);
        return response.data;
      }
    } catch (error) {
      //  console.log(error);
    }
  };

  const fetchTimeUnit = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/ratable-event-action/qry-time-unit-billing-cycle`,
        {
          tag: "Y",
        },
      );

      if (response?.data) {
        setTimeUnit(response.data);
        return response.data;
      }
    } catch (error) {
      //  console.log(error);
    }
  };

  useEffect(() => {
    fetchReAction();
    fetchPricePlanRecharge();
    fetchTimeUnit();
  }, []);

  useEffect(() => {
    if (selectedItemMaster?.reActionId) {
      fetchReActionDetail();
    }
  }, [selectedItemMaster]);

  const handleItemMasterClick = (item: RatableEventActionMasterProps) => {
    setSelectedItemMaster(item);
  };

  const handleItemContentClick = (item: RatableEventActionContentProps) => {
    setSelectedItemContent(item);
  };

  const triggerEditMode = (item: any) => {
    setSelectedItemContent(item);
    setEditTrigger((prev) => prev + 1);
  };

  const triggerDeleteMode = (item: any) => {
    setSelectedItemContent(item);
    setDeleteTrigger((prev) => prev + 1);
  };

  const getOperationFlagName = (flagCode: string) => {
    const found = operationFlag.find((item) => item.operationFlag === flagCode);

    return found ? `${found.operationFlagName}[${found.operationFlag}]` : "";
  };

  return (
    <RatableEventActionContext.Provider
      value={{
        reActionDatas,
        reActionDetailDatas,
        pricePlanRecharge,
        timeUnit,
        fetchReAction,
        fetchReActionDetail,
        selectedItemMaster,
        setSelectedItemMaster,
        handleItemMasterClick,
        selectedItemContent,
        setSelectedItemContent,
        handleItemContentClick,
        triggerEditMode,
        editTrigger,
        triggerDeleteMode,
        deleteTrigger,
        getOperationFlagName,
        menuPrivAccess,
      }}
    >
      {children}
    </RatableEventActionContext.Provider>
  );
};

export { RatableEventActionContext, RatableEventActionContextProvider };

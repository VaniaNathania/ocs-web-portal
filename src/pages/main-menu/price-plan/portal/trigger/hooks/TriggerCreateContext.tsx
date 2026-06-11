import React, { createContext, useCallback, useEffect, useState } from "react";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { DetailAccumulationDialog } from "../blocks";
import { BalanceTriggerList, AccumulationTriggerList } from "../blocks";
import { AdvancedRulesList } from "../blocks/advancedRules/AdvancedRulesList";
import { ThresholdBalanceDialog } from "../blocks/balance/ThresholdBalanceDialog";
import { AcctConfService } from "@/common/api/account-config/endpoints";

const API_URL = apiConfig.service_price_plan;

export type DeleteTriggerTypeKey = "triggerAcm" | "acmTriggerBenefit" | "acmTriggerNotif" | "acmTriggerEvent" | "triggerBalance" | "balanceTriggerBenefit" | "balanceTriggerEvent" | "balanceTriggerNotif";

interface ContextProps {
  thresholdList: any;
  showAddAccumulationDialog: boolean;
  handleAddAccumulationDialog: (show: boolean, selected_trigger: any | null) => void;
  showEditAccumulationDialog: boolean;
  handleEditAccumulationDialog: (show: boolean, selected_trigger: any | null) => void;
  showDetailAccumulationDialog: boolean;
  handleThresholdAccumulationDialog: (show: boolean, selected_threshold: any | null) => void;
  showDetailBalanceTrigger: boolean;
  handleShowDetailBalanceTrigger: (show: boolean, selected_trigger: any | null) => void;
  showAddBalanceDialog: boolean;
  handleAddBalanceDialog: (show: boolean) => void;
  showEditBalanceDialog: boolean;
  handleEditBalanceDialog: (show: boolean, selected_trigger: any) => void;
  showAddAdvanceRuleDialog: boolean;
  handleAddAdvanceRuleDialog: (show: boolean) => void;
  showDeleteDialog: boolean;
  handleDeleteDialog: (show: boolean, id: number | null, deleteType?: DeleteTriggerTypeKey, subBalTypeId?: number) => void;
  showDeleteConfirm: {
    show: boolean;
    deleteType: DeleteTriggerTypeKey | null;
    params?: {
      triggerId?: number;
      thresholdId?: number;
      subBalTypeId?: number;
      periodId?: number;
      adviceType?: number;
      adviceEventId?: string;
      notifyParamsId?: string;
    } | null;
  };
  setShowDeleteConfirm: (value: {
    show: boolean;
    deleteType: DeleteTriggerTypeKey | null;
    params?: {
      triggerId?: number;
      thresholdId?: number;
      subBalTypeId?: number;
      periodId?: number;
      adviceType?: number;
      adviceEventId?: string;
      notifyParamsId?: string;
    } | null;
  }) => void;
  onConfirmDelete: (deleteType: DeleteTriggerTypeKey, params: DeleteParams | null) => Promise<boolean>;
  selectedDelete: number | null;
  setSelectedDelete: (id: number | null) => void;
  selectedThreshold: any;
  showEditAdvancedRulesDialog: boolean;
  setShowEditAdvancedRulesDialog: (show: boolean) => void; //showEditAdvancedRulesDialog
  setSelectedAdvancedRules: (advanceRules: any | null) => void;
  selectedAdvancedRules: any;
  handleEditAdvancedRulesDialog: (show: boolean, selectedAdvancedRules: any) => void;
  setSelectedThreshold: (threshold: any | null) => void;
  selectedTrigger: any;
  setSelectedTrigger: any;
  selectedTriggerNotification: TriggerAcmNotification | TriggerBalanceNotification | null;
  setSelectedTriggerNotification: (notification: TriggerAcmNotification | TriggerBalanceNotification | null) => void;
  commonTriggerList: any;
  fetchThresholdList: (triggerId: number, thresholdType: "balance" | "accumulation") => Promise<void>;
  fetchAccountBalanceType: (search?: string) => Promise<{ label: string; value: string; balType: string }[]>;
  doGetListTriggerBenefit: (type: "accumulation" | "balance", page: number, limit: number, sorting: any, filter: any) => Promise<any>;
  refreshBenefitList: () => void;
  benefitListRefreshKey: number;
  refreshNotificationList: () => void;
  notificationListRefreshKey: number;
  refreshEventList: () => void;
  eventListRefreshKey: number;
  refreshAcmTriggerList: () => void;
  acmTriggerListRefreshKey: number;
  refreshBalanceTriggerList: () => void;
  balanceTriggerListRefreshKey: number;
  handleDeleteAdvancedRulesDialog: (show: boolean, selectedAdvancedRules: any | null) => void;
  showDeleteAdvancedRulesDialog: boolean;
  setShowDeleteAdvancedRulesDialog: (show: boolean) => void;
  selectedDeleteAdvancedRules: any;
  setSelectedDeleteAdvancedRules: (selectedAdvancedRules: number | null) => void;
  showBWFDialog: boolean;
  setShowBWFDialog: (show: boolean) => void;
  handleShowBWFDialog: (show: boolean, selectedAdvancedRules: any) => void;
  refreshKeyAdvanced: number;
  setRefreshKeyAdvanced: (refreshKey: number) => void;
  refreshAdvancedList: () => void;
  zoneMap: ZoneMap[];
  setZoneMap: (zoneMap: ZoneMap[]) => void;
  selectedBalanceOptions: { label: string; value: string; balType: string }[];
  setSelectedBalanceOptions: (options: { label: string; value: string; balType: string }[]) => void;
}

const initialProps: ContextProps = {
  thresholdList: [],
  showAddAccumulationDialog: false,
  handleAddAccumulationDialog: () => {},
  showEditAccumulationDialog: false,
  handleEditAccumulationDialog: () => {},
  showDetailAccumulationDialog: false,
  handleThresholdAccumulationDialog: () => {},
  showDetailBalanceTrigger: false,
  handleShowDetailBalanceTrigger: () => {},
  showAddBalanceDialog: false,
  handleAddBalanceDialog: () => {},
  showEditBalanceDialog: false,
  handleEditBalanceDialog: () => {},
  showAddAdvanceRuleDialog: false,
  handleAddAdvanceRuleDialog: () => {},
  selectedThreshold: null,
  setSelectedThreshold: () => {},
  selectedTrigger: null,
  setSelectedTrigger: () => {},
  selectedTriggerNotification: null,
  setSelectedTriggerNotification: () => {},
  handleDeleteDialog: () => {},
  showDeleteDialog: false,
  onConfirmDelete: async () => false,
  showDeleteConfirm: {
    show: false,
    deleteType: null,
  },
  setShowDeleteConfirm: () => {},
  selectedDelete: null,
  setSelectedDelete: () => {},
  showEditAdvancedRulesDialog: false,
  setShowEditAdvancedRulesDialog: () => {},
  setSelectedAdvancedRules: () => {},
  selectedAdvancedRules: null,
  handleEditAdvancedRulesDialog: () => {},
  fetchThresholdList: async (triggerId: number, thresholdType: "balance" | "accumulation") => {},
  fetchAccountBalanceType: async (search?: string): Promise<{ label: string; value: string; balType: string }[]> => {
    return [];
  },
  commonTriggerList: null,
  doGetListTriggerBenefit: async (type: "accumulation" | "balance", page: number, limit: number, sorting: any, filter: any) => {},
  refreshBenefitList: () => {},
  benefitListRefreshKey: 0,
  refreshNotificationList: () => {},
  notificationListRefreshKey: 0,
  refreshBalanceTriggerList: () => {},
  balanceTriggerListRefreshKey: 0,
  refreshEventList: () => {},
  eventListRefreshKey: 0,
  refreshAcmTriggerList: () => {},
  acmTriggerListRefreshKey: 0,
  handleDeleteAdvancedRulesDialog: () => {},
  showDeleteAdvancedRulesDialog: false,
  setShowDeleteAdvancedRulesDialog: () => {},
  selectedDeleteAdvancedRules: null,
  setSelectedDeleteAdvancedRules: () => {},
  showBWFDialog: false,
  setShowBWFDialog: () => {},
  handleShowBWFDialog: () => {},
  refreshKeyAdvanced: 0,
  setRefreshKeyAdvanced: () => {},
  refreshAdvancedList: () => {},
  zoneMap: [],
  setZoneMap: () => {},
  selectedBalanceOptions: [],
  setSelectedBalanceOptions: () => {},
};

const TriggerCreateContext = createContext<ContextProps>(initialProps);

const TriggerCreateContextProvider = ({ children }: { children?: React.ReactNode }) => {
  const { GET_ACCT_ITEM_TYPE } = AcctConfService();
  const { GetData, DeleteData } = useCallApi();
  const { selectedOfferVerId } = usePortalData();
  const [showDetailAccumulationDialog, setShowDetailAccumulationDialog] = useState(false);
  const [showDetailBalanceTrigger, setShowDetailBalanceTrigger] = useState(false);
  const [showAddAccumulationDialog, setShowAddAccumulationDialog] = useState(false);
  const [showEditAccumulationDialog, setShowEditAccumulationDialog] = useState(false);
  const [showAddBalanceDialog, setShowAddBalanceDialog] = useState(false);
  const [showEditBalanceDialog, setShowEditBalanceDialog] = useState(false);
  const [showAddAdvanceRuleDialog, setShowAddAdvanceRuleDialog] = useState(false);
  const [showEditAdvancedRulesDialog, setShowEditAdvancedRulesDialog] = useState(false);
  const [showDeleteAdvancedRulesDialog, setShowDeleteAdvancedRulesDialog] = useState(false);
  const [showBWFDialog, setShowBWFDialog] = useState(false);
  const [selectedDeleteAdvancedRules, setSelectedDeleteAdvancedRules] = useState<any | null>(null);
  const [selectedThreshold, setSelectedThreshold] = useState<any | null>(null);
  const [selectedTriggerNotification, setSelectedTriggerNotification] = useState<TriggerAcmNotification | TriggerBalanceNotification | null>(null);
  const [selectedAdvancedRules, setSelectedAdvancedRules] = useState<any | null>(null);
  const [selectedTrigger, setSelectedTrigger] = useState<any>(null);
  const [thresholdList, setThresholdList] = useState<any[]>([]);
  const [commonTriggerList, setCommonTriggerList] = useState<any[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    show: boolean;
    deleteType: DeleteTriggerTypeKey | null;
    params?: {
      triggerId?: number;
      thresholdId?: number;
      subBalTypeId?: number;
      periodId?: number;
      adviceType?: number;
      adviceEventId?: string;
      notifyParamsId?: string;
    } | null;
  }>({
    show: false,
    deleteType: null,
    params: null,
  });
  const [selectedDelete, setSelectedDelete] = useState<number | null>(null);
  const [selectedSubBalTypeId, setSelectedSubBalTypeId] = useState<number | null>(null);
  const [refreshKeyAdvanced, setRefreshKeyAdvanced] = useState(0);

  const [selectedBalanceOptions, setSelectedBalanceOptions] = useState<{ label: string; value: string; balType: string }[]>([]);

  const [benefitListRefreshKey, setBenefitListRefreshKey] = useState(0);
  const [notificationListRefreshKey, setNotificationListRefreshKey] = useState(0);
  const [balanceTriggerListRefreshKey, setBalanceTriggerListRefreshKey] = useState(0);
  const [acmTriggerListRefreshKey, setAcmTriggerListRefreshKey] = useState(0);
  const [eventListRefreshKey, setEventListRefreshKey] = useState(0);

  const [zoneMap, setZoneMap] = useState<ZoneMap[]>([]);
  const refreshAcmTriggerList = useCallback(() => {
    setAcmTriggerListRefreshKey((prev) => prev + 1);
  }, []);

  const refreshBalanceTriggerList = useCallback(() => {
    setBalanceTriggerListRefreshKey((prev) => prev + 1);
  }, []);

  const refreshBenefitList = useCallback(() => {
    setBenefitListRefreshKey((prev) => prev + 1);
  }, []);

  const refreshNotificationList = useCallback(() => {
    setNotificationListRefreshKey((prev) => prev + 1);
  }, []);

  const refreshEventList = useCallback(() => {
    setEventListRefreshKey((prev) => prev + 1);
  }, []);

  const refreshAdvancedList = useCallback(() => {
    setRefreshKeyAdvanced((prev) => prev + 1);
  }, []);

  const handleAddAccumulationDialog = useCallback((show: boolean, selected_trigger: any | null) => {
    setShowAddAccumulationDialog(show);
    setSelectedTrigger(selected_trigger);
  }, []);

  const handleEditAccumulationDialog = useCallback((show: boolean, selected_trigger: any | null) => {
    setShowEditAccumulationDialog(show);
    setSelectedTrigger(selected_trigger);
  }, []);

  const handleShowBWFDialog = useCallback((show: boolean, selectedAdvancedRules: any | null) => {
    setShowBWFDialog(show);
    setSelectedAdvancedRules(selectedAdvancedRules);
  }, []);

  const handleEditAdvancedRulesDialog = useCallback((show: boolean, selectedAdvancedRules: any | null) => {
    setShowEditAdvancedRulesDialog(show);
    setSelectedAdvancedRules(selectedAdvancedRules);
  }, []);
  const handleDeleteAdvancedRulesDialog = useCallback((show: boolean, selectedAdvancedRules: any | null) => {
    setShowDeleteAdvancedRulesDialog(show);
    setSelectedDeleteAdvancedRules(selectedAdvancedRules);
  }, []);

  const handleThresholdAccumulationDialog = useCallback(async (show: boolean, selected_trigger: any | null) => {
    setSelectedTrigger(selected_trigger);
    setShowDetailAccumulationDialog(show);
  }, []);

  const handleShowDetailBalanceTrigger = useCallback((show: boolean, selected_trigger: any) => {
    setShowDetailBalanceTrigger(show);
    setSelectedTrigger(selected_trigger);
  }, []);

  const handleAddBalanceDialog = useCallback((show: boolean) => {
    setShowAddBalanceDialog(show);
  }, []);

  const handleEditBalanceDialog = useCallback((show: boolean, selected_trigger: any) => {
    setShowEditBalanceDialog(show);
    setSelectedTrigger(show ? selected_trigger : null);
  }, []);

  const handleAddAdvanceRuleDialog = useCallback((show: boolean) => {
    setShowAddAdvanceRuleDialog(show);
  }, []);

  const handleDeleteDialog = useCallback((show: boolean, id: number | null, deleteType: DeleteTriggerTypeKey = "acmTriggerBenefit", subBalTypeId?: number) => {
    setShowDeleteConfirm({
      show,
      deleteType: show ? deleteType : null,
    });
    setSelectedDelete(show ? id : null);
    setSelectedSubBalTypeId(subBalTypeId !== undefined ? subBalTypeId : null);
  }, []);

  const doGetListTriggerBenefit = useCallback(
    async (type: "accumulation" | "balance", page: number, limit: number, sorting: any, filter: any) => {
      if (!selectedThreshold?.acmThresholdId && !selectedThreshold?.tresholdId) {
        return {
          data: [],
          totalCount: 0,
        };
      }

      sorting = sorting.length === 0 ? [{ id: "eff_date", desc: false }] : sorting;

      filter = filter?.length === 0 ? {} : filter;
      let filterObject: Record<string, string | string[]> = {};
      if (Object.keys(filter).length !== 0) {
        for (let _filter of filter) {
          filterObject[_filter.id] = _filter.value;
        }
      }

      filter = filterObject;

      try {
        const response =
          type === "accumulation"
            ? await GetData(`${API_URL}/trigger/benefit/acm/list`, {
                thresholdId: selectedThreshold?.acmThresholdId,
                spId: 0,
              })
            : await GetData(`${API_URL}/trigger/benefit/balance/list`, {
                tresholdId: selectedThreshold?.tresholdId,
              });

        return {
          data: response?.data || [],
          totalCount: response?.data?.length || 0,
        };
      } catch (error) {
        console.error("Error fetching benefit list:", error);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [selectedThreshold],
  );

  const onConfirmDelete = async (deleteType: DeleteTriggerTypeKey, params: DeleteParams | null): Promise<boolean> => {
    if (!params) {
      toast.error("No item selected for deletion");
      return false;
    }

    try {
      let endpoint = "";
      let successMessage = "";
      let requestBody: any = null;

      switch (deleteType) {
        case "triggerBalance":
          endpoint = `${API_URL}/trigger/balance/delete/${params?.triggerId}`;
          successMessage = "Balance trigger deleted successfully";
          break;

        case "triggerAcm":
          endpoint = `${API_URL}/trigger/accumulation/delete/${params?.triggerId}`;
          successMessage = "Accumulation trigger deleted successfully";
          break;

        case "acmTriggerBenefit":
          endpoint = `${API_URL}/trigger/benefit/acm/delete/${params?.thresholdId}/${params?.subBalTypeId}`;
          successMessage = "Accumulation trigger Benefit deleted successfully";
          break;

        case "acmTriggerNotif":
          endpoint = `${API_URL}/trigger/notification/acm/delete`;
          requestBody = {
            acmThresholdId: params?.thresholdId,
            adviceEventId: params?.adviceEventId,
            adviceType: params?.adviceType,
            notifyParamsId: params?.notifyParamsId,
            spId: 0,
          };
          successMessage = "Accumulation trigger notification deleted successfully";
          break;

        case "acmTriggerEvent":
          endpoint = `${API_URL}/trigger/event/acm/delete/${params?.thresholdId}/${params?.subBalTypeId}`;
          successMessage = "Accumulation trigger event deleted successfully";
          break;

        case "balanceTriggerBenefit":
          endpoint = `${API_URL}/trigger/benefit/balance/delete?periodId=${params?.periodId}&balThresholdId=${params?.thresholdId}&subBalTypeId=${params?.subBalTypeId}`;
          successMessage = "Balance trigger Benefit deleted successfully";
          break;

        case "balanceTriggerEvent":
          endpoint = `${API_URL}/trigger/event/balance/delete/${params?.thresholdId}/${params?.subsEventId}`;
          successMessage = "Balance trigger event deleted successfully";
          break;

        case "balanceTriggerNotif":
          endpoint = `${API_URL}/trigger/notification/balance/delete/${params?.thresholdId}?notiftype=${params?.notifType}&triggerNotification=${params.triggerNotification}`;
          successMessage = "Balance trigger notification successfully";
          break;

        default:
          throw new Error("Invalid delete type");
      }

      const response = await DeleteData(endpoint, requestBody);

      if (response?.status) {
        toast.success(successMessage);
        return true;
      } else {
        toast.error(response?.message || "Failed to delete item");
        return false;
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to delete ${deleteType}`);
      return false;
    } finally {
      setSelectedDelete(null);
    }
  };

  const handleFetchThreshold = useCallback(async (show: boolean, selected_threshold: number | null) => {
    setSelectedThreshold(selected_threshold);
    if (show) {
      try {
        const response = await GetData(`${API_URL}/trigger/threshold/acm/list`, {
          triggerId: selectedThreshold,
        });

        if (response && response.data) {
          setThresholdList(response.data.data);
        } else {
          toast.error("Error Fetching Data.Please Check Your Connection!");
        }
      } catch (error) {
        toast.error("Error Fetching Data.Please Check Your Connection!");
      } finally {
        handleFetchThreshold(false, null);
      }
    }
  }, []);

  const fetchThresholdList = useCallback(async (triggerId: number, thresholdType: "balance" | "accumulation") => {
    try {
      const response =
        thresholdType === "accumulation"
          ? await GetData(`${API_URL}/trigger/threshold/acm/list`, {
              triggerId,
            })
          : await GetData(`${API_URL}/trigger/threshold/balance/list`, {
              triggerId,
            });

      if (response.status) {
        setThresholdList(response.data || []);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to get list threshold");
    }
  }, []);

  useEffect(() => {
    const fetchTriggerMode = async () => {
      try {
        const response = await GetData(`${API_URL}/trigger/type/list`, {});
        if (response.status) {
          setCommonTriggerList(response.data);
        }
      } catch (error) {
        toast.error("Error Fetching Data.Please Check Your Connection!");
      }
    };

    fetchTriggerMode();
  }, []);

  const fetchAccountBalanceType = async (search?: string): Promise<{ label: string; value: string; balType: string }[]> => {
    const response = await GET_ACCT_ITEM_TYPE({
      acctItemTypeName: search,
      page: 1,
      size: 1000,
      sortBy: "BAL_TYPE",
      sortDirection: "ASC",
      spId: 0,
    });

    if (response.status) {
      const mapped = response.data.map((item: any) => ({
        label: item.acctItemTypeName ?? item.acctResName,
        value: String(item.acctResId),
        balType: item.balType,
      }));
      setSelectedBalanceOptions(mapped);
      return mapped;
    }

    return [];
  };

  useEffect(() => {
    const getZoneMap = async () => {
      try {
        const response = await GetData(`${API_URL}/mapping/zone-map-all/list`, {});
        if (response.status) {
          setZoneMap(response.data);
        }
      } catch (error) {
        toast.error("Error Fetching Data.Please Check Your Connection!");
      }
    };

    if (selectedOfferVerId) {
      getZoneMap();
    }
  }, [selectedOfferVerId]);

  useEffect(() => {
    if (selectedOfferVerId) {
      refreshBalanceTriggerList();
      refreshAcmTriggerList();
    }
  }, [selectedOfferVerId]);

  return (
    <TriggerCreateContext.Provider
      value={{
        thresholdList,
        commonTriggerList,
        showDetailAccumulationDialog,
        handleThresholdAccumulationDialog,
        showEditAccumulationDialog,
        handleEditAccumulationDialog,
        showDetailBalanceTrigger,
        handleShowDetailBalanceTrigger,
        showAddAccumulationDialog,
        handleAddAccumulationDialog,
        showAddBalanceDialog,
        handleAddBalanceDialog,
        showEditBalanceDialog,
        handleEditBalanceDialog,
        showAddAdvanceRuleDialog,
        handleAddAdvanceRuleDialog,
        selectedThreshold,
        setSelectedThreshold,
        selectedTrigger,
        setSelectedTrigger,
        selectedTriggerNotification,
        setSelectedTriggerNotification,
        handleDeleteDialog,
        showDeleteDialog,
        showDeleteConfirm,
        setShowDeleteConfirm,
        onConfirmDelete,
        selectedDelete,
        setSelectedDelete,
        fetchThresholdList,
        doGetListTriggerBenefit,
        refreshBenefitList,
        benefitListRefreshKey,
        refreshNotificationList,
        notificationListRefreshKey,
        refreshBalanceTriggerList,
        balanceTriggerListRefreshKey,
        refreshEventList,
        eventListRefreshKey,
        refreshAcmTriggerList,
        acmTriggerListRefreshKey,
        handleEditAdvancedRulesDialog,
        selectedAdvancedRules,
        setSelectedAdvancedRules,
        setShowEditAdvancedRulesDialog,
        showEditAdvancedRulesDialog,
        handleDeleteAdvancedRulesDialog,
        selectedDeleteAdvancedRules,
        setSelectedDeleteAdvancedRules,
        setShowDeleteAdvancedRulesDialog,
        showDeleteAdvancedRulesDialog,
        setShowBWFDialog,
        showBWFDialog,
        handleShowBWFDialog,
        refreshAdvancedList,
        setRefreshKeyAdvanced,
        refreshKeyAdvanced,
        setZoneMap,
        zoneMap,
        fetchAccountBalanceType,
        selectedBalanceOptions,
        setSelectedBalanceOptions,
      }}
    >
      {children}
      {showDetailAccumulationDialog && <DetailAccumulationDialog />}
      {showDetailBalanceTrigger && <ThresholdBalanceDialog />}

      <div className="p-6">
        <div className="mb-8">
          <AccumulationTriggerList />
        </div>

        <div className="mb-8">
          <BalanceTriggerList />
        </div>

        <div className="mb-8">
          <AdvancedRulesList />
        </div>
      </div>
    </TriggerCreateContext.Provider>
  );
};

export { TriggerCreateContext, TriggerCreateContextProvider };

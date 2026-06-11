import { DataGridProvider } from "@/components";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { createContext, useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { ColumnAcctBalance } from "./ColumnAcctBalance";
import ListToolbar from "../blocks/ListToolbar";
import BalanceDetailPanel from "../blocks/BalanceDetailPanel";
import { useForm } from "react-hook-form";
import {
  AccountBalanceTypePayload,
  accountBalanceTypeSchema,
  createDefaultAccountBalancePayload,
} from "../types/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import BalanceEditDialog from "../blocks/BalanceEditDialog";
import BalanceDeleteDialog from "../blocks/BalanceDeleteDialog";
import { PricePlanService } from "@/common/api/price-plan/endpoints";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";

export type DeleteAccountConfigTypeKey = "balanceType";

interface ContextProps {
  listBalanceType: AccountBalanceTypeDetail[];
  showDialog: { show: boolean; mode: "create" | "update" };
  handleShowDialog: (
    show: boolean,
    mode: "create" | "update",
    balanceType: AccountBalanceTypeInformation | null,
    acctResId: number | null,
  ) => void;
  selectedBalanceType: AccountBalanceTypeInformation | null;
  setSelectedBalanceType: (
    balanceType: AccountBalanceTypeInformation | null,
  ) => void;
  selectedDelete: number | null;
  setSelectedDelete: (id: number | null) => void;
  showDeleteConfirm: {
    show: boolean;
    deleteType: DeleteAccountConfigTypeKey | null;
  };
  setShowDeleteConfirm: (value: {
    show: boolean;
    deleteType: DeleteAccountConfigTypeKey | null;
  }) => void;
  handleDeleteDialog: (
    show: boolean,
    id: number | null,
    deleteType?: DeleteAccountConfigTypeKey,
  ) => void;
  onConfirmDelete: (
    deleteType: DeleteAccountConfigTypeKey,
    offerVerId?: number,
    eventId?: number,
    priceVerId?: number,
    subBalTypeId?: number,
  ) => void;
  doGetListBalanceType: (
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string,
  ) => void;
  balTypeList: GetBalType[];
  setBalTypeList: (balTypeList: GetBalType[]) => void;
  getBalTypeList: () => void;
  parentList: ParentAcctResId[];
  setParentList: (parentList: ParentAcctResId[]) => void;
  getParentAcctResId: () => void;
  unitType: { unitTypeName: string; unitTypeId: number }[];
  setUnitType: (
    unitType: { unitTypeName: string; unitTypeId: number }[],
  ) => void;
  getUnitType: () => void;
  acmUnit: { timeUnitName: string; timeUnit: string }[];
  setAcmUnit: (acmUnit: { timeUnitName: string; timeUnit: string }[]) => void;
  getAcmUnitList: () => void;
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  refreshKeyABT: number;
  setRefreshKeyABT: (refreshKeyABT: number) => void;
  handlerefresh: () => void;
}

const initialProps: ContextProps = {
  listBalanceType: [],
  showDialog: { show: false, mode: "create" },
  handleShowDialog: () => {},
  selectedBalanceType: null,
  setSelectedBalanceType: () => {},
  selectedDelete: null,
  setSelectedDelete: () => {},
  showDeleteConfirm: { show: false, deleteType: null },
  setShowDeleteConfirm: () => {},
  handleDeleteDialog: () => {},
  onConfirmDelete: () => {},
  doGetListBalanceType: () => {},
  balTypeList: [],
  setBalTypeList: () => {},
  getBalTypeList: () => {},
  parentList: [],
  setParentList: () => {},
  getParentAcctResId: () => {},
  unitType: [],
  setUnitType: () => {},
  getUnitType: () => {},
  acmUnit: [],
  setAcmUnit: () => {},
  getAcmUnitList: () => {},
  selectedId: null,
  setSelectedId: () => {},
  refreshKeyABT: 0,
  setRefreshKeyABT: () => {},
  handlerefresh: () => {},
};

const API_URL_PRICEPLAN = apiConfig.service_price_plan;
const API_URL = apiConfig.service_price_plan;
const AccountBalanceContext = createContext<ContextProps>(initialProps);

const AccountBalanceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { state } = useLocation();
  const { selectedOfferVerId } = state || {};
  const { GET_UNIT_TYPE } = PricePlanService();
  const [formType, setFormType] = useState<"create" | "update">("create");
  const methods = useForm<AccountBalanceTypePayload>({
    resolver: zodResolver(accountBalanceTypeSchema),
    defaultValues: createDefaultAccountBalancePayload(),
    mode: "onChange",
  });
  const { menuPrivAccess } = useAccountConfigLayout();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    watch,
    control,
    formState,
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    trigger,
    clearErrors,
    setError,
  } = methods;
  const { GetData, DeleteData, PutData, PostData, PythonData } = useCallApi();

  const [listBalanceType, setListBalanceType] = useState<
    AccountBalanceTypeDetail[]
  >([]);

  const [parentList, setParentList] = useState<ParentAcctResId[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [showDialog, setShowDialog] = useState<{
    show: boolean;
    mode: "create" | "update";
  }>({
    show: false,
    mode: "create",
  });

  const [refreshKeyABT, setRefreshKeyABT] = useState(0);

  const [selectedBalanceType, setSelectedBalanceType] =
    useState<AccountBalanceTypeInformation | null>(null);
  const [selectedDelete, setSelectedDelete] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    show: boolean;
    deleteType: DeleteAccountConfigTypeKey | null;
  }>({
    show: false,
    deleteType: null,
  });
  const [balTypeList, setBalTypeList] = useState<GetBalType[]>([]);
  const [unitType, setUnitType] = useState<
    { unitTypeName: string; unitTypeId: number }[]
  >([]);
  const [acmUnit, setAcmUnit] = useState<
    {
      timeUnit: string;
      timeUnitName: string;
    }[]
  >([]);

  const handlerefresh = useCallback(() => {
    setRefreshKeyABT((prev) => prev + 1);
  }, []);

  const handleShowDialog = (
    show: boolean,
    mode: "create" | "update",
    balanceType: AccountBalanceTypeInformation | null,
    acctResId: number | null,
  ) => {
    setShowDialog({ show, mode });
    setSelectedBalanceType(balanceType);
    setSelectedId(acctResId);
  };

  const handleDeleteDialog = (
    show: boolean,
    id: number | null,
    deleteType: DeleteAccountConfigTypeKey = "balanceType",
  ) => {
    setShowDeleteConfirm({
      show,
      deleteType: show ? deleteType : null,
    });
    setSelectedDelete(show ? id : null);
  };

  const onConfirmDelete = async (deleteType: DeleteAccountConfigTypeKey) => {
    const itemId = selectedDelete;

    if (!itemId) {
      toast.error("No item selected for deletion");
      return;
    }

    try {
      let endpoint = "";
      let successMessage = "";
      let requestBody: any = null;

      switch (deleteType) {
        case "balanceType":
          endpoint = `${API_URL}/acct/item-type/delete/${itemId}`;
          successMessage = "Balance Type deleted successfully";
          break;
      }

      const response = await DeleteData(endpoint, requestBody);

      if (response?.status) {
        toast.success(successMessage);
      } else {
        toast.error(response?.message || `Failed to delete ${deleteType}`);
      }
    } catch (error: any) {
      toast.error(
        error.message || "Error Deleting Data. Please Check Your Connection!",
      );
    }
  };

  const doGetListBalanceType = async (
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string,
  ) => {
    try {
      const response: any = await GetData(
        `${API_URL}/account-balance/balance-type-with-mvno`,
        {
          page,
          size,
          sortBy,
          sortDirection,
        },
      );

      setListBalanceType(response.data);
      setTotalCount(response.totalRows);
      return { data: response.data, totalCount: response.totalRows };
    } catch (error) {
      toast.error("Error Fetching Data. Please Check Your Connection!");
      return { data: [], totalCount: 0 };
    }
  };

  const getBalTypeList = async () => {
    try {
      const response = await GetData(`${API_URL}/account-balance/bal-type`, {});
      setBalTypeList(response.data);
      return {
        data: response?.data || [],
        totalCount: response?.totalRows || 0,
      };
    } catch (error) {
      console.error("Error fetching Balance Type", error);
      toast.error("Error Fetching Data. Please Check Your Connection!");
    }
  };

  const getBalanceTypeLists = async (
    page: number,
    limit: number,
    sorting: any,
    filter: any,
  ) => {
    try {
      sorting =
        sorting.length === 0 ? [{ id: "ACCT_RES_ID", desc: false }] : sorting;

      // Build query parameters
      const params: any = {
        size: limit,
        page: page + 1,
        order_field: sorting[0].id,
        order_direction: sorting[0].desc === false ? "ASC" : "DESC",
      };

      // Add filter parameters
      if (filter.length > 0) {
        filter.forEach((f: any) => {
          if (f.id === "acctResId" && f.value) {
            params.acctResId = f.value;
          }
          if (f.id === "acctResName" && f.value) {
            params.acctResName = f.value;
          }
        });
      }

      const response = await GetData(
        `${API_URL}/account-balance/balance-type-with-mvno`,
        params,
      );

      setListBalanceType(response.data);
      return {
        data: response?.data || [],
        totalCount: response?.totalRows || 0,
      };
    } catch (error) {
      console.error("Error fetching Balance Type", error);
      toast.error("Error Fetching Data. Please Check Your Connection!");
      return { data: [], totalCount: 0 };
    }
  };

  const getParentAcctResId = async () => {
    try {
      const response = await GetData(
        `${API_URL}/account-balance/acct-res-list`,
        {},
      );
      setParentList(response.data);
      return {
        data: response?.data || [],
        totalCount: response?.totalRows || 0,
      };
    } catch (error) {
      console.error("Error fetching Balance Type", error);
      toast.error("Error Fetching Data. Please Check Your Connection!");
    }
  };
  const getUnitType = async () => {
    try {
      const response = await GET_UNIT_TYPE();
      setUnitType(response.data);
      return {
        data: response?.data || [],
        totalCount: response?.totalRows || 0,
      };
    } catch (error) {
      console.error("Error fetching Balance Type", error);
      toast.error("Error Fetching Data. Please Check Your Connection!");
    }
  };
  const getAcmUnitList = async () => {
    try {
      const response = await GetData(
        `${API_URL}/time-unit/list?notExact=Y
`,
        {},
      );
      setAcmUnit(response.data);
      return {
        data: response?.data || [],
        totalCount: response?.totalRows || 0,
      };
    } catch (error) {
      console.error("Error fetching Balance Type", error);
      toast.error("Error Fetching Data. Please Check Your Connection!");
    }
  };
  useEffect(() => {
    if (selectedBalanceType) {
      setValue("acctResFree.rum", selectedBalanceType?.rum!);
      setValue("acctResFree.value", selectedBalanceType?.value!);
      if (
        watch("acctResFree.rum") === null &&
        watch("acctResFree.value") === null
      ) {
        setValue("acctResFree", null);
      }
      setValue("acctResName", selectedBalanceType?.acctResName!);
      setValue("acmAmount", selectedBalanceType?.acmAmount);
      setValue("acmThreshold", selectedBalanceType?.acmThreshold);
      setValue("acmType", selectedBalanceType?.acmType);
      setValue("acmUnit", selectedBalanceType?.acmUnit);
      setValue("adjustFlag", selectedBalanceType?.adjustFlag);
      setValue("adjustType", selectedBalanceType?.adjustType);
      setValue("balCategory", selectedBalanceType?.balCategory!);
      setValue("balType", selectedBalanceType?.balType!);
      setValue("balanceAggregation", selectedBalanceType?.balanceAggregation!);
      setValue("category", selectedBalanceType?.category!);
      setValue("ceilLimit", selectedBalanceType?.ceilLimit);
      setValue("clearDays", selectedBalanceType?.clearDays);
      setValue("clearFlag", selectedBalanceType?.clearFlag);
      setValue("comments", selectedBalanceType?.comments);
      setValue("creditLimit", selectedBalanceType?.creditLimit);
      setValue("customerFlag", selectedBalanceType?.customerFlag);
      setValue("dailyCeilLimit", selectedBalanceType?.dailyCeilLimit);
      setValue("dailyFloorLimit", selectedBalanceType?.dailyFloorLimit);
      setValue(
        "defaultAcctItemTypeId",
        selectedBalanceType?.defaultAcctItemType!,
      );

      setValue("extendRule", selectedBalanceType?.extendRule);
      setValue("floorLimit", selectedBalanceType?.floorLimit);
      setValue("freeFlag", selectedBalanceType?.freeFlag);
      setValue("gracePeriod", selectedBalanceType?.gracePeriod);
      setValue("isCurrency", selectedBalanceType?.isCurrency);
      setValue("isFreeUnit", selectedBalanceType?.isFreeUnit);
      setValue("maxAdjustValue", selectedBalanceType?.maxAdjustValue);
      setValue("maxChgValue", selectedBalanceType?.maxChgValue);
      setValue("maxExpDate", selectedBalanceType?.maxExpDate);
      setValue("maxRollover", selectedBalanceType?.maxRollover);
      setValue("maxValue", selectedBalanceType?.maxValue);
      setValue("overdraftFlag", selectedBalanceType?.overdraftFlag);
      setValue("parentAcctResId", selectedBalanceType?.parentAcctResId);
      setValue("paymentForce", selectedBalanceType?.paymentForce);
      setValue("periodClass", selectedBalanceType?.periodClass);
      setValue("priority", selectedBalanceType?.priority);
      setValue("ratioMoney", selectedBalanceType?.ratioMoney);
      setValue("ratioPrecision", selectedBalanceType?.ratioPrecision);
      setValue("refillable", selectedBalanceType?.refillable);
      setValue("remindDay", selectedBalanceType?.remindDay);
      setValue("remindValue", selectedBalanceType?.remindValue);
      setValue("reservePercentage", selectedBalanceType?.reservePercentage);
      setValue("resetZero", selectedBalanceType?.resetZero);
      setValue("rewardFlag", selectedBalanceType?.rewardFlag);
      setValue("rolloverFlag", selectedBalanceType?.rolloverFlag);
      setValue("spId", selectedBalanceType?.spId);
      setValue("stdCode", selectedBalanceType?.stdCode);
      setValue("storeUnit", selectedBalanceType?.storeUnit);
      setValue("unitPrecision", selectedBalanceType?.unitPrecision);
      setValue("unitTypeId", selectedBalanceType?.unitTypeId);
      setValue("unlimitedFlag", selectedBalanceType?.unlimitedFlag);
      setValue("usageType", selectedBalanceType?.usageType);
      setValue("parentAcctResId", selectedBalanceType?.parentAcctResId);

      // Set transAcctResCfg fields
      setValue(
        "transAcctResCfg.dayThreshold",
        selectedBalanceType?.dayThreshold,
      );
      setValue(
        "transAcctResCfg.weekThreshold",
        selectedBalanceType?.weekThreshold,
      );
      setValue(
        "transAcctResCfg.monthThreshold",
        selectedBalanceType?.monthThreshold,
      );
      setValue("transAcctResCfg.dayCount", selectedBalanceType?.dayCount);
      setValue("transAcctResCfg.weekCount", selectedBalanceType?.weekCount);
      setValue("transAcctResCfg.monthCount", selectedBalanceType?.monthCount);
      setValue(
        "transAcctResCfg.minResidualBal",
        selectedBalanceType?.minResidualBal,
      );
      setValue("transAcctResCfg.maxAllowed", selectedBalanceType?.maxAllowed);
      setValue("transAcctResCfg.minAllowed", selectedBalanceType?.minAllowed);
      setValue(
        "transAcctResCfg.transferFactor",
        selectedBalanceType?.transferFactor,
      );
    }
  }, [selectedBalanceType]);

  return (
    <AccountBalanceContext.Provider
      value={{
        listBalanceType,
        showDialog,
        handleShowDialog,
        selectedBalanceType,
        setSelectedBalanceType,
        selectedDelete,
        setSelectedDelete,
        showDeleteConfirm,
        setShowDeleteConfirm,
        handleDeleteDialog,
        onConfirmDelete,
        doGetListBalanceType,
        getBalTypeList,
        balTypeList,
        setBalTypeList,
        getParentAcctResId,
        parentList,
        setParentList,
        getUnitType,
        unitType,
        setUnitType,
        acmUnit,
        getAcmUnitList,
        setAcmUnit,
        setSelectedId,
        selectedId,
        handlerefresh,
        refreshKeyABT,
        setRefreshKeyABT,
      }}
    >
      <DataGridProvider
        key={`${refreshKeyABT}`}
        columns={ColumnAcctBalance(
          handleDeleteDialog,
          menuPrivAccess,
          handleShowDialog,
        )}
        pagination={{ size: 10 }}
        toolbar={<ListToolbar />}
        layout={{ card: true }}
        sorting={[{ id: "ACCT_RES_ID", desc: true }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          getBalanceTypeLists(pageIndex, pageSize, sorting, columnFilters)
        }
      >
        {children}
        <BalanceDeleteDialog />
      </DataGridProvider>
      <BalanceEditDialog
        forms={methods}
        formType={formType}
        isSubmitting={isSubmitting}
      />
      {/* <BalanceDetailPanel /> */}
    </AccountBalanceContext.Provider>
  );
};

export { AccountBalanceContext, AccountBalanceProvider };

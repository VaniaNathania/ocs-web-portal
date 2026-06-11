import { DataGridProvider } from "@/components";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { set } from "date-fns";
import { createContext, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ColumnBillingCycleType } from "./ColumnBillingCycleType";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  billingCycleTypeSchema,
  createDefaultBillingCycleTypePayload,
} from "../types/forms";
import { createDefaultAccountBalancePayload } from "../../account-balanceType/types/forms";
// import { create } from "handlebars";
import ListToolbar from "../blocks/ListToolbar";
import BalanceEditDialog from "../blocks/BillingCycleTypeForm";
import { BillingCycleTypeDetailDialog } from "./BasicBillingCycleContext";
import { id } from "zod/v4/locales";
import DeleteCycleTypeDialog from "../blocks/DeleteTypeDIalog";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";

interface ContextProps {
  showDialog: { show: boolean; mode: "create" | "update" };
  handleShowDialog: (
    show: boolean,
    mode: "create" | "update",
    billingCycleType: BillingCycleTypeList | null,
  ) => void;
  listBillingCycleType: BillingCycleTypeList[];
  selectedBillingCycleType: BillingCycleTypeList | null;
  setSelectedBillingCycleType: (
    billingCycleType: BillingCycleTypeList | null,
  ) => void;
  doGetBillingCycleType: (page: number, size: number) => void;
  billingCycleTypeId: number | null;
  setBillingCycleTypeId: (id: number | null) => void;
  showDetailDialog: { show: boolean; billingCycleTypeId: number | null };
  setShowDetailDialog: (value: {
    show: boolean;
    billingCycleTypeId: number | null;
  }) => void;
  handleDetailDialog: (
    show: boolean,
    billingCycleType: BillingCycleTypeList,
  ) => void;
  showBasicDialog: { show: boolean; mode: "create" | "update" };
  setShowBasicDialog: (value: {
    show: boolean;
    mode: "create" | "update";
  }) => void;
  handleBasicShowDialog: (
    show: boolean,
    mode: "create" | "update",
    billingCycle: BillingCycleList | null,
  ) => void;
  selectedBillingCycle: BillingCycleList | null;
  setSelectedBillingCycle: (billingCycle: BillingCycleList | null) => void;
  showDeleteConfirm: {
    show: boolean;
    typeId: number | null;
    basicId: number | null;
    mode: "mono" | "multi";
  };
  setShowDeleteConfirm: (value: {
    show: boolean;
    typeId: number | null;
    basicId: number | null;
    mode: "mono" | "multi";
  }) => void;
  handleCycleDelete: (
    show: boolean,
    typeId: number | null,
    basicId: number | null,
    mode: "mono" | "multi",
  ) => void;
  showDeleteBasic: { show: boolean; id: number | null };
  setShowDeleteBasic: (value: { show: boolean; id: number | null }) => void;
  selectedStateFlag: string | null;
  setSelectedStateFlag: (value: string | null) => void;
  handleDeleteDialog: (show: boolean, id: number | null) => void;
  handlerefresh: () => void;
  handleBasicRefresh: () => void;
  refreshKeyBasicBCT: number;
  disabledEdit: boolean;
  setDisabledEdit: (value: boolean) => void;
  doGetBillingCycle: (
    page: number,
    size: number,
  ) => Promise<{ data: any[]; totalCount: number }>;
  doDisableEditDelete: (
    page: number,
    size: number,
    billingCycleId: number,
  ) => Promise<{ data: any[]; totalCount: number }>;
}

const initialProps: ContextProps = {
  listBillingCycleType: [],
  showDialog: { show: false, mode: "create" },
  handleShowDialog: () => {},
  selectedBillingCycleType: null,
  setSelectedBillingCycleType: () => {},
  doGetBillingCycleType: () => {},
  billingCycleTypeId: null,
  setBillingCycleTypeId: () => {},
  showDetailDialog: { show: false, billingCycleTypeId: null },
  setShowDetailDialog: () => {},
  handleDetailDialog: () => {},
  handleBasicShowDialog: () => {},
  setShowBasicDialog: () => {},
  showBasicDialog: { show: false, mode: "create" },
  selectedBillingCycle: null,
  setSelectedBillingCycle: () => {},
  handleCycleDelete: () => {},
  setShowDeleteConfirm: () => {},
  showDeleteConfirm: { basicId: null, typeId: null, show: false, mode: "mono" },
  selectedStateFlag: null,
  setSelectedStateFlag: () => {},
  handleDeleteDialog: () => {},
  setShowDeleteBasic: () => {},
  showDeleteBasic: { show: false, id: null },
  handlerefresh: () => {},
  handleBasicRefresh: () => {},
  refreshKeyBasicBCT: 0,
  disabledEdit: false,
  setDisabledEdit: () => {},
  doGetBillingCycle: async () => ({ data: [], totalCount: 0 }),
  doDisableEditDelete: async () => ({ data: [], totalCount: 0 }),
};
const BillingCycleTypeContext = createContext<ContextProps>(initialProps);
const API_URL = apiConfig.service_price_plan;

const BillingCycleTypeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { GetData, PostData, PutData } = useCallApi();
  const { menuPrivAccess } = useAccountConfigLayout();
  const [listBillingCycleType, setListBillingCycleType] = useState<
    BillingCycleTypeList[]
  >([]);
  const [showDetailDialog, setShowDetailDialog] = useState<{
    show: boolean;
    billingCycleTypeId: number | null;
  }>({ show: false, billingCycleTypeId: null });
  const [showDialog, setShowDialog] = useState<{
    show: boolean;
    mode: "create" | "update";
  }>({ show: false, mode: "create" });
  const [showBasicDialog, setShowBasicDialog] = useState<{
    show: boolean;
    mode: "create" | "update";
  }>({ show: false, mode: "create" });
  const [selectedBillingCycleType, setSelectedBillingCycleType] =
    useState<BillingCycleTypeList | null>(null);
  const [selectedDelete, setSelectedDelete] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const methods = useForm<BillingCycleTypePayload>({
    resolver: zodResolver(billingCycleTypeSchema),
    defaultValues: createDefaultBillingCycleTypePayload(), // ✅ Tanpa 'as any'
    mode: "onChange",
  });

  const [selectedStateFlag, setSelectedStateFlag] = useState<string | null>(
    null,
  );
  const [disabledEdit, setDisabledEdit] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    show: boolean;
    typeId: number | null;
    basicId: number | null;
    mode: "mono" | "multi";
  }>({ show: false, typeId: null, basicId: null, mode: "mono" });
  const [showDeleteBasic, setShowDeleteBasic] = useState<{
    show: boolean;
    id: number | null;
  }>({ show: false, id: null });

  const handleCycleDelete = (
    show: boolean,
    typeId: number | null,
    basicId: number | null,
    mode: "mono" | "multi",
  ) => {
    setShowDeleteConfirm({ show, typeId, basicId, mode });
  };
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const refreshData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [billingCycleTypeId, setBillingCycleTypeId] = useState<number | null>(
    null,
  );
  const [refreshKeyBCT, setRefreshKeyBCT] = useState(0);
  const [refreshKeyBasicBCT, setRefreshKeyBasicBCT] = useState(0);
  const handlerefresh = useCallback(() => {
    setRefreshKeyBCT((prev) => prev + 1);
  }, []);
  const handleBasicRefresh = useCallback(() => {
    setRefreshKeyBasicBCT((prev) => prev + 1);
  }, []);
  const [selectedBillingCycle, setSelectedBillingCycle] =
    useState<BillingCycleList | null>(null);

  const handleDetailDialog = async (
    show: boolean,
    billingCycleType: BillingCycleTypeList | null,
  ) => {
    setShowDetailDialog({ show, billingCycleTypeId });
    setSelectedBillingCycleType(billingCycleType);
  };

  const handleBasicShowDialog = async (
    show: boolean,
    mode: "create" | "update",
    billingCycle: BillingCycleList | null,
  ) => {
    setShowBasicDialog({ show, mode });
    setSelectedBillingCycle(billingCycle);
  };
  const handleDeleteDialog = async (show: boolean, typeId: number | null) => {
    setShowDeleteBasic({ show, id: typeId });
  };

  const handleShowDialog = async (
    show: boolean,
    mode: "create" | "update",
    billingCycleType: BillingCycleTypeList | null,
  ) => {
    setShowDialog({ show, mode });
    setSelectedBillingCycleType(billingCycleType);

    if (show && mode === "update" && billingCycleType) {
      try {
        const response: any = await GetData(
          `${API_URL}/billing-cycle/type/list?spId=0`,
          {
            page: 1,
            size: 1,
            billingCycleTypeId: billingCycleType.billingCycleTypeId,
          },
        );

        // ✅ handle jika response berupa array
        const data = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        if (!data) {
          toast.error("No detail data found");
          return;
        }

        // ✅ set data ke form
        methods.reset({
          beginDate: data.beginDate,
          debtDate: data.debtDate,
          billingCycleTypeCode: data.billingCycleTypeCode,
          billingCycleTypeName: data.billingCycleTypeName,
          comments: data.comments,
          custType: data.custType,
          operator: data.operator,
          postpaid: data.postpaid,
          prodType: data.prodType,
          quantity: data.quantity,
          runDate: data.runDate,
          timeUnit: data.timeUnit,
          spId: data.spId ?? 0,
        });
      } catch (error) {
        toast.error("Failed to fetch detail data");
      }
    }

    if (show && mode === "create") {
      methods.reset(createDefaultBillingCycleTypePayload());
    }
  };

  const doGetBillingCycleType = async (page: number, size: number) => {
    try {
      const response: any = await GetData(
        `${API_URL}/billing-cycle/type/list?spId=0`,
        {
          page,
          size,
        },
      );
      setListBillingCycleType(response.data);
      setTotalCount(response.totalRows);
      return { data: response.data, totalCount: response.totalRows };
    } catch (error) {
      toast.error("Error Fetching Data. Please Check Your Connection!");
      return {
        data: [],
        totalCount: 0,
      };
    }
  };
  const doGetBillingCycle = async (page: number, size: number) => {
    try {
      const response: any = await GetData(
        `${API_URL}/billing-cycle/list?state=A&billingCycleTypeId=${selectedBillingCycleType?.billingCycleTypeId}&spId=0`,
        {
          page,
          size,
        },
      );
      setDisabledEdit(true);
      return { data: response.data, totalCount: response.totalRows };
    } catch (error) {
      toast.error("Error Fetching Data. Please Check Your Connection!");
      return {
        data: [],
        totalCount: 0,
      };
    }
  };
  const doDisableEditDelete = async (
    page: number,
    size: number,
    billingCycleTypeId: number,
  ) => {
    try {
      const response: any = await GetData(
        `${API_URL}/billing-cycle/list?state=A&billingCycleTypeId=${billingCycleTypeId}&spId=0`,
        {
          page,
          size,
        },
      );
      setDisabledEdit(true);
      return { data: response.data, totalCount: response.totalRows };
    } catch (error) {
      toast.error("Error Fetching Data. Please Check Your Connection!");
      return {
        data: [],
        totalCount: 0,
      };
    }
  };

  return (
    <BillingCycleTypeContext.Provider
      value={{
        showDialog,
        handleShowDialog,
        listBillingCycleType,
        selectedBillingCycleType,
        setSelectedBillingCycleType,
        doGetBillingCycleType,
        billingCycleTypeId,
        setBillingCycleTypeId,
        showDetailDialog,
        setShowDetailDialog,
        handleDetailDialog,
        handleBasicShowDialog,
        setShowBasicDialog,
        showBasicDialog,
        selectedBillingCycle,
        setSelectedBillingCycle,
        handleCycleDelete,
        setShowDeleteConfirm,
        showDeleteConfirm,
        selectedStateFlag,
        setSelectedStateFlag,
        handleDeleteDialog,
        setShowDeleteBasic,
        showDeleteBasic,
        handlerefresh,
        handleBasicRefresh,
        refreshKeyBasicBCT,
        disabledEdit,
        setDisabledEdit,
        doGetBillingCycle,
        doDisableEditDelete,
      }}
    >
      <DataGridProvider
        columns={ColumnBillingCycleType(
          handleShowDialog,
          handleDetailDialog,
          handleDeleteDialog,
          doDisableEditDelete,
          menuPrivAccess,
        )}
        key={`${refreshKeyBCT}`}
        toolbar={<ListToolbar />}
        pagination={{ size: 10 }}
        layout={{ card: true }}
        sorting={[{ id: "BILLING_CYCLE_TYPE_ID", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
          return doGetBillingCycleType(pageIndex, pageSize);
        }}
      >
        {children}
        <BalanceEditDialog
          forms={methods}
          formType={showDialog.mode}
          isSubmitting={isSubmitting}
        />
        <DeleteCycleTypeDialog />
        <BillingCycleTypeDetailDialog />
      </DataGridProvider>
    </BillingCycleTypeContext.Provider>
  );
};

export { BillingCycleTypeContext, BillingCycleTypeProvider };

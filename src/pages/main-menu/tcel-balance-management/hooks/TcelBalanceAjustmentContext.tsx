import { DataGridProvider } from "@/components";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import {
  createContext,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnMainPage } from "./ColumnMainPage";
import { ListToolbar } from "../blocks/ListToolBar";
import AdvancedSearchDialog from "../blocks/AdvancedSearchDialog";
import { Label } from "@/components/ui/label";
import FormDialog from "../blocks/FormDialog";
import {
  createDefaultTcelBalanceAjustmentPayload,
  TcelBalanceAdjustmentForm,
  TcelBalanceAdjustmentSchema,
} from "../types/forms";
import {
  menuAccess,
  useRoleCheck,
} from "../../role-management/hook/useRoleCheck";
import AdvanceSearchDialog from "../blocks/advance-search/AdvanceSearch";
import { AcctInfoPayment } from "../../payment/interfaces";

interface ContextProps {
  showDialog: { show: boolean; mode: "create" | "update" | "detail" };
  handleShowDialog: (
    show: boolean,
    mode: "create" | "update" | "detail",
    TcelBalanceAdjustment?: any,
  ) => void;
  selectedTcelBalanceAdjustment: any | null;
  listTcelBalanceAdjustment: TcelBalanceAdjustmentList[];
  listFilterExpired: FilterExpired | null;
  handleAdvancedSearchDialog: (show: boolean) => void;
  showAdvancedSearchDialog: { show: boolean };
  currentAcctNbr: string | null;
  detailInfoDialog: {
    acctId: number | null;
    acctNbr: string | null;
  };
  menuPrivAccess: menuAccess;
  query: payQuery;
  setQuery: React.Dispatch<SetStateAction<payQuery>>;
  selectedRow?: AcctInfoPayment;
  setSelectedRow: React.Dispatch<SetStateAction<AcctInfoPayment | undefined>>;
  rows: AcctInfoPayment[];
  isLoading: boolean;
  setIsLoading: React.Dispatch<SetStateAction<boolean>>;
  totalRows: number;
}

const initialProps: ContextProps = {
  showDialog: { show: false, mode: "create" },
  handleShowDialog: () => {},
  selectedTcelBalanceAdjustment: null,
  listTcelBalanceAdjustment: [],
  listFilterExpired: null,
  handleAdvancedSearchDialog: () => {},
  showAdvancedSearchDialog: { show: false },
  currentAcctNbr: null,
  detailInfoDialog: {
    acctId: null,
    acctNbr: null,
  },
  menuPrivAccess: {
    addStatus: false,
    deleteStatus: false,
    editStatus: false,
    readStatus: false,
  },
  query: {
    acctNbr: "",
    spId: 0,
    page: 1,
    size: 5,
    sortBy: "CUST_ID",
    sortDirection: "asc",
  },
  setQuery: () => {},
  selectedRow: undefined,
  setSelectedRow: () => {},
  rows: [],
  isLoading: false,
  setIsLoading: () => {},
  totalRows: 0,
};

const TcelBalanceAdjustmentContext = createContext<ContextProps>(initialProps);
const API_URL = apiConfig.service_price_plan;

const TcelBalanceAdjustmentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { GetData, PostData, PutData } = useCallApi();
  const { checkMenusPriv } = useRoleCheck();
  const [listTcelBalanceAdjustment, setListTcelBalanceAdjustment] = useState<
    ContextProps["listTcelBalanceAdjustment"]
  >([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [selectedRow, setSelectedRow] = useState<AcctInfoPayment>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<AcctInfoPayment[]>([]);
  const [currentAcctNbr, setCurrentAcctNbr] = useState<string>("");

  const [query, setQuery] = useState<payQuery>({
    acctNbr: currentAcctNbr ?? "",
    spId: 0,
    page: 1,
    size: 5,
    sortBy: "CUST_ID",
    sortDirection: "asc",
  });

  const [menuPrivAccess, setMenuPrivAccess] = useState<menuAccess>({
    addStatus: false,
    deleteStatus: false,
    editStatus: false,
    readStatus: false,
  });

  useEffect(() => {
    setMenuPrivAccess({
      addStatus: checkMenusPriv(
        "/main-menu/tcel-balance-management/TcelBalanceAdjustment",
        "addStatus",
      ),
      editStatus: checkMenusPriv(
        "/main-menu/tcel-balance-management/TcelBalanceAdjustment",
        "editStatus",
      ),
      deleteStatus: checkMenusPriv(
        "/main-menu/tcel-balance-management/TcelBalanceAdjustment",
        "deleteStatus",
      ),
      readStatus: checkMenusPriv(
        "/main-menu/tcel-balance-management/TcelBalanceAdjustment",
        "readStatus",
      ),
    });
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // if (selectedRow?.accNbr && selectedRow) {
      //   return;
      // }

      const resp = await GetData(
        `${API_URL}/balance-adjustment/qry-acct-info`,
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
    // setTotalRows(0);
  }, [query]);

  const [listFilterExpired, setListFilterExpired] =
    useState<FilterExpired | null>(null);

  const [showDetailDialog, setShowDetailDialog] = useState<{
    show: boolean;
    TcelBalanceAdjustmentId: number | null;
  }>({ show: false, TcelBalanceAdjustmentId: null });

  const [showDialog, setShowDialog] = useState<ContextProps["showDialog"]>({
    show: false,
    mode: "create",
  });

  const [showAdvancedSearchDialog, setShowAdvancedSearchDialog] = useState<{
    show: boolean;
  }>({ show: false });

  const [selectedTcelBalanceAdjustment, setSelectedTcelBalanceAdjustment] =
    useState<TcelBalanceAdjustmentList | null>(null);
  const [selectedFilterExpired, setSelectedFilterExpired] =
    useState<FilterExpired | null>(null);
  const [selectedDelete, setSelectedDelete] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [detailInfoDialog, setDetailInfoDialog] = useState<{
    acctId: number | null;
    acctNbr: string | null;
  }>({ acctId: null, acctNbr: null });
  const methods = useForm<TcelBalanceAdjustmentForm>({
    resolver: zodResolver(TcelBalanceAdjustmentSchema),
    defaultValues: createDefaultTcelBalanceAjustmentPayload(),
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

  const handleAdvancedSearchDialog = (show: boolean) => {
    setShowAdvancedSearchDialog({ show });
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

  const [refreshKeyTBA, setRefreshKeyTBA] = useState(0);
  const handlerefresh = useCallback(() => {
    setRefreshKeyTBA((prev) => prev + 1);
  }, []);

  const handleShowDialog = async (
    show: boolean,
    mode: "create" | "update" | "detail",
    data: any = null,
  ) => {
    setShowDialog({ show, mode });
    if (show) {
      setSelectedTcelBalanceAdjustment(data);
    } else {
      setSelectedTcelBalanceAdjustment(null);
    }
  };

  const handleSearchAcctNbr = (acctNbr: string) => {
    setCurrentAcctNbr(acctNbr);
    setRefreshKeyTBA((prev) => prev + 1);
  };

  const handleClearSearch = () => {
    setCurrentAcctNbr("");
    setListFilterExpired(null);
    setTotalCount(0);
    setRefreshKeyTBA((prev) => prev + 1);
  };

  useEffect(() => {
    console.log(selectedRow);

    handleSearchAcctNbr(selectedRow?.acctNbr ?? "");
  }, [selectedRow?.acctNbr]);

  const doGetMainTable = async (page: number, size: number) => {
    if (!currentAcctNbr) return { data: [], totalCount: 0 };

    try {
      const response = await GetData(
        `${API_URL}/balance-adjustment/filter-expire?acctNbr=${currentAcctNbr}`,
        {},
      );

      if (!response.status) {
        toast.error(response?.message);
        return { data: [], totalCount: 0 };
      }
      const tableData = response.data.flatMap((item: any) => {
        const { acctInfo, balList } = item;

        // ✅ Hanya return data kalau balList ada isi
        if (balList && balList.length > 0) {
          return balList.map((bal: any) => ({
            ...acctInfo,
            ...bal,
          }));
        }

        return [];
      });

      setListFilterExpired(response.data[0]);

      return { data: tableData, totalCount: tableData.length };
    } catch (error: any) {
      console.log("ini error : ", error);
      return { data: [], totalCount: 0 };
    }
  };

  return (
    <TcelBalanceAdjustmentContext.Provider
      value={{
        showDialog,
        handleShowDialog,
        listTcelBalanceAdjustment,
        listFilterExpired,
        handleAdvancedSearchDialog,
        showAdvancedSearchDialog,
        currentAcctNbr,
        detailInfoDialog,
        menuPrivAccess,
        selectedRow,
        setSelectedRow,
        query,
        setQuery,
        rows,
        totalRows,
        isLoading,
        setIsLoading,
        selectedTcelBalanceAdjustment,
      }}
    >
      <div className="border-l-4 border-red-500 bg-white px-6 py-4 shadow-sm m-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Tcel Balance Adjustment
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage customer balance adjustments
        </p>
      </div>
      <DataGridProvider
        columns={ColumnMainPage(
          handleShowDialog,
          doGetMainTable,
          menuPrivAccess,
        )}
        key={`${refreshKeyTBA}`}
        toolbar={
          <ListToolbar
            onSearch={handleSearchAcctNbr}
            onClear={handleClearSearch}
            currentAcctNbr={currentAcctNbr}
          />
        }
        pagination={{ size: 10 }}
        layout={{ card: true }}
        sorting={[{ id: "acct_Id", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
          return doGetMainTable(pageIndex, pageSize);
        }}
      >
        {children}
        <FormDialog />
      </DataGridProvider>
      {/* Advanced Search Dialog */}
      {/* <AdvancedSearchDialog onSelectAccount={handleSearchAcctNbr} /> */}
      <AdvanceSearchDialog
        isOpen={showAdvancedSearchDialog.show}
        handleDialog={handleAdvancedSearchDialog}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
      />
    </TcelBalanceAdjustmentContext.Provider>
  );
};

export { TcelBalanceAdjustmentContext, TcelBalanceAdjustmentProvider };

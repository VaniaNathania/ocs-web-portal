import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { ColumnDef } from "@tanstack/react-table";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DateRange } from "react-day-picker";
import { ListToolBar } from "../blocks/ListToolBar";
import { useAuthContext } from "@/auth";
import { usePricePlanPortalStore } from "@/stores/pricePlanPortal.store";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { usePricePlanLayout } from "@/layouts/main-menu/price-plan";
import { AddDialog } from "../blocks/AddDialog";
import { UpdateDialog } from "../blocks/EditDialog";
import { PriorityTableDialog } from "../blocks/PriorityTableDialog";
import { DeleteDialog } from "../blocks/DeleteDialog";

interface ContextProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  showAddDialog: boolean;
  handleAddDialog: (show: boolean) => void;
  showAddAccountDialog: boolean;
  handleAddAccountDialog: (show: boolean) => void;
  applyLevel: string;
  pricePlanTypeId: string;
  showEditDialog: boolean;
  showEditAccountDialog: boolean;
  handleEditDialog: (show: boolean) => void;
  handleEditAccountDialog: (show: boolean) => void;
  selectedPricePlanId: number | null;
  setSelectedPricePlanId: (data: number) => void;
  showDeleteDialog: boolean;
  handleDeleteDialog: (show: boolean) => void;
  selectedApplyLevel: string;
  setSelectedApplyLevel: (data: string) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
  showPriorityTable: boolean;
  setShowPriorityTable: (show: boolean) => void;
  handleShowPriorityTable: (show: boolean) => void;
}

const initialProps: ContextProps = {
  date: undefined,
  setDate: () => {},
  showAddDialog: false,
  handleAddDialog: () => {},
  showAddAccountDialog: false,
  handleAddAccountDialog: () => {},
  applyLevel: "",
  pricePlanTypeId: "",
  showEditDialog: false,
  handleEditDialog: () => {},
  showEditAccountDialog: false,
  handleEditAccountDialog: () => {},
  selectedPricePlanId: null,
  setSelectedPricePlanId: () => {},
  handleDeleteDialog: () => {},
  showDeleteDialog: false,
  selectedApplyLevel: "",
  setSelectedApplyLevel: () => {},
  isSearching: false,
  setIsSearching: () => {},
  handleShowPriorityTable: () => {},
  showPriorityTable: false,
  setShowPriorityTable: () => {},
};

const PricePlanListContext = createContext<ContextProps>(initialProps);

const API_URL = apiConfig.service_price_plan;

interface ProviderProps {
  children: React.ReactNode;
  applyLevel: string;
  pricePlanTypeId: string;
}

const PricePlanListContextProvider = ({
  children,
  applyLevel,
  pricePlanTypeId,
}: ProviderProps) => {
  const { GetData } = useCallApi();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 31)),
    to: new Date(),
  });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPricePlanId, setSelectedPricePlanId] = useState<number | null>(
    null,
  );
  const [selectedApplyLevel, setSelectedApplyLevel] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditAccountDialog, setShowEditAccountDialog] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { menuPrivAccess } = usePricePlanLayout();
  const [showPriorityTable, setShowPriorityTable] = useState(false);

  const { setDataPricePlan } = usePricePlanPortalStore();

  const handleShowPriorityTable = useCallback((show: boolean) => {
    setShowPriorityTable(show);
  }, []);

  const handleAddDialog = useCallback((show: boolean) => {
    setShowAddDialog(show);
  }, []);

  const handleEditDialog = useCallback((show: boolean) => {
    setShowEditDialog(show);
  }, []);

  const handleEditAccountDialog = useCallback((show: boolean) => {
    setShowEditAccountDialog(show);
  }, []);

  const handleAddAccountDialog = useCallback((show: boolean) => {
    setShowAddAccountDialog(show);
  }, []);

  const handleDeleteDialog = useCallback((show: boolean) => {
    setShowDeleteDialog(show);
  }, []);

  /* Data Grid Columns */
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.pricePlanName,
        id: "pricePlanName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Price Plan Name"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-2/12",
          cellClassName: "w-2/12",
        },
        cell: (data: any) => {
          const row = data.row.original;
          return (
            <p
              className={`${row.pricePlanName ? "" : "text-center"} whitespace-nowrap`}
            >
              {row.pricePlanName || "-"}
            </p>
          );
        },
      },
      {
        accessorFn: (row) => row.pricePlanType,
        id: "pricePlanType",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Price Plan Type"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-2/12",
          cellClassName: "w-2/12",
        },
        cell: (data: any) => {
          const row = data.row.original;
          return (
            <p
              className={`${row.pricePlanType ? "" : "text-center"} whitespace-nowrap`}
            >
              {row.pricePlanType || "-"}
            </p>
          );
        },
      },
      {
        accessorFn: (row) => row.pricePlanCode,
        id: "pricePlanCode",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Price Plan Code"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-2/12",
          cellClassName: "w-2/12",
        },
        cell: (data: any) => {
          const row = data.row.original;
          return (
            <p
              className={`${row.pricePlanCode ? "" : "text-center"} whitespace-nowrap`}
            >
              {row.pricePlanCode || "-"}
            </p>
          );
        },
      },
      {
        id: "validPeriod",
        header: ({ column }) => (
          <DataGridColumnHeader title="Valid Period" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          if (item.expDate == null) {
            return `${item.effDate} -`;
          }
          return `${item.effDate} - ${item.expDate}`;
        },
        meta: { headerClassName: "w-[250px]" },
      },
      {
        id: "Operation",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Actions"
            className="text-center"
            column={column}
          />
        ),
        cell: (data: any) => {
          const row = data.row.original;
          return (
            <div className="flex justify-center gap-1">
              <AccessWrapper hasAccess={menuPrivAccess?.editStatus ?? false}>
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  onClick={() => {
                    handleEditDialog(true);
                    setSelectedPricePlanId(row.pricePlanId);
                    setSelectedApplyLevel(row.applyLevel);
                    //  console.log(row);
                  }}
                >
                  <KeenIcon icon="notepad-edit" />
                </button>
              </AccessWrapper>

              <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus ?? false}>
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  onClick={() => {
                    handleDeleteDialog(true);
                    setSelectedPricePlanId(row.pricePlanId);
                  }}
                >
                  <KeenIcon icon="trash" />
                </button>
              </AccessWrapper>

              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  setDataPricePlan(row);
                }}
              >
                <KeenIcon icon="eye" />
              </button>
            </div>
          );
        },
        meta: {
          headerClassName: "w-1/12 text-center",
          cellClassName: "w-1/12 text-center",
        },
      },
    ],
    [menuPrivAccess],
  );

  const doGetPricePlanList = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      try {
        sorting =
          sorting.length === 0 ? [{ id: "createdDate", desc: false }] : sorting;

        let pricePlanName = "";
        let pricePlanCode = "";

        if (filter && Array.isArray(filter)) {
          const nameFilter = filter.find((f) => f.id === "pricePlanName");
          const codeFilter = filter.find((f) => f.id === "pricePlanCode");

          pricePlanName = nameFilter ? nameFilter.value : "";
          pricePlanCode = codeFilter ? codeFilter.value : "";
        }

        // Tentukan endpoint berdasarkan applyLevel
        const endpoint =
          applyLevel === "A"
            ? `${API_URL}/priceplan/AcctPricePlan/list`
            : `${API_URL}/priceplan/SubsPricePlan/list`;

        const response = await GetData(endpoint, {
          // Kalau lagi search, pricePlanType dikosongin (0 atau null)
          pricePlanType: isSearching ? null : pricePlanTypeId,
          spId: 0,
          pricePlanName: pricePlanName,
          pricePlanCode: pricePlanCode,
          size: limit,
          page: page + 1,
          order_field: sorting[0]?.id || "createdDate",
          order_direction: sorting[0]?.desc === false ? "DESC" : "ASC",
        });

        return {
          data: response?.data || [],
          totalCount: response?.totalRows || 0,
        };
      } catch (error) {
        console.error("Error fetching price plan list:", error);
        return { data: [], totalCount: 0 };
      }
    },
    [applyLevel, pricePlanTypeId, GetData, isSearching],
  );

  useEffect(() => {
    if (applyLevel) {
      setSelectedApplyLevel(applyLevel);
    }
    //  console.log(applyLevel);
  }, [applyLevel]);

  return (
    <PricePlanListContext.Provider
      value={{
        date,
        setDate,
        showAddDialog,
        handleAddDialog,
        showAddAccountDialog,
        handleAddAccountDialog,
        applyLevel,
        pricePlanTypeId,
        showEditDialog,
        handleEditDialog,
        showEditAccountDialog,
        handleEditAccountDialog,
        selectedPricePlanId,
        setSelectedPricePlanId,
        showDeleteDialog,
        handleDeleteDialog,
        selectedApplyLevel,
        setSelectedApplyLevel,
        isSearching,
        setIsSearching,
        handleShowPriorityTable,
        setShowPriorityTable,
        showPriorityTable,
      }}
    >
      <DataGridProvider
        key={`${applyLevel}-${pricePlanTypeId}`}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<ListToolBar />}
        layout={{ card: true }}
        sorting={[{ id: "createdDate", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          doGetPricePlanList(pageIndex, pageSize, sorting, columnFilters)
        }
      >
        {children}
        <AddDialog />
        <UpdateDialog />
        <PriorityTableDialog />
        <DeleteDialog />
      </DataGridProvider>
    </PricePlanListContext.Provider>
  );
};

export { PricePlanListContext, PricePlanListContextProvider };

import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { createContext, useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ExpandedState,
} from "@tanstack/react-table";
import { ColumnBank } from "../blocks/ColumnBanks";
import ListToolBar from "../blocks/ListToolBar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBankSchema, defaultCreateBankPayload } from "../types/forms";
import BankForm from "../blocks/BankForm";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
// import { ColumnBank, BankRow } from "./ColumnBank";

export type DeleteBankTypeKey = "accountItem";

interface ContextProps {
  showDialog: {
    show: boolean;
    mode: "create" | "update" | "createChild";
    selectedBank: BankRow | null;
  };
  handleShowDialog: (
    show: boolean,
    mode: "create" | "update" | "createChild",
    sselectedBank: BankRow | null,
  ) => void;
  bankList: BankList[];
  refreshBankList: () => void;
  selectedBank: BankRow | null;
}

const initialProps: ContextProps = {
  handleShowDialog: () => {},
  showDialog: { show: false, mode: "create", selectedBank: null },
  bankList: [],
  refreshBankList: () => {},
  selectedBank: null,
};

const API_URL = apiConfig.service_price_plan;
const BankContext = createContext<ContextProps>(initialProps);

// Helper function to build tree structure
const buildBankTree = (data: BankList[]): BankRow[] => {
  const dataMap = new Map<number, BankRow>();
  const rootNodes: BankRow[] = [];

  // First pass: create all nodes
  data.forEach((item) => {
    dataMap.set(item.bankId, { ...item, subRows: [] });
  });

  // Second pass: build parent-child relationships
  data.forEach((item) => {
    const node = dataMap.get(item.bankId)!;

    // Check if it's a root node (parentId is null, 0, or doesn't exist)
    if (!item.parentId || item.parentId === 0) {
      rootNodes.push(node);
    } else {
      const parent = dataMap.get(item.parentId);
      if (parent) {
        parent.subRows!.push(node);
      } else {
        // If parent not found, treat as root
        rootNodes.push(node);
      }
    }
  });

  return rootNodes;
};

const BankProvider = ({ children }: { children: React.ReactNode }) => {
  const { GetData, DeleteData } = useCallApi();
  const { menuPrivAccess } = useAccountConfigLayout();

  const [showDialog, setShowDialog] = useState<{
    show: boolean;
    mode: "create" | "update" | "createChild";
    selectedBank: BankList | null;
  }>({
    show: false,
    mode: "create",
    selectedBank: null,
  });

  const methods = useForm<BankAddPayload>({
    resolver: zodResolver(createBankSchema),
    defaultValues: defaultCreateBankPayload(),
    mode: "onChange",
  });

  const [selectedBank, setSelectedBank] = useState<BankList | null>(null);
  const [selectedDelete, setSelectedDelete] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    show: boolean;
    deleteType: DeleteBankTypeKey | null;
  }>({
    show: false,
    deleteType: null,
  });

  const [bankList, setBankList] = useState<BankList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const handleShowDialog = (
    show: boolean,
    mode: "create" | "update" | "createChild",
    selectedBank: BankList | null,
  ) => {
    setShowDialog({ show, mode, selectedBank });
  };

  const handleDeleteDialog = (
    show: boolean,
    id: number | null,
    deleteType: DeleteBankTypeKey = "accountItem",
  ) => {
    setShowDeleteConfirm({
      show,
      deleteType: show ? deleteType : null,
    });
    setSelectedDelete(show ? id : null);
  };

  const handleDelete = (bankId: number) => {
    handleDeleteDialog(true, bankId, "accountItem");
  };

  const onConfirmDelete = async (deleteType: DeleteBankTypeKey) => {
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
        case "accountItem":
          endpoint = `${API_URL}/bank/del?bankId=${itemId}&sepaAction=del`;
          successMessage = "Bank deleted successfully";
          break;
      }

      const response = await DeleteData(endpoint, requestBody);

      if (response?.status) {
        toast.success(successMessage);
        doGetListBank();
      } else {
        toast.error(response?.message || `Failed to delete ${deleteType}`);
      }
    } catch (error: any) {
      toast.error(
        error.message || "Error Deleting Data. Please Check Your Connection!",
      );
    } finally {
      handleDeleteDialog(false, null);
    }
  };

  const doGetListBank = async () => {
    setIsLoading(true);
    try {
      const response = await GetData(`${API_URL}/bank/list`, []);

      if (response?.data) {
        setBankList(response.data);
      }

      return {
        data: response?.data || [],
        totalCount: response?.totalRows || 0,
      };
    } catch (error) {
      console.error("Error fetching Bank List", error);
      toast.error("Error Fetching Data. Please Check Your Connection!");
      setBankList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Build tree structure
  const treeData = useMemo(() => buildBankTree(bankList), [bankList]);

  // Get columns
  const columns = useMemo(
    () =>
      ColumnBank({
        handleShowDialog: handleShowDialog,
        onDelete: handleDelete,
        menuPrivAccess,
      }),
    [],
  );

  // Initialize table
  const table = useReactTable({
    data: treeData,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  // Initial load
  // useEffect(() => {
  //   doGetListBank();
  // }, []);

  // Refresh when dialog closes
  useEffect(() => {
    if (showDialog.show === false) {
      doGetListBank();
    }
  }, [showDialog.show]);

  return (
    <BankContext.Provider
      value={{
        handleShowDialog,
        showDialog,
        bankList,
        refreshBankList: doGetListBank,
        selectedBank,
      }}
    >
      <BankForm
        formType={showDialog.mode}
        forms={methods}
        isSubmitting={methods.formState.isSubmitting}
      />
      <div className="border-l-4 border-red-500 bg-white px-6 py-4 shadow-sm m-5">
        <h1 className="text-2xl font-bold text-gray-900">Bank</h1>
        <p className="text-sm text-gray-500 mt-1">Manage Bank</p>
      </div>
      <div className="m-5 bg-white">
        <ListToolBar />
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="w-full overflow-auto bg-white rounded-lg shadow">
            <table className="w-full border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b bg-gray-50">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this bank? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleDeleteDialog(false, null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onConfirmDelete(showDeleteConfirm.deleteType!)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {children}
      </div>
    </BankContext.Provider>
  );
};

export { BankContext, BankProvider };

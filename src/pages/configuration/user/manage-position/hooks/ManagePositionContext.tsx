import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiConfig } from "@/config/api.config";
import { Toaster } from "@/components/ui/sonner";
import { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { EnforceSwitch } from "@/components/switch";
import { ListToolBar } from "../blocks";
import { useCallApi } from "@/hooks";

interface ContextProps {
  showEditDialog: boolean;
  handleEditDialog: (
    show: boolean,
    selected_user: selectedPosition | null,
  ) => void;
  showAddDialog: boolean;
  handleAddDialog: (show: boolean) => void;
  showDeleteDialog: boolean;
  handleDeleteDialog: (
    show: boolean,
    selected_user: selectedPosition | null,
  ) => void;
  selectedPosition: selectedPosition | null;
  menus: any[];
}

interface selectedPosition {
  id: string;
  name: string;
  roles: string[];
  status: string;
}

const initialProps: ContextProps = {
  showEditDialog: false,
  handleEditDialog: () => {},
  showAddDialog: false,
  handleAddDialog: () => {},
  showDeleteDialog: false,
  handleDeleteDialog: () => {},
  selectedPosition: null,
  menus: [],
};

const ManagePositionContext = createContext<ContextProps>(initialProps);

const API_URL = apiConfig.service_price_plan;
const API_URL_MD = apiConfig.service_master_data;

const ManagePositionContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /* state */
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] =
    useState<selectedPosition | null>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const { GetData } = useCallApi();

  /* action */
  const handleEditDialog = useCallback(
    (show: boolean, selected_user: selectedPosition | null) => {
      setSelectedPosition(show ? selected_user : null);
      setShowEditDialog(show);
    },
    [],
  );

  const handleAddDialog = useCallback((show: boolean) => {
    setShowAddDialog(show);
  }, []);

  const handleDeleteDialog = useCallback(
    (show: boolean, selected_user: selectedPosition | null) => {
      setSelectedPosition(show ? selected_user : null);
      setShowDeleteDialog(show);
    },
    [],
  );

  /* Data Grid Options */
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="name" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <DataGridColumnHeader title="Action" column={column} />
        ),
        cell: (data: any) => {
          const row = data.row.original;

          return (
            <>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => handleEditDialog(true, row)}
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => handleDeleteDialog(true, row)}
              >
                <KeenIcon icon="trash" />
              </button>
            </>
          );
        },
        meta: {
          headerClassName: "w-[100px]",
          cellClassName: "text-center",
        },
      },
    ],
    [handleEditDialog, handleDeleteDialog],
  );

  const doGetListData = async (
    page: number,
    limit: number,
    sorting: any,
    filter: any,
  ) => {
    const authRaw = localStorage.getItem("brillian-bri-tl-auth-v1=9.1.1");
    const auth = authRaw ? JSON.parse(authRaw) : null;
    sorting = sorting.length == 0 ? [{ id: "name", desc: false }] : sorting;
    filter = filter.length == 0 ? {} : { any: filter[0].value };

    const response = await GetData(`${API_URL}/user_role/list`, {
      limit: limit,
      page: page + 1,
      with_deleted: false,
      order_field: sorting[0].id,
      order_direction: sorting[0].desc == false ? "ASC" : "DESC",
      filter: JSON.stringify({ ...filter, application: "edc" }),
      token: auth?.access_token || "",
    });

    return {
      data: response?.data.list,
      totalCount: response?.data.total_count,
    };
  };

  const fetchMenus = useCallback(async () => {
    const authRaw = localStorage.getItem("brillian-bri-tl-auth-v1=9.1.1");
    const auth = authRaw ? JSON.parse(authRaw) : null;

    const params = {
      limit: 100,
      page: 1,
      with_deleted: false,
      order_field: "order_number",
      order_direction: "ASC",
      filter: '{"application":"edc"}',
      token: auth?.access_token || "",
    };
    const response = await GetData(`${API_URL_MD}/menu/list`, params);
    if (response?.status) {
      setMenus(() => [...response.data.list]);
    } else {
      setMenus(() => []);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  return (
    <ManagePositionContext.Provider
      value={{
        showEditDialog,
        handleEditDialog,
        selectedPosition,
        showAddDialog,
        handleAddDialog,
        menus,
        showDeleteDialog,
        handleDeleteDialog,
      }}
    >
      <Toaster expand visibleToasts={9} duration={3000} />

      <DataGridProvider
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<ListToolBar />}
        layout={{ card: true }}
        sorting={[{ id: "name", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          doGetListData(pageIndex, pageSize, sorting, columnFilters)
        }
      >
        {children}
      </DataGridProvider>
    </ManagePositionContext.Provider>
  );
};

export { ManagePositionContextProvider, ManagePositionContext };
export type { selectedPosition };

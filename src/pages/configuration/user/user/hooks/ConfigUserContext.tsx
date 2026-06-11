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
  handleEditDialog: (show: boolean, selected_user: string | null) => void;
  showAddDialog: boolean;
  handleAddDialog: (show: boolean) => void;
  showDeleteDialog: boolean;
  handleDeleteDialog: (show: boolean, selected_user: string | null) => void;
  selectedUser: string | null;
  roles: RoleListProps[];
}

interface SelectedUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  new_password: string;
  check_new_password: string;
}

interface RoleListProps {
  id: string;
  name: string;
  status: string;
}

const initialProps: ContextProps = {
  showEditDialog: false,
  handleEditDialog: () => {},
  showAddDialog: false,
  handleAddDialog: () => {},
  showDeleteDialog: false,
  handleDeleteDialog: () => {},
  selectedUser: null,
  roles: [],
};

const ConfigUserContext = createContext<ContextProps>(initialProps);

const API_URL = apiConfig.service_price_plan;

const ConfigUserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /* state */
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [roles, setRoles] = useState<RoleListProps[]>([]);
  const { GetData } = useCallApi();

  /* action */
  const handleEditDialog = useCallback(
    (show: boolean, selected_user: string | null) => {
      setSelectedUser(show ? selected_user : null);
      setShowEditDialog(show);
    },
    [],
  );

  const handleAddDialog = useCallback((show: boolean) => {
    setShowAddDialog(show);
  }, []);

  const handleDeleteDialog = useCallback(
    (show: boolean, selected_user: string | null) => {
      setSelectedUser(show ? selected_user : null);
      setShowDeleteDialog(show);
    },
    [],
  );

  /* Data Grid Options */
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.username,
        id: "username",
        header: ({ column }) => (
          <DataGridColumnHeader title="Username" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.email,
        id: "email",
        header: ({ column }) => (
          <DataGridColumnHeader title="Email" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-[350px]",
        },
      },
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Name" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-[350px]",
        },
      },
      {
        accessorFn: (row) => row.role_name,
        id: "role_name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Role Name" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: (data: any) => {
          const { roles } = data.row.original;

          let html = <p className="text-danger italic">Unassigned</p>;
          for (let _role of roles) {
            if (_role.application.id == "edc") {
              html = _role.name;
            }
          }
          return html;
        },
        meta: {
          headerClassName: "w-[350px]",
        },
      },
      // {
      //   accessorFn: (row) => row.status,
      //   id: 'status',
      //   header: ({ column }) => <DataGridColumnHeader title="Status" column={column} />,
      //   enableSorting: false,
      //   enableHiding: false,
      //   cell: ({ row }) => {
      //     return (
      //       <EnforceSwitch
      //         enforce={row.original.status == 'Y' ? true : false}
      //         onChange={() => {}}
      //       />
      //     );
      //   },
      //   meta: {
      //     headerClassName: 'w-[100px]',
      //     cellClassName: 'text-center'
      //   }
      // },
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
                onClick={() => handleEditDialog(true, row.id)}
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => handleDeleteDialog(true, row.id)}
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
    sorting = sorting.length == 0 ? [{ id: "username", desc: false }] : sorting;
    filter = filter.length == 0 ? {} : { any: filter[0].value };
    const response = await GetData(`${API_URL}/user/list`, {
      limit: limit,
      page: page + 1,
      with_deleted: true,
      order_field: sorting[0].id,
      order_direction: sorting[0].desc == false ? "ASC" : "DESC",
      filter: JSON.stringify(filter),
    });

    return {
      data: response?.data.list,
      totalCount: response?.data.total_count,
    };
  };

  const fetchRoles = useCallback(async () => {
    const params = {
      limit: 100,
      page: 1,
      with_deleted: false,
      order_field: "name",
      order_direction: "ASC",
      filter: JSON.stringify({
        status: "Y",
        application: "edc",
      }),
    };
    const response = await GetData(`${API_URL}/user_role/list`, params);
    if (response?.status) {
      setRoles(() => [...response.data.list]);
    } else {
      setRoles(() => []);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return (
    <ConfigUserContext.Provider
      value={{
        showEditDialog,
        handleEditDialog,
        selectedUser,
        showAddDialog,
        handleAddDialog,
        roles,
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
        sorting={[{ id: "username", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          doGetListData(pageIndex, pageSize, sorting, columnFilters)
        }
      >
        {children}
      </DataGridProvider>
    </ConfigUserContext.Provider>
  );
};

export { ConfigUserContextProvider, ConfigUserContext };
export type { SelectedUser };

import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { ColumnDef } from "@tanstack/react-table";
import { createContext, useMemo, useState } from "react";
import { toast } from "sonner";
import ListToolbar from "../blocks/ListToolbar";
import DialogForm from "../blocks/DialogForm";
import { BooleanBadge } from "@/components/common/BooleanBadge";
import { useConfirmDialog } from "@/providers/ConfirmDialogProvider";
import { endpoints } from "../../api/api.account.config";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface IDepositContextProps {
  depositList: IDepositList[];
  showDialog: { show: boolean; mode: "create" | "update" };
  handleShowDialog: (
    show: boolean,
    mode: "create" | "update",
    selected_deposit: IDepositList | null,
  ) => void;
  selectedDeposit: IDepositList | null;
  setSelectedDeposit: React.Dispatch<React.SetStateAction<IDepositList | null>>;
}

const initialContextProps: IDepositContextProps = {
  depositList: [],
  showDialog: { show: false, mode: "create" },
  handleShowDialog: () => {},
  selectedDeposit: null,
  setSelectedDeposit: () => {},
};

const DepositContext = createContext<IDepositContextProps>(initialContextProps);

const DepositProvider = ({ children }: { children: React.ReactNode }) => {
  const { GetData, DeleteData } = useCallApi();
  const { menuPrivAccess } = useAccountConfigLayout();
  const { confirm } = useConfirmDialog();

  const [depositList, setDepositList] = useState<
    IDepositContextProps["depositList"]
  >([]);
  const [showDialog, setShowDialog] = useState<
    IDepositContextProps["showDialog"]
  >({
    show: false,
    mode: "create",
  });
  const [selectedDeposit, setSelectedDeposit] =
    useState<IDepositContextProps["selectedDeposit"]>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const triggerReload = () => setReloadKey((prev) => prev + 1);

  const handleShowDialog = (
    show: boolean,
    mode: "create" | "update",
    selected_deposit: any | null,
  ) => {
    setShowDialog({ show, mode });
    setSelectedDeposit(show ? selected_deposit : null);
  };

  const doGetListDeposit = async (
    page: number,
    limit: number,
    sorting: any,
    filter: any,
  ) => {
    try {
      sorting =
        sorting.length == 0 ? [{ id: "depositTypeId", desc: false }] : sorting;
      filter =
        filter.length == 0
          ? {}
          : { depositTypeName: filter[0].value?.toLowerCase() };

      const response = await GetData(endpoints.depositType.list, {
        size: limit,
        page: page + 1,
        sortBy: sorting[0].id,
        sortDirection: sorting[0].desc == false ? "ASC" : "DESC",
        // order_field: "paymentMethodId",
        spId: 0,
      });

      if (response.status) {
        setDepositList(response.data);
      } else {
        setDepositList([]);
        toast.error(response.message);
      }

      return {
        data: response?.data || [],
        totalCount: response?.totalRows || 0,
      };
    } catch (error) {
      toast.error("Error Fetching Data. Please Check Your Connection!");

      return {
        data: [],
        totalCount: 0,
      };
    }
  };

  const DeleteDepositType = async (id: number): Promise<boolean> => {
    setIsDeleting(true);
    try {
      const response = await DeleteData(endpoints.depositType.delete(id), {});

      if (response?.status) {
        toast.success(response.message);
        return true;
      } else {
        toast.error(response?.message);
        return false;
      }
    } catch (error) {
      toast.error("Error Deleting Data. Please Check Your Connection!");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (id: number) => {
    confirm({
      title: "Delete Deposit Type",
      message:
        "Are you sure you want to delete this deposit type? This action cannot be undone.",
      onConfirm: async () => {
        const success = await DeleteDepositType(id);
        if (success) triggerReload();
      },
      isDeleting,
    });
  };

  const columns = useMemo<ColumnDef<IDepositList>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Deposit Name" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: "w-[150px]" },
        filterFn: (row, id, value) =>
          row
            .getValue<string>("name")
            .toLowerCase()
            .includes(value.toLowerCase()),
      },
      {
        accessorKey: "depositTypeCode",
        header: ({ column }) => (
          <DataGridColumnHeader title="Deposit Type Code" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        meta: { headerClassName: "w-[200px]" },
        filterFn: (row, id, value) => {
          const code = row.getValue<string>("depositTypeCode") ?? "";
          return code.toLowerCase().includes(value.toLowerCase());
        },
      },
      {
        accessorKey: "charge",
        header: ({ column }) => (
          <DataGridColumnHeader title="Charge" column={column} />
        ),
        enableSorting: true,
        meta: { headerClassName: "w-[100px]" },
        cell: ({ row }) => (
          <span className="text-sm font-medium text-gray-700">
            {row.getValue<number>("charge").toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "refundable",
        header: ({ column }) => (
          <DataGridColumnHeader title="Refundable" column={column} />
        ),
        cell: ({ row }) => <BooleanBadge value={row.getValue("refundable")} />,
        enableSorting: true,
        meta: {
          headerClassName: "w-[100px] text-center",
          cellClassName: "text-center",
        },
      },
      {
        accessorKey: "transCredit",
        header: ({ column }) => (
          <DataGridColumnHeader title="Transferable" column={column} />
        ),
        cell: ({ row }) => <BooleanBadge value={row.getValue("transCredit")} />,
        enableSorting: true,
        meta: {
          headerClassName: "w-[100px] text-center",
          cellClassName: "text-center",
        },
      },
      {
        accessorKey: "comments",
        header: ({ column }) => (
          <DataGridColumnHeader title="Remarks" column={column} />
        ),
        enableSorting: false,
        meta: { headerClassName: "w-[200px]" },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataGridColumnHeader title="Actions" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: (data) => {
          const row = data.row.original;
          return (
            <>
              <div className="flex justify-start">
                {/* <button
                  className={`btn btn-sm btn-icon btn-clear btn-light ${
                    row.paymentTypeName !== "Automatic payment"
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onClick={() => handleShowParameterDialog(true, "create", row)}
                  disabled={row.paymentTypeName !== "Automatic payment"}
                >
                  <i className="ki-duotone ki-setting-4"></i>
                </button> */}
                <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
                  <button
                    className="btn btn-sm btn-icon btn-clear btn-light"
                    onClick={() => {
                      setSelectedDeposit(row);
                      handleShowDialog(true, "update", row);
                    }}
                  >
                    <KeenIcon icon="notepad-edit" />
                  </button>
                </AccessWrapper>
                <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
                  <button
                    className="btn btn-sm btn-icon btn-clear btn-light"
                    onClick={() => {
                      setSelectedDeposit(row);
                      handleDelete(row.depositTypeId);
                    }}
                  >
                    <KeenIcon icon="trash" />
                  </button>
                </AccessWrapper>
              </div>
            </>
          );
        },
        meta: {
          headerClassName: "w-[100px] text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [handleShowDialog, setSelectedDeposit, handleDelete],
  );

  return (
    <DepositContext.Provider
      value={{
        depositList,
        showDialog,
        handleShowDialog,
        selectedDeposit,
        setSelectedDeposit,
      }}
    >
      <DataGridProvider
        key={reloadKey}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<ListToolbar />}
        layout={{ card: true }}
        sorting={[{ id: "depositTypeId", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          doGetListDeposit(pageIndex, pageSize, sorting, columnFilters)
        }
      >
        {children}
        <DialogForm />
      </DataGridProvider>
    </DepositContext.Provider>
  );
};

export { DepositProvider, DepositContext };

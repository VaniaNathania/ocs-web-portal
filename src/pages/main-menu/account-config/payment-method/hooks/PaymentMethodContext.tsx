import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { ColumnDef } from "@tanstack/react-table";
import React, { createContext, useMemo, useState } from "react";
import { toast } from "sonner";
import ListToolbar from "../blocks/ListToolbar";
import WarningDialog from "../blocks/WarningDialog";
import FormDialog from "../blocks/FormDialog";
import ParameterDialog from "../blocks/ParameterDialog";
import { endpoints } from "../../api/api.account.config";
import { useConfirmDialog } from "@/providers/ConfirmDialogProvider";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface ContextProps {
  paymentMethodList: PaymentMethod[];
  showDialog: { show: boolean; mode: "create" | "update" };
  handleShowDialog: (
    show: boolean,
    mode: "create" | "update",
    paymentMethod: PaymentMethod | null,
  ) => void;
  showParameterDialog: { show: boolean; mode: "create" | "update" };
  handleShowParameterDialog: (
    show: boolean,
    mode: "create" | "update",
    paymentMethod: PaymentMethod | null,
  ) => void;
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: (paymentMethod: PaymentMethod | null) => void;
  doGetListPaymentMethod: (
    page: number,
    limit: number,
    sorting: any,
    filter: any,
  ) => Promise<{
    data: PaymentMethod[];
    totalCount: number;
  }>;
}

const initialProps: ContextProps = {
  paymentMethodList: [],
  showDialog: { show: false, mode: "create" },
  handleShowDialog: () => {},
  showParameterDialog: { show: false, mode: "create" },
  handleShowParameterDialog: () => {},
  selectedPaymentMethod: null,
  setSelectedPaymentMethod: () => {},
  doGetListPaymentMethod: async () => ({
    data: [],
    totalCount: 0,
  }),
};

const PaymentMethodContext = createContext<ContextProps>(initialProps);

const PaymentMethodProvider = ({ children }: { children: React.ReactNode }) => {
  const { GetData, DeleteData } = useCallApi();
  const { menuPrivAccess } = useAccountConfigLayout();
  const { confirm } = useConfirmDialog();

  const [paymentMethodList, setPaymentMethodList] = useState<PaymentMethod[]>(
    [],
  );
  const [showDialog, setShowDialog] = useState<{
    show: boolean;
    mode: "create" | "update";
  }>({ show: false, mode: "create" });
  const [showParameterDialog, setShowParameterDialog] = useState<{
    show: boolean;
    mode: "create" | "update";
  }>({
    show: false,
    mode: "create",
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    show: boolean;
    id: number | null;
  }>({
    show: false,
    id: null,
  });

  const [showWarningPopUp, setShowWarningPopUp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const triggerReload = () => setReloadKey((prev) => prev + 1);

  const handleShowDialog = (
    show: boolean,
    mode: "create" | "update",
    paymentMethod: PaymentMethod | null,
  ) => {
    setShowDialog({ show, mode });
    setSelectedPaymentMethod(show ? paymentMethod : null);
  };

  const handleShowParameterDialog = (
    show: boolean,
    mode: "create" | "update",
    paymentMethod: PaymentMethod | null,
  ) => {
    setShowParameterDialog({ show, mode });
    setSelectedPaymentMethod(show ? paymentMethod : null);
  };

  const doGetListPaymentMethod = async (
    page: number,
    limit: number,
    sorting: any,
    filter: any,
  ): Promise<{ data: PaymentMethod[]; totalCount: number }> => {
    try {
      sorting =
        sorting.length == 0 ? [{ id: "acctItemTypeId", desc: false }] : sorting;
      filter =
        filter.length == 0
          ? {}
          : { acctItemTypeName: filter[0].value?.toLowerCase() };

      const response = await GetData(endpoints.paymentMethod.list, {
        size: limit,
        page: page + 1,
        sortBy: sorting[0].id,
        order_direction: sorting[0].desc == false ? "ASC" : "DESC",
        order_field: "paymentMethodId",
      });

      if (response.status) {
        setPaymentMethodList(response.data);
      } else {
        setPaymentMethodList([]);
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

  const DeletePaymentMethod = async (id: number): Promise<boolean> => {
    setIsDeleting(true);
    try {
      const response = await DeleteData(
        endpoints.paymentMethod.deletePaymentMethod(id),
        {},
      );

      if (response?.message) {
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
      title: "Delete Payment Method",
      message:
        "Are you sure you want to delete this payment method? This action cannot be undone.",
      onConfirm: async () => {
        const success = await DeletePaymentMethod(id);
        if (success) triggerReload();
      },
      isDeleting,
    });
  };

  const columns = useMemo<ColumnDef<PaymentMethod>[]>(
    () => [
      {
        accessorKey: "paymentMethodName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Payment Method Name" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-[100px]",
        },
        filterFn: (row, id, value) => {
          return row.original.paymentMethodName
            .toLowerCase()
            .includes(value.toLowerCase());
        },
      },
      {
        accessorKey: "paymentTypeName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Payment Type" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        meta: {
          headerClassName: "w-[250px]",
        },
        filterFn: (row, id, value) => {
          return row.original.paymentTypeName
            .toLowerCase()
            .includes(value.toLowerCase());
        },
      },
      {
        accessorKey: "comments",
        header: ({ column }) => (
          <DataGridColumnHeader title="Remarks" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-[250px]",
        },
      },
      {
        accessorKey: "systemReserved",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status Reserved" column={column} />
        ),
        cell: ({ row }) => {
          const isActive = row.original.systemReserved === "Y";

          return (
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                isActive
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {isActive ? "Yes" : "No"}
            </span>
          );
        },
        enableSorting: true,
        enableHiding: false,
        meta: {
          headerClassName: "w-[100px] text-center",
          cellClassName: "text-center",
        },
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
                <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
                  <button
                    className={`btn btn-sm btn-icon btn-clear btn-light ${
                      row.paymentTypeName !== "Automatic payment"
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={() =>
                      handleShowParameterDialog(true, "create", row)
                    }
                    disabled={row.paymentTypeName !== "Automatic payment"}
                  >
                    <i className="ki-duotone ki-setting-4"></i>
                  </button>
                </AccessWrapper>

                <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
                  <button
                    className="btn btn-sm btn-icon btn-clear btn-light"
                    onClick={() => {
                      setSelectedPaymentMethod(row);
                      row.systemReserved === "Y"
                        ? setShowWarningPopUp(true)
                        : handleShowDialog(true, "update", row);
                    }}
                  >
                    <KeenIcon icon="notepad-edit" />
                  </button>
                </AccessWrapper>

                <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
                  <button
                    className="btn btn-sm btn-icon btn-clear btn-light"
                    onClick={() => {
                      setSelectedPaymentMethod(row);
                      row.systemReserved === "Y"
                        ? setShowWarningPopUp(true)
                        : handleDelete(row.paymentMethodId);
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
    [
      handleShowDialog,
      handleDelete,
      handleShowParameterDialog,
      setSelectedPaymentMethod,
      setShowWarningPopUp,
    ],
  );

  return (
    <PaymentMethodContext.Provider
      value={{
        paymentMethodList,
        showDialog,
        handleShowDialog,
        showParameterDialog,
        handleShowParameterDialog,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        doGetListPaymentMethod,
      }}
    >
      <DataGridProvider
        key={reloadKey}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<ListToolbar />}
        layout={{ card: true }}
        sorting={[{ id: "acctItemTypeId", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          doGetListPaymentMethod(pageIndex, pageSize, sorting, columnFilters)
        }
      >
        {children}
        <FormDialog />
        <ParameterDialog />
        {showWarningPopUp && selectedPaymentMethod?.systemReserved === "Y" && (
          <WarningDialog
            open={showWarningPopUp}
            onOpenChange={() => setShowWarningPopUp(false)}
          />
        )}
      </DataGridProvider>
    </PaymentMethodContext.Provider>
  );
};

export { PaymentMethodProvider, PaymentMethodContext };

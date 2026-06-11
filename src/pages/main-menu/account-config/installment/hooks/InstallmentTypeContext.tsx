import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { BooleanBadge } from "@/components/common/BooleanBadge";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useConfirmDialog } from "@/providers/ConfirmDialogProvider";
import { ColumnDef } from "@tanstack/react-table";
import { createContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ListToolbar from "../blocks/ListToolbar";
import DialogForm from "../blocks/DialogForm";
import { AcctConfService } from "@/common/api/account-config/endpoints";
import { endpoints } from "../../api/api.account.config";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface IInstallmentContextProps {
  installmentTypeList: IInstallmentTypeList[];
  showDialog: { show: boolean; mode: "create" | "update" };
  handleShowDialog: (
    show: boolean,
    mode: "create" | "update",
    installmentType: any | null,
  ) => void;
  selectedInstallmentType: IInstallmentTypeList | null;
  setSelectedInstallmentType: React.Dispatch<
    React.SetStateAction<IInstallmentTypeList | null>
  >;
  acctItemTypeList: IAcctItemType[];
}

const initialContextProps: IInstallmentContextProps = {
  installmentTypeList: [],
  showDialog: { show: false, mode: "create" },
  handleShowDialog: () => {},
  selectedInstallmentType: null,
  setSelectedInstallmentType: () => {},
  acctItemTypeList: [],
};

const InstallmentTypeContext =
  createContext<IInstallmentContextProps>(initialContextProps);

const InstallmentTypeContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { GetData, DeleteData } = useCallApi();
  const { confirm } = useConfirmDialog();
  const { menuPrivAccess } = useAccountConfigLayout();
  const { GET_ACCT_ITEM_TYPE } = AcctConfService();

  const [installmentTypeList, setInstallmentTypeList] = useState<
    IInstallmentContextProps["installmentTypeList"]
  >([]);
  const [acctItemTypeList, setAcctItemTypeList] = useState<
    IInstallmentContextProps["acctItemTypeList"]
  >([]);
  const [showDialog, setShowDialog] = useState<
    IInstallmentContextProps["showDialog"]
  >({
    show: false,
    mode: "create",
  });
  const [selectedInstallmentType, setSelectedInstallmentType] =
    useState<IInstallmentContextProps["selectedInstallmentType"]>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const triggerReload = () => setReloadKey((prev) => prev + 1);

  const handleShowDialog = (
    show: boolean,
    mode: "create" | "update",
    installmentType: any | null,
  ) => {
    setShowDialog({ show, mode });
    setSelectedInstallmentType(show ? installmentType : null);
  };

  const fetchAcctItemType = async () => {
    try {
      const response = await GET_ACCT_ITEM_TYPE({
        page: 1,
        size: 200,
        sortBy: "BAL_TYPE",
        sortDirection: "ASC",
        search: "string",
        spId: 0,
      });

      if (response.status) {
        setAcctItemTypeList(response?.data || []);
      } else {
        toast.error(response.message);
        setAcctItemTypeList([]);
      }
    } catch (error) {
      toast.error("Error Fetching Account Item. Please Check Your Connection!");
    }
  };

  const doGetListInstallment = async (
    page: number,
    limit: number,
    sorting: any,
    filter: any,
  ) => {
    try {
      sorting =
        sorting.length == 0 ? [{ id: "acctItemTypeId", desc: false }] : sorting;
      filter =
        filter.length == 0
          ? {}
          : { acctItemTypeName: filter[0].value?.toLowerCase() };

      const response = await GetData(endpoints.installmentType.list, {
        spId: 0,
        size: limit,
        page: page + 1,
        // sortBy: sorting[0].id,
        order_field: "instalment_type_id",
        order_direction: sorting[0].desc == false ? "ASC" : "DESC",
      });

      if (response.status) {
        setInstallmentTypeList(response.data);
      } else {
        setInstallmentTypeList([]);
        toast.error(response.message);
      }

      return {
        data: response?.data || [],
        totalCount: response?.totalRows || 0,
      };
    } catch (error) {
      toast.error(
        "Error Fetching Installment Data. Please Check Your Connection!",
      );

      return {
        data: [],
        totalCount: 0,
      };
    }
  };

  const DeleteInstallment = async (id: number): Promise<boolean> => {
    setIsDeleting(true);
    try {
      const response = await DeleteData(
        endpoints.installmentType.delete(id),
        {},
      );

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
      title: "Delete Installment Type",
      message:
        "Are you sure you want to delete this installment type? This action cannot be undone.",
      onConfirm: async () => {
        const success = await DeleteInstallment(id);
        if (success) triggerReload();
      },
      isDeleting,
    });
  };

  const columns = useMemo<ColumnDef<IInstallmentTypeList>[]>(
    () => [
      {
        accessorKey: "instalmentTypeName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Payment Plan Name" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: "w-[150px]" },
        filterFn: (row, id, value) =>
          row
            .getValue<string>("instalmentTypeName")
            .toLowerCase()
            .includes(value.toLowerCase()),
      },
      {
        accessorKey: "firstPay",
        header: ({ column }) => (
          <DataGridColumnHeader title="Cash Payment" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: "w-[200px]" },
        filterFn: (row, id, value) => {
          const code = row.getValue<string>("firstPay") ?? "";
          return code.toLowerCase().includes(value.toLowerCase());
        },
      },
      {
        accessorKey: "repeatTimes",
        header: ({ column }) => (
          <DataGridColumnHeader title="Total Phases" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: "w-[100px]" },
        cell: ({ row }) => (
          <span className="text-sm font-medium text-gray-700">
            {row.getValue<number>("repeatTimes")}
          </span>
        ),
      },
      {
        accessorKey: "feePercent",
        header: ({ column }) => (
          <DataGridColumnHeader title="Fee Percent" column={column} />
        ),
        cell: ({ row }) => <BooleanBadge value={row.getValue("feePercent")} />,
        enableSorting: false,
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
                      setSelectedInstallmentType(row);
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
                      setSelectedInstallmentType(row);
                      handleDelete(row.instalmentTypeId);
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
    [handleShowDialog, setSelectedInstallmentType, handleDelete],
  );

  useEffect(() => {
    fetchAcctItemType();
  }, []);

  return (
    <InstallmentTypeContext.Provider
      value={{
        installmentTypeList,
        showDialog,
        handleShowDialog,
        selectedInstallmentType,
        setSelectedInstallmentType,
        acctItemTypeList,
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
          doGetListInstallment(pageIndex, pageSize, sorting, columnFilters)
        }
      >
        {children}
        <DialogForm />
      </DataGridProvider>
    </InstallmentTypeContext.Provider>
  );
};

export { InstallmentTypeContext, InstallmentTypeContextProvider };

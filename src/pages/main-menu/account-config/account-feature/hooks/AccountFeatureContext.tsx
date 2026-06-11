import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { BooleanBadge } from "@/components/common/BooleanBadge";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useConfirmDialog } from "@/providers/ConfirmDialogProvider";
import { ColumnDef } from "@tanstack/react-table";
import { createContext, useMemo, useState } from "react";
import { toast } from "sonner";
import ListToolbar from "../blocks/ListToolbar";
import DialogForm from "../blocks/DialogForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { endpoints } from "../../api/api.account.config";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface IAccountFeatureContext {
  accountFeatureList: IAccountFeatureList[];
  showDialog: { show: boolean; mode: "create" | "update" };
  handleShowDialog: (
    show: boolean,
    mode: "create" | "update",
    selected_accountFeature: IAccountFeatureList | null,
  ) => void;
  selectedAccountFeature: IAccountFeatureList | null;
  setSelectedAccountFeature: React.Dispatch<
    React.SetStateAction<IAccountFeatureList | null>
  >;
}

const initialContextProps: IAccountFeatureContext = {
  accountFeatureList: [],
  showDialog: { show: false, mode: "create" },
  handleShowDialog: () => {},
  selectedAccountFeature: null,
  setSelectedAccountFeature: () => {},
};

const AccountFeatureContext =
  createContext<IAccountFeatureContext>(initialContextProps);

const AccountFeatureProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { menuPrivAccess } = useAccountConfigLayout();
  const { GetData, DeleteData, PutData } = useCallApi();
  const { confirm } = useConfirmDialog();

  const [accountFeatureList, setAccountFeatureList] = useState<
    IAccountFeatureContext["accountFeatureList"]
  >(initialContextProps.accountFeatureList);
  const [showDialog, setShowDialog] = useState<
    IAccountFeatureContext["showDialog"]
  >(initialContextProps.showDialog);
  const [selectedAccountFeature, setSelectedAccountFeature] = useState<
    IAccountFeatureContext["selectedAccountFeature"]
  >(initialContextProps.selectedAccountFeature);

  const [isDeleting, setIsDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [newDefaultValue, setNewDefaultValue] = useState<string | null>(null);

  const triggerReload = () => setReloadKey((prev) => prev + 1);

  const handleShowDialog = (
    show: boolean,
    mode: "create" | "update",
    selected_accountFeature: IAccountFeatureList | null,
  ) => {
    setShowDialog({ show, mode });
    setSelectedAccountFeature(show ? selected_accountFeature : null);
  };

  const DoGetListAccountFeature = async (
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

      const response = await GetData(endpoints.accountFeature.list, {
        // size: limit,
        // page: page + 1,
        // sortBy: sorting[0].id,
        // order_direction: sorting[0].desc == false ? "ASC" : "DESC",
        // order_field: "paymentMethodId",
        spId: 0,
      });

      if (response.status) {
        setAccountFeatureList(response.data);
      } else {
        setAccountFeatureList([]);
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

  const DeleteAccountFeature = async (id: number): Promise<boolean> => {
    setIsDeleting(true);
    try {
      const response = await DeleteData(
        endpoints.accountFeature.delete(id),
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
      title: "Delete Account Feature",
      message:
        "Are you sure you want to delete this account feature? This action cannot be undone.",
      onConfirm: async () => {
        const success = await DeleteAccountFeature(id);
        if (success) triggerReload();
      },
      isDeleting,
    });
  };

  const handleEditClick = (feature: IAccountFeatureList) => {
    setEditingRowId(Number(feature.attrId));
    setNewDefaultValue(
      feature.attrValue !== null ? feature.attrValue.toString() : "",
    );
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setNewDefaultValue(null);
  };

  const handleDispOrderChange = async (
    feature: IAccountFeatureList,
    direction: "up" | "down",
  ) => {
    const currentList = accountFeatureList;
    const currentIndex = currentList.findIndex(
      (f) => f.attrId === feature.attrId,
    );

    if (currentIndex === -1) return;

    // tentukan target index berdasarkan arah
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // target selalu berada di antara 0 dan panjang list
    if (targetIndex < 0 || targetIndex >= currentList.length) {
      toast.warning("Cannot move further");
      return;
    }

    const targetFeature = currentList[targetIndex];

    try {
      const response = await PutData(endpoints.accountFeature.updateDispOrder, {
        attrId: feature.attrId,
        dispOrder: feature.dispOrder,
        toAttrId: targetFeature.attrId,
        toDispOrder: targetFeature.dispOrder,
      });

      if (response?.status) {
        toast.success("Display order updated");
        triggerReload();
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Failed to update display order");
    }
  };

  const handleSaveEdit = async (feature: IAccountFeatureList) => {
    try {
      await PutData(endpoints.accountFeature.updateAttrValue(feature.attrId), {
        attrId: feature.attrId,
        attrValue: newDefaultValue,
        dispOrder: feature.dispOrder,
        spId: 0,
      });

      toast.success("Default value updated successfully");
      setEditingRowId(null);
      triggerReload();
    } catch (error) {
      toast.error("Failed to update default value");
    }
  };

  const columns = useMemo<ColumnDef<IAccountFeatureList>[]>(
    () => [
      {
        accessorKey: "attrName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Feature Name" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: "w-[150px]" },
        filterFn: (row, id, value) =>
          row
            .getValue<string>("attrName")
            .toLowerCase()
            .includes(value.toLowerCase()),
      },
      {
        accessorKey: "attrCode",
        header: ({ column }) => (
          <DataGridColumnHeader title="Code" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        meta: { headerClassName: "w-[200px]" },
        filterFn: (row, id, value) => {
          const code = row.getValue<string>("attrCode") ?? "";
          return code.toLowerCase().includes(value.toLowerCase());
        },
      },
      {
        accessorKey: "attrValue",
        header: ({ column }) => (
          <DataGridColumnHeader title="Default Value" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const feature = row.original;

          const attrId = Number(feature.attrId);

          // Show select
          if (editingRowId === attrId) {
            return (
              <Select
                value={newDefaultValue ?? ""}
                onValueChange={(val) =>
                  setNewDefaultValue(val === "" || val === "null" ? null : val)
                }
              >
                <SelectTrigger className="border rounded px-2 py-1">
                  <SelectValue placeholder="Select default value" />
                </SelectTrigger>

                <SelectContent>
                  {feature.acctValuesListDto &&
                  feature.acctValuesListDto.length > 0 ? (
                    feature.acctValuesListDto.map((item) => (
                      <SelectItem
                        key={item.attrValueId}
                        value={item.valueMark || ""}
                      >
                        {item.valueMark} ({item.value})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="null" disabled>
                      No option available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            );
          }
          const matched = feature.acctValuesListDto?.find(
            (item) =>
              String(item?.value ?? "") === String(feature?.attrValue ?? ""),
          );

          return matched
            ? `${matched.valueMark} (${matched.value})`
            : feature.attrValue;
        },
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
        cell: ({ row }) => {
          const feature = row.original;
          const index = accountFeatureList.findIndex(
            (p) => p.attrId === feature.attrId,
          );

          if (editingRowId === feature.attrId) {
            return (
              <div className="flex gap-2 justify-center">
                <button
                  className="btn btn-sm text-white bg-red-500 hover:bg-red-600"
                  onClick={() => handleSaveEdit(feature)}
                >
                  Save
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-center gap-2">
              <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => handleDispOrderChange(feature, "up")}
                  className="h-8 w-8 p-0 hover:bg-slate-100 disabled:opacity-50"
                >
                  <FaArrowUp />
                </Button>
              </AccessWrapper>

              <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={index === accountFeatureList.length - 1}
                  onClick={() => handleDispOrderChange(feature, "down")}
                  className="h-8 w-8 p-0 hover:bg-slate-100 disabled:opacity-50"
                >
                  <FaArrowDown />
                </Button>
              </AccessWrapper>

              <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  onClick={() => {
                    handleEditClick(row.original);
                  }}
                  // title="Edit"
                >
                  <KeenIcon icon="notepad-edit" />
                </button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  onClick={() => handleDelete(feature.attrId)}
                  // title="Delete"
                >
                  <KeenIcon icon="trash" />
                </button>
              </AccessWrapper>
            </div>
          );
        },
        meta: {
          headerClassName: "w-[100px] text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [handleShowDialog, setSelectedAccountFeature, handleDelete],
  );

  return (
    <AccountFeatureContext.Provider
      value={{
        accountFeatureList,
        showDialog,
        handleShowDialog,
        selectedAccountFeature,
        setSelectedAccountFeature,
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
          DoGetListAccountFeature(pageIndex, pageSize, sorting, columnFilters)
        }
      >
        {children}
        <DialogForm />
      </DataGridProvider>
    </AccountFeatureContext.Provider>
  );
};

export { AccountFeatureProvider, AccountFeatureContext };

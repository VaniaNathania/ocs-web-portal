import { useConfirmDialog } from "@/providers/ConfirmDialogProvider";
import { useAccmTypeStore } from "../stores/accmType.store";
import { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { useAccumulationApi } from "../api/useAccumulationApi";
import DialogForm from "../blocks/DialogForm";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ListToolbar from "../blocks/ListToolbar";
import { toast, Toaster } from "sonner";
import { ROUND_WAY_MAP } from "./types";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const AccmTypeModule = ({ children }: { children: React.ReactNode }) => {
  const {
    openDialog,
    closeDialog,
    reloadKey,
    triggerReload,
    setSearchDatas,
    searchValue,
    searchDatas,
    menuPrivAccess,
  } = useAccmTypeStore();
  const { confirm } = useConfirmDialog();
  const { getAccumulationTypeList, deleteAccumulationType } =
    useAccumulationApi();
  // const [total, setTotal] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [gridParams, setGridParams] = useState({
    page: 1,
    size: 10,
    search: "",
    sortBy: "depositTypeId",
    sortDirection: "asc" as const,
    spId: 0,
  });

  const fetchSearchDatas = async () => {
    try {
      const response = await getAccumulationTypeList({
        page: 1,
        size: 1000,
        sortBy: "resourceId",
        sortDirection: "ASC",
        spId: 0,
        isAcctResNull: "Y",
      });
      if (response?.data) {
        setSearchDatas(response.data);
        // setTotal(response.totalCount);
      }

      return response;
    } catch (error) {
      toast.error("Error Loading Search Data");
    }
  };

  useEffect(() => {
    fetchSearchDatas();
  }, [reloadKey]);

  // const fetchTotalData = async () => {
  //   try {
  //     const response = await getAccumulationTypeList({
  //       page: 1,
  //       size: total,
  //       sortBy: "resourceId",
  //       sortDirection: "ASC",
  //       spId: 0,
  //       isAcctResNull: "Y",
  //     });
  //     if (response?.data) {
  //       setSearchDatas(response.data);
  //     }

  //     return response;
  //   } catch (error) {
  //     toast.error("Error Loading Search Data");
  //   }
  // };

  // useEffect(() => {
  //   fetchTotalData();
  // },[total]);

  const filterSearchDatas = searchDatas.filter(
    (item) => {
      if (!searchValue) return true;

      const lowSearch = searchValue.toLowerCase();
      const resourceIdSearch = item.resourceId
        ?.toString()
        .toLowerCase()
        .includes(lowSearch);
      const resourceNameSearch = item.resourceName
        ?.toLowerCase()
        .includes(lowSearch);

      return resourceIdSearch || resourceNameSearch;
    },
    [searchDatas, searchValue],
  );

  const handleDelete = (id: number) => {
    confirm({
      title: "Delete Accumulation Type",
      message:
        "Are you sure you want to delete this accumulation type? This action cannot be undone.",
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const success = await deleteAccumulationType(id);
          if (success?.status) triggerReload();
        } catch (error) {
          toast.error("Error Deleting Data. Please Check Your Connection!");
        } finally {
          setIsDeleting(false);
        }
      },
      isDeleting,
    });
  };

  const columns: ColumnDef<IAccmTypeList>[] = [
    {
      accessorKey: "resourceName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Accumulation Type Name" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "acmTypeName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Accumulation Mode" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "mask",
      header: ({ column }) => (
        <DataGridColumnHeader title="Accumulation Mask" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "unitTypeName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Unit Type" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "unitPrecision",
      header: ({ column }) => (
        <DataGridColumnHeader title="Unit Precision" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "roundWay",
      header: ({ column }) => (
        <DataGridColumnHeader title="Round Way" column={column} />
      ),
      cell: ({ row }) => {
        const item = row.original.roundWay;
        if (item) return ROUND_WAY_MAP[item] || "";
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "precision",
      header: ({ column }) => (
        <DataGridColumnHeader title="Precision" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataGridColumnHeader title="Actions" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex gap-2">
            <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => openDialog("update", item)}
              >
                <KeenIcon icon="notepad-edit" />
              </button>
            </AccessWrapper>
            <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  if (item.resourceId) handleDelete(item.resourceId);
                }}
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
  ];

  return (
    <DataGridProvider
      key={reloadKey}
      columns={columns}
      pagination={{ size: 10 }}
      toolbar={<ListToolbar />}
      layout={{ card: true }}
      sorting={[{ id: "resourceId", desc: false }]}
      serverSide={false}
      data={filterSearchDatas}
      // onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
      //   getAccumulationTypeList({
      //     page: pageIndex + 1,
      //     size: pageSize,
      //     sortBy: sorting?.[0].id,
      //     sortDirection: sorting?.[0].desc ? "DESC" : "ASC",
      //     spId: 0,
      //     isAcctResNull: "Y",
      //   })
      // }
    >
      {children}
      <DialogForm />
    </DataGridProvider>
  );
};

export default AccmTypeModule;

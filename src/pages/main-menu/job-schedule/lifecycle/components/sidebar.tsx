import { DataGridProvider, DataGridTable, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLifeCycle } from "../hooks/context";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LifeCycleList } from "../interface";
import { ColumnDef } from "@tanstack/react-table";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { DataGridSimplePagination } from "@/components/data-grid/DataGridSimplePagination";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { toast } from "sonner";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

export interface QueryLC {
  search: string;
  page: number;
  size: number;
  sortBy: string;
  sortDirection: string;
  lifeCycleTypeName: string;
  spId: number;
}

const initQuery = {
  search: "",
  page: 1,
  size: 10,
  sortBy: "LIFECYCLE_TYPE",
  sortDirection: "asc",
  lifeCycleTypeName: "",
  spId: 0,
};

const API_URL = apiConfigRef.ref;

const SideBar = () => {
  const {
    selectedLifeCycle,
    setSelectedLifeCycle,
    setAddDialog,
    isLoading,
    setIsLoading,
    setShowConfirm,
    setOnConfirm,
    setDesc,
    refreshSidebar,
    setRefreshSidebar,
    menuPrivAccess,
  } = useLifeCycle();
  const { GetData, PutData, DeleteData } = useCallApi();
  const [query, SetQuery] = useState<QueryLC>(initQuery);
  const [search, setSearch] = useState<string>("");
  // const [refreshSidebar, setRefreshSidebar] = useState<number>(0);
  const [lifeCycles, setLifeCycles] = useState<LifeCycleList[]>([]);
  const [editVal, setEditVal] = useState<string>("");
  const [editType, setEditType] = useState<number>();
  const [toEdit, setToEdit] = useState<LifeCycleList>();

  // const fetchLifeCycleList = async () => {
  //   try {
  //     const resp = [];

  //     setSelectedLifeCycle(resp[0]);

  //     setLifeCycles(resp);
  //   } catch (error) {}
  // };

  // useEffect(() => {
  //   setEditVal()
  // }, [editType]);

  const handleEdit = (item: LifeCycleList) => {
    // setToEdit(item);
    setShowConfirm(true);
    setOnConfirm(() => () => onEdit(item));
    setDesc(`Are you sure to edit life cycle ${item.lifeCycleType}`);
  };

  const onEdit = async (item: LifeCycleList) => {
    setIsLoading(true);
    try {
      //  console.log(item);
      const resp = await PutData(
        `${API_URL}/api/lifecycle-type/mod-lifecycle-type`,
        {
          // ...item,
          comments: null,
          lifeCycleType: item.lifeCycleType,
          spId: 0,
          lifecycleTypeName: item?.lifeCycleTypeName,
          extAttr: undefined,
        },
      );
      if (resp?.status) {
        toast.success(resp.message);
        return;
      }
      setRefreshSidebar((prev) => prev + 1);

      return toast.error(resp?.message);
    } catch (error) {
      return toast.error(
        "Failed to edit data, connection problem with the server",
      );
    } finally {
      setEditType(undefined);
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const handleDelete = (item: LifeCycleList) => {
    // setToDelete(item);
    setShowConfirm(true);
    setOnConfirm(() => () => onDelete(item));
    setDesc(`Are you sure to Delete life cycle ${item.lifeCycleType}`);
  };

  const onDelete = async (item: LifeCycleList) => {
    setIsLoading(true);
    try {
      //  console.log(item);
      const resp = await DeleteData(
        `${API_URL}/api/lifecycle-type/del-lifecycle-type/${item.lifeCycleType}`,
        {},
      );
      if (resp?.status) {
        toast.success(resp.message);
        return setRefreshSidebar((prev) => prev + 1);
      }
      return toast.error(resp?.message);
    } catch (error) {
      return toast.error(
        "Failed to Delete data, connection problem with the server",
      );
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const columns = useMemo<ColumnDef<LifeCycleList>[]>(
    () => [
      {
        accessorFn: (row) => row.lifeCycleTypeName,
        id: "LIFECYCLE_TYPE_NAME",
        enableSorting: true,
        enableHiding: false,
        cell({ row }) {
          if (editType === row.original.lifeCycleType) {
            return (
              <Input
                size={"sm"}
                defaultValue={row.original.lifeCycleTypeName}
                onChange={(e) =>
                  (row.original.lifeCycleTypeName = e.target.value)
                }
              />
            );
          }
          return (
            <div className="truncate" title={row.original.lifeCycleTypeName}>
              {row.original.lifeCycleTypeName}
            </div>
          );
        },
        meta: {
          headerClassName: "hidden h-0",
          cellClassName: "max-w-[200px]",
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          if (editType === row.original.lifeCycleType) {
            return (
              <div className="flex flex-row gap-1 items-center">
                <Button
                  className="w-5 h-5 p-0"
                  variant={"ghost"}
                  onClick={() => {
                    // console.log(row.original.lifeCycleTypeName);
                    handleEdit(row.original);
                  }}
                >
                  <KeenIcon icon="check" />
                </Button>
                <Button
                  className="w-5 h-5 p-0"
                  variant={"ghost"}
                  onClick={() => {
                    setEditType(undefined);
                    row.original.lifeCycleTypeName = editVal;
                  }}
                >
                  <KeenIcon icon="cross" />
                </Button>
              </div>
            );
          }
          return (
            <div className="flex flex-row gap-1 items-center">
              <AccessWrapper hasAccess={menuPrivAccess.editStatus ?? false}>
                <Button
                  className="w-5 h-5 p-0"
                  variant={"ghost"}
                  onClick={() => {
                    setEditVal(row.original.lifeCycleTypeName);
                    setEditType(row.original.lifeCycleType);
                  }}
                >
                  <KeenIcon icon="notepad-edit" />
                </Button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess.deleteStatus ?? false}>
                <Button
                  className="w-5 h-5 p-0"
                  variant={"ghost"}
                  onClick={() => handleDelete(row.original)}
                >
                  <KeenIcon icon="trash" />
                </Button>
              </AccessWrapper>
            </div>
          );
        },
      },
    ],
    [editType],
  );

  const doGetList = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      setIsLoading(true);
      try {
        const endpoint = `${API_URL}/api/lifecycle-type/qry-lifecycle-type`;

        const response = await GetData(endpoint, {
          ...query,
          page: page + 1,
          size: limit,
          lifeCycleTypeName: search,
        });

        SetQuery((prev) => ({ ...prev, page: page + 1, size: limit }));

        setSelectedLifeCycle(response.data[0]);

        return {
          data: response?.data || [],
          totalCount: response?.totalRows || 0,
        };
      } catch (error) {
        // console.error("Error fetching priority list:", error);
        return { data: [], totalCount: 0 };
      } finally {
        setIsLoading(false);
      }
    },
    [GetData, search, refreshSidebar],
  );

  useEffect(() => {
    setRefreshSidebar((prev) => prev + 1);
  }, [search]);

  return (
    <div className="flex flex-col gap-2 p-2 h-full w-full">
      <div className="flex flex-row gap-2 items-center ">
        <div className="flex-1 font-semibold">Life Cyle Type</div>
        <div className="flex flex-row gap-1 items-center">
          <AccessWrapper hasAccess={menuPrivAccess.addStatus ?? false}>
            <Button
              variant={"outline"}
              onClick={() => setAddDialog(true)}
              className="w-5 h-5 p-3"
            >
              <KeenIcon icon="plus" />
            </Button>
          </AccessWrapper>
          <Button
            variant={"outline"}
            className="w-5 h-5 p-3"
            onClick={() => {
              if (!search) setRefreshSidebar((prev) => prev + 1);
              setSearch("");
            }}
          >
            <KeenIcon icon="arrows-circle" />
          </Button>
        </div>
      </div>
      <div className="input input-sm">
        <Input
          placeholder="Life Cycle Type Name"
          className="border-none"
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <KeenIcon icon="magnifier" />
      </div>

      <DataGridProvider
        key={`${refreshSidebar}`}
        columns={columns}
        pagination={{ size: 10 }}
        layout={{ card: true, cellBorder: false }}
        sorting={[{ id: "LIFECYCLE_TYPE_NAME", desc: false }]}
        serverSide={true}
        data={lifeCycles}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          doGetList(pageIndex, pageSize, sorting, columnFilters)
        }
        getRowProps={(row) => ({
          className:
            row.original.lifeCycleType === selectedLifeCycle?.lifeCycleType
              ? selectedRowHighLight
              : nonSelectedRowHighLight,
          onClick: () => setSelectedLifeCycle(row.original),
          // ADD THIS REF CALLBACK:
        })}
      >
        <div className="flex-1 overflow-hidden overflow-y-auto w-full relative">
          {isLoading && <Loading />}
          <DataGridTable show={false} />
        </div>
        <DataGridSimplePagination />
      </DataGridProvider>

      {/* <div className="flex-1 overflow-hidden overflow-y-auto">
        {lifeCycles.map((item, index) => {
          return (
            <DefaultTooltip
              title={item.lifecycleTypeName}
              placement="top"
              key={index}
            >
              <div className="flex flex-row relative">
                <div
                  className={`p-1 text-sm truncate flex-1 before:rounded-r-md before:bg-primary
                    before:content-[''] before:absolute before:left-0 before:top-0 
                    before:h-full transition-all duration-300 cursor-pointer
                     ${
                       selectedLifeCycle?.lifecycleType === item.lifecycleType
                         ? "before:w-[5px] pl-2 font-semibold"
                         : "before:w-0 pl-0 font-normal"
                     }`}
                  onClick={() => setSelectedLifeCycle(item)}
                >
                  {item.lifecycleTypeName}
                </div>
                <div className="flex flex-row gap-1 items-center">
                  <Button className="w-5 h-5 p-0" variant={"ghost"}>
                    <KeenIcon icon="notepad-edit" />
                  </Button>
                  <Button className="w-5 h-5 p-0" variant={"ghost"}>
                    <KeenIcon icon="trash" />
                  </Button>
                </div>
              </div>
            </DefaultTooltip>
          );
        })}
      </div>
      <div className="flex flex-row">
        <div className="w-10">
          <Select
            value={query.size.toString()}
            onValueChange={(val) =>
              SetQuery((prev) => ({ ...prev, size: Number(val) }))
            }
          >
            <SelectTrigger className="p-1.25">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <KeenIcon icon="left" />
        </div>
      </div> */}
    </div>
  );
};

export default SideBar;

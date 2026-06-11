import { useEffect, useMemo, useState } from "react";
import { DialogWrapper } from "../../../role-management/generalUseComp";
import { useWholesaleMonitor } from "../../hooks/context";
import { BatchDetailList } from "../../models/interfaces";
import { ColumnDef } from "@tanstack/react-table";
import {
  DataGridColumnHeader,
  DataGridPagination,
  DataGridProvider,
  DataGridTable,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import ListToolBar from "./listToolBar";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { cn } from "@/utils/cn";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";

const API_URL = apiConfigOrder.order;

const BatchDetailDialog = () => {
  const { showDetail, setShowDetail, selectedRow, masterData, stateRecInst } =
    useWholesaleMonitor();
  const { GetData, PostData } = useCallApi();
  const [insCount, setInstCount] = useState<Record<string, number>>({});
  const [stateCount, setStatetCount] = useState<Record<string, number>>({});
  const [insTotal, setInsTotal] = useState<number>(0);
  const [stateTotal, setStateTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showIns, setShowIns] = useState<boolean>(false);
  const [showState, setShowState] = useState<boolean>(false);

  const fetchBatchDetail = async (): Promise<BatchDetailList[]> => {
    try {
      setIsLoading(true);

      if (!selectedRow) return [];
      const resp = await GetData(
        `${API_URL}/api/order-entry/order/qry-wholesale-inst-list`,
        { wholesaleId: selectedRow?.wholesaleId },
      );

      if (!resp.status) {
        toast.error(resp.message);
        return [];
      }

      const final = await PostData(
        `${API_URL}/api/order-entry/order/qry-wholesaleinst-detail-for-distribution`,
        {
          wholesaleInstList: resp.data,
          orderItemStateList: masterData.data?.orderState,
        },
      );

      if (!final) {
        toast.error("Error not getting response");
        return [];
      }

      if (!final.status) {
        toast.error(final.message);
        return [];
      }

      return final.data.wholesaleInstList;
    } catch (error) {
      toast.error("Client Side Error");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const BatchDetailList = useQuery({
    queryKey: ["wholesale-inst", selectedRow?.wholesaleId],
    queryFn: fetchBatchDetail,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    console.log("ini staterecinst", stateRecInst);
  }, [stateRecInst]);

  const init = async () => {
    try {
      const result = BatchDetailList.data?.reduce<{
        insCount: Record<string, number>;
        stateCount: Record<string, number>;
        totalIns: number;
        totalState: number;
      }>(
        (acc, item) => {
          acc.insCount[item.state] = (acc.insCount[item.state] ?? 0) + 1;

          acc.stateCount[item.orderState] =
            (acc.stateCount[item.orderState] ?? 0) + 1;

          if (item.state) acc.totalIns += 1;

          if (item.orderState) acc.totalState += 1;

          return acc;
        },
        {
          insCount: {},
          stateCount: {},
          totalIns: 0,
          totalState: 0,
        },
      );

      setInstCount(result?.insCount ?? {});
      setStatetCount(result?.stateCount ?? {});
      setInsTotal(result?.totalIns ?? 0);
      setStateTotal(result?.totalState ?? 0);
    } catch (error) {
      console.error(error);
    }
  };
  const column = useMemo<ColumnDef<BatchDetailList>[]>(
    () => [
      {
        accessorFn: (row) => row.accNbr,
        id: "accNbr",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Service Number"
            column={column}
          />
        ),
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 text-ellipsis whitespace-nowrap ",
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.iccid,
        id: "iccid",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="ICCID" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 text-ellipsis whitespace-nowrap ",
        },
      },
      {
        accessorFn: (row) => row.state,
        id: "state",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Instance State"
            column={column}
          />
        ),
        cell: ({ row }) => <div>{stateRecInst[row.original.state]}</div>,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 text-ellipsis whitespace-nowrap ",
        },
      },
      {
        accessorFn: (row) => row.orderNbr,
        id: "orderNbr",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Order Number"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 text-ellipsis whitespace-nowrap ",
        },
      },
      {
        accessorFn: (row) => row.orderStateName,
        id: "orderStateName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Order State"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 text-ellipsis whitespace-nowrap ",
        },
      },
      {
        accessorFn: (row) => row.stateDate,
        id: "stateDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="State Time"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 text-ellipsis whitespace-nowrap ",
        },
      },
      {
        accessorFn: (row) => row.completedDate,
        id: "completedDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Completed Time"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 text-ellipsis whitespace-nowrap ",
        },
      },
      {
        accessorFn: (row) => row.comments,
        id: "comments",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Remarks" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 text-ellipsis whitespace-nowrap ",
        },
      },
    ],
    [stateRecInst],
  );

  useEffect(() => {
    if (showDetail) init();
  }, [BatchDetailList]);
  return (
    <DialogWrapper
      isOpen={showDetail}
      handleDialog={setShowDetail}
      title="Batch Detail"
      size={{ width: "6xl" }}
    >
      <div className="flex flex-col gap-5 pt-5">
        {isLoading && <Loading />}
        <div
          className={clsx(
            "flex flex-col p-2 border-2 rounded-md gap-5 min-w-[145px]",
            "overflow-hidden shadow-sm transition-[max-height] duration-500 ease-in-out",
            showIns ? "max-h-[500px]" : "max-h-[46px]",
          )}
        >
          <div className="flex flex-row justify-between">
            <div>Instance State Total {insTotal}</div>
            <Button
              size={"sm"}
              variant={"ghost"}
              onClick={() => setShowIns((prev) => !prev)}
            >
              <KeenIcon
                icon="down"
                className={`transition-all duration-500 ${showIns ? "rotate-180" : "rotate-0"}`}
              />
            </Button>
          </div>
          <div className={`flex flex-wrap gap-2`}>
            {Object.entries(stateRecInst).map(([key, name], index) => (
              <DefaultTooltip title={name} key={index}>
                <div className="p-2 border-2 min-w-24 max-w-28 items-center justify-center rounded-md flex flex-col">
                  <div className="w-full truncate text-center">{name}</div>
                  <div className="">{insCount[key] ?? 0}</div>
                </div>
              </DefaultTooltip>
            ))}
          </div>
        </div>
        <div
          className={clsx(
            "flex flex-col p-2 border-2 rounded-md gap-5 min-w-[145px]",
            "overflow-hidden shadow-sm transition-[max-height] duration-500 ease-in-out",
            showState ? "max-h-[500px]" : "max-h-[46px]",
          )}
        >
          <div className="flex flex-row justify-between">
            <div>Order State Total {stateTotal}</div>
            <Button
              size={"sm"}
              variant={"ghost"}
              onClick={() => setShowState((prev) => !prev)}
            >
              <KeenIcon
                icon="down"
                className={`transition-all duration-500 ${showState ? "rotate-180" : "rotate-0"}`}
              />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {masterData.data?.orderState.map((item, index) => (
              <DefaultTooltip title={item.orderStateName} key={index}>
                <div className="p-2 border-2 min-w-24 max-w-28 items-center justify-center rounded-md flex flex-col">
                  <div className="w-full truncate text-center">
                    {item.orderStateName}
                  </div>
                  <div className="">{stateCount[item.orderState] ?? 0}</div>
                </div>
              </DefaultTooltip>
            ))}
          </div>
        </div>
        <DataGridProvider
          key={`resource-grid`}
          data={BatchDetailList.data}
          // toolbar={<ListToolBar />}
          // layout={{ card: true }}
          serverSide={false}
          columns={column}
        >
          <div
            className={cn(
              "grid",
              `
                  card
                  [&>[data-container]]:border-x-0
                  [&>[data-container]]:rounded-none
                  [&>[data-container]>[data-table]>thead>tr>th:first-child]:px-5
                  [&>[data-container]>[data-table]>tbody>tr>td:first-child]:px-5  
                  [&>[data-toolbar]]:p-5
                  [&>[data-pagination]]:px-5
                  [&>[data-pagination]]:py-3
                `,
            )}
          >
            <ListToolBar reload={BatchDetailList.refetch} />
            <div className="border-2 max-h-[300px] overflow-y-auto">
              <DataGridTable />
            </div>
            <DataGridPagination />
          </div>
        </DataGridProvider>
      </div>
    </DialogWrapper>
  );
};

export default BatchDetailDialog;

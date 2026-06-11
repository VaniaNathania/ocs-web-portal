import { ContentLoader, DefaultTooltip, KeenIcon, useDataGrid, DataGridColumnHeader, DataGridProvider, DataGridInner } from "@/components";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { DeleteTriggerTypeKey, useTriggerCreateContext } from "../../hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BalanceListToolBar } from "./BalanceListToolBar";

import moment from "moment";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { AddBalanceDialog } from "./AddBalanceDialog";
import DeleteDialog from "../DeleteDialog";
import { EditBalanceDialog } from "./EditBalanceDialog";

const API_URL = apiConfig.service_price_plan;

const BalanceTriggerList = () => {
  const { GetData } = useCallApi();
  const { selectedOfferVerId } = usePortalData();
  const { handleEditBalanceDialog, handleDeleteDialog, onConfirmDelete, balanceTriggerListRefreshKey, refreshBalanceTriggerList, handleShowDetailBalanceTrigger, commonTriggerList, selectedBalanceOptions, fetchAccountBalanceType } =
    useTriggerCreateContext();

  const [selectedTriggerId, setSelectedTriggerId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    show: boolean;
    deleteType: DeleteTriggerTypeKey | null;
  }>({
    show: false,
    deleteType: null,
  });

  useEffect(() => {
    fetchAccountBalanceType();
  }, []);

  const balanceTypeMap = useMemo(() => {
    return (selectedBalanceOptions ?? []).reduce((acc: Record<string, string>, item) => {
      acc[item.value] = item.label;
      return acc;
    }, {});
  }, [selectedBalanceOptions]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.acctResIdList,
        id: "acctResIdList",
        header: ({ column }) => <DataGridColumnHeader title="Account Balance Type " column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/2 text-center",
          cellClassName: "text-center whitespace-normal break-words",
        },
        cell: ({ row: { original: row } }) => {
          const labels = row.acctResIdList
            ?.split(",")
            ?.map((id: string) => balanceTypeMap[id.trim()] || id.trim())
            ?.join(", ");

          return <>{labels || "-"}</>;
        },
      },
      {
        accessorFn: (row) => row.triggerMode,
        id: "triggerMode",
        header: ({ column }) => <DataGridColumnHeader title="Trigger Mode" column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: " w-3/12",
        },
        cell: ({ row: { original: row } }) => {
          return (
            <>
              <p className="text-[14px] whitespace-nowrap">{row.triggerTypeName || "-"}</p>
            </>
          );
        },
      },
      {
        accessorFn: (row) => row.isLimit,
        id: "isLimit",
        header: ({ column }) => <DataGridColumnHeader title="Reference Limit" column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: " w-3/12",
        },
        cell: ({ row: { original: row } }) => {
          const isLimit = row.isLimit === "N" ? "No" : "Yes";
          return (
            <>
              <p className="text-[14px] whitespace-nowrap">{isLimit || "-"}</p>
            </>
          );
        },
      },
      {
        accessorFn: (row) => row.destination,
        id: "destination",
        header: ({ column }) => <DataGridColumnHeader title="Destination" column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: " w-3/12",
        },
        cell: ({ row: { original: row } }) => {
          let destination = "";
          if (row.destination === "1") {
            destination = "CVBS";
          } else if (row.destination === "2") {
            destination = "MCCM";
          } else if (row.destination === "3") {
            destination = "BOTH";
          }

          return (
            <>
              <p className="text-[14px] whitespace-nowrap">{destination || "-"}</p>
            </>
          );
        },
      },
      {
        accessorFn: (row) => row.effDate,
        id: "effDate",
        header: ({ column }) => <DataGridColumnHeader title="Effective Date " column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/12 text-center",
          cellClassName: "text-center whitespace-nowrap",
        },
        cell: ({ row: { original: row } }) => {
          return (
            <>
              {row.effDate ?? "-"}
              <br />
              {/* {moment(row.effDate).format("HH:mm:ss")} */}
            </>
          );
        },
      },
      {
        accessorFn: (row) => row.expDate,
        id: "expDate",
        header: ({ column }) => <DataGridColumnHeader title="Expiry Date " column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/12 text-center",
          cellClassName: "text-center whitespace-nowrap",
        },
        cell: ({ row: { original: row } }) => {
          console.log("row", row);
          return (
            <>
              {row.expDate ?? "-"}
              <br />
              {/* {moment(row.effDate).format("HH:mm:ss")} */}
            </>
          );
        },
      },
      {
        id: "action",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => <DataGridColumnHeader title="Actions" className="text-center" column={column} />,
        cell: (data: any) => {
          const row = data.row.original;
          return (
            <div className="flex justify-center">
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  handleEditBalanceDialog(true, row);
                }}
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              <button className="btn btn-sm btn-icon btn-clear btn-light" onClick={() => handleShowDetailBalanceTrigger(true, row)}>
                <KeenIcon icon="eye" />
              </button>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  setShowDeleteConfirm({
                    show: true,
                    deleteType: "triggerBalance",
                  });
                  setSelectedTriggerId(row.triggerId);
                }}
              >
                <KeenIcon icon="trash" />
              </button>
            </div>
          );
        },
        meta: {
          headerClassName: "w-1/12 text-center",
          cellClassName: "w-1/12 text-center",
        },
      },
    ],
    [balanceTypeMap],
  );

  const doGetListBalanceTrigger = async (page: number, limit: number, sorting: any, filter: any) => {
    sorting = sorting.length === 0 ? [{ id: "eff_date", desc: false }] : sorting;

    filter = filter?.length === 0 ? {} : filter;
    let filterObject: Record<string, string | string[]> = {};
    if (Object.keys(filter).length !== 0) {
      for (let _filter of filter) {
        filterObject[_filter.id] = _filter.value;
      }
    }

    filter = filterObject;

    const response = await GetData(`${API_URL}/trigger/balance/${selectedOfferVerId}`, {
      id: selectedOfferVerId,
      page: page + 1,
      size: limit,
      order_field: sorting[0].id,
      order_direction: sorting[0].desc === false ? "ASC" : "DESC",
    });

    return {
      data: response?.data,
      totalCount: response?.totalRows,
    };
  };

  const confirmDelete = async (deleteType: DeleteTriggerTypeKey, params?: DeleteParams | null): Promise<boolean> => {
    let ok = false;
    if (deleteType === "triggerBalance") {
      ok = await onConfirmDelete(deleteType, {
        triggerId: params?.triggerId,
      });
    } else {
      ok = await onConfirmDelete(deleteType, null);
    }

    if (ok) {
      setShowDeleteConfirm({ show: false, deleteType: null });
      refreshBalanceTriggerList();
      setSelectedTriggerId(null);
    }

    return ok;
  };

  return (
    <>
      <DataGridProvider
        key={balanceTriggerListRefreshKey}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<BalanceListToolBar />}
        layout={{ card: true }}
        sorting={[{ id: "OFFER_VER_ID", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => doGetListBalanceTrigger(pageIndex, pageSize, sorting, columnFilters)}
      >
        <div className="grid gap-5 lg:gap-7.5">
          <DataGridInner />
        </div>
        <AddBalanceDialog />
        <EditBalanceDialog />
      </DataGridProvider>
      <DeleteDialog
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        onConfirmDelete={confirmDelete}
        params={{
          triggerId: selectedTriggerId!,
        }}
      />
    </>
  );
};

export { BalanceTriggerList };

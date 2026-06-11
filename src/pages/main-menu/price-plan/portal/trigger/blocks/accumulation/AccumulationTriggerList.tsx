import { ContentLoader, DefaultTooltip, KeenIcon, useDataGrid, DataGridColumnHeader, DataGridProvider, DataGridInner } from "@/components";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { DeleteTriggerTypeKey, useTriggerCreateContext } from "../../hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AccumulationListToolBar } from "./AccumulationListToolBar";

import moment from "moment";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { AddAccumulationDialog } from "./AddAccumulationDialog";
import EditAccumulationDialog from "./EditAccumulationDialog";
import DeleteDialog from "../DeleteDialog";

type LoadingButton = "filter" | "reset" | "export" | "refresh" | null;

const API_URL = apiConfig.service_price_plan;

const AccumulationTriggerList = () => {
  const { GetData } = useCallApi();
  const { selectedOfferVerId } = usePortalData();
  const { handleThresholdAccumulationDialog, handleEditAccumulationDialog, onConfirmDelete, acmTriggerListRefreshKey, refreshAcmTriggerList } = useTriggerCreateContext();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    show: boolean;
    deleteType: DeleteTriggerTypeKey | null;
  }>({
    show: false,
    deleteType: null,
  });
  const [selectedTriggerId, setSelectedTriggerId] = useState<number | null>(null);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.state,
        id: "state",
        header: ({ column }) => <DataGridColumnHeader title="State " column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/12 text-center",
          cellClassName: "text-center whitespace-nowrap",
        },
        cell: ({ row: { original: row } }) => {
          return <>{row.state}</>;
        },
      },
      {
        accessorFn: (row) => row.accumulationType,
        id: "accumulationType",
        header: ({ column }) => <DataGridColumnHeader title="Accumulation Type" column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: " w-3/12",
        },
        cell: ({ row: { original: row } }) => {
          return (
            <>
              <p className="text-[14px] whitespace-nowrap">{row.accumulationType?.accumulationType || "-"}</p>
            </>
          );
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
              <p className="text-[14px] whitespace-nowrap">{row.triggerMode?.triggerMode || "-"}</p>
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
        header: ({ column }) => <DataGridColumnHeader title="Effective Date" column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/12 text-center",
          cellClassName: "text-center whitespace-nowrap",
        },
        cell: ({ row: { original: row } }) => {
          return (
            <>
              {moment(row.effDate).format("DD-MM-YYYY")}
              <br />
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
          return (
            <>
              {row.expDate === null ? "-" : moment(row.expDate).format("DD-MM-YYYY")}
              <br />
            </>
          );
        },
      },
      {
        id: "id",
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
                  handleEditAccumulationDialog(true, row);
                }}
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              <button className="btn btn-sm btn-icon btn-clear btn-light" onClick={() => handleThresholdAccumulationDialog(true, row)}>
                <KeenIcon icon="eye" />
              </button>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  setShowDeleteConfirm({
                    show: true,
                    deleteType: "triggerAcm",
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
    [],
  );

  const doGetListAccumulationTrigger = async (page: number, limit: number, sorting: any, filter: any) => {
    sorting = sorting.length === 0 ? [{ id: "", desc: false }] : sorting;

    filter = filter?.length === 0 ? {} : filter;
    let filterObject: Record<string, string | string[]> = {};
    if (Object.keys(filter).length !== 0) {
      for (let _filter of filter) {
        filterObject[_filter.id] = _filter.value;
      }
    }

    filter = filterObject;

    const response = await GetData(`${API_URL}/trigger/accumulation/list/${selectedOfferVerId}`, {
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
    if (deleteType === "triggerAcm") {
      ok = await onConfirmDelete(deleteType, {
        triggerId: params?.triggerId,
      });
    } else {
      ok = await onConfirmDelete(deleteType, null);
    }

    if (ok) {
      setShowDeleteConfirm({ show: false, deleteType: null });
      refreshAcmTriggerList();
      setSelectedTriggerId(null);
    }

    return ok;
  };

  return (
    <>
      <DataGridProvider
        key={acmTriggerListRefreshKey}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<AccumulationListToolBar />}
        layout={{ card: true }}
        sorting={[{ id: "OFFER_VER_ID", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => doGetListAccumulationTrigger(pageIndex, pageSize, sorting, columnFilters)}
      >
        <div className="grid gap-5 lg:gap-7.5">
          <DataGridInner />
        </div>
        <AddAccumulationDialog />
        <EditAccumulationDialog />
        <DeleteDialog
          showDeleteConfirm={showDeleteConfirm}
          setShowDeleteConfirm={setShowDeleteConfirm}
          onConfirmDelete={confirmDelete}
          params={{
            triggerId: selectedTriggerId!,
          }}
        />
      </DataGridProvider>
    </>
  );
};

export { AccumulationTriggerList };

import {
  ContentLoader,
  DefaultTooltip,
  KeenIcon,
  useDataGrid,
  DataGridColumnHeader,
  DataGridProvider,
  DataGridInner,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { DeleteTriggerTypeKey, useTriggerCreateContext } from "../../../hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EventListToolBar } from "./EventListToolBar";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import TriggerEventEditDialog from "./TriggerEventEditDialog";
import DeleteDialog from "../../DeleteDialog";

type LoadingButton = "filter" | "reset" | "export" | "refresh" | null;

const API_URL = apiConfig.service_price_plan;

const EventList = () => {
  const { GetData } = useCallApi();
  
  const {
    selectedThreshold,
    eventListRefreshKey,
    refreshEventList,
    onConfirmDelete,
  } = useTriggerCreateContext();
  const { selectedOfferVerId } = usePortalData();

  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    show: boolean;
    deleteType: DeleteTriggerTypeKey | null;
  }>({
    show: false,
    deleteType: null,
  });
  const [selectedEvent, setSelectedEvent] = useState<EventList | null>(null);
  const [subsEventId, setSubsEventId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState<LoadingButton>(null);
  const [errors, setErrors] = useState<any>({});
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.eventName,
        id: "eventName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Event Name" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/12 text-center",
          cellClassName: "text-center whitespace-nowrap",
        },
        cell: ({ row: { original: row } }) => {
          return <>{row.eventName}</>;
        },
      },
      {
        accessorFn: (row) => row.antibillShock,
        id: "antibillShock",
        header: ({ column }) => (
          <DataGridColumnHeader title="Anti Bill Shock" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/12 text-center",
          cellClassName: "text-center whitespace-nowrap",
        },
        cell: ({ row: { original: row } }) => {
          return <>{row.antibillShock}</>;
        },
      },
      {
        id: "action",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Actions"
            className="text-center"
            column={column}
          />
        ),
        cell: (data: any) => {
          const row = data.row.original;

          return (
            <div className="flex justify-center">
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  setShowDialog(true);
                  setSelectedEvent(row);
                }}
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  setShowDeleteConfirm({
                    show: true,
                    deleteType: "acmTriggerEvent",
                  });
                  setSubsEventId(row.subsEventId);
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

  const doGetListAccumulationTrigger = async (
    page: number,
    limit: number,
    sorting: any,
    filter: any,
  ) => {
    sorting =
      sorting.length === 0 ? [{ id: "eff_date", desc: false }] : sorting;

    filter = filter?.length === 0 ? {} : filter;
    let filterObject: Record<string, string | string[]> = {};
    if (Object.keys(filter).length !== 0) {
      for (let _filter of filter) {
        filterObject[_filter.id] = _filter.value;
      }
    }

    filter = filterObject;

    const response = await GetData(`${API_URL}/trigger/event/acm/list`, {
      // id: selectedOfferVerId,
      // page: page,
      // size: limit,
      // order_field: sorting[0].id,
      // order_direction: sorting[0].desc === false ? "ASC" : "DESC",
      trisholdId: selectedThreshold?.acmThresholdId,
      spId: 0,
    });

    return {
      data: response?.data,
      totalCount: response?.data.lenght,
    };
  };

  const confirmDelete = async (
    deleteType: DeleteTriggerTypeKey,
    params?: DeleteParams | null,
  ): Promise<boolean> => {
    let ok = false;
    if (deleteType === "acmTriggerEvent") {
      ok = await onConfirmDelete(deleteType, {
        thresholdId: params?.thresholdId,
        subBalTypeId: params?.subsEventId,
      });
    } else {
      ok = await onConfirmDelete(deleteType, null);
    }

    if (ok) {
      setShowDeleteConfirm({ show: false, deleteType: null });
      refreshEventList();
      setSubsEventId(null);
    }

    return ok;
  };

  return (
    <>
      <DataGridProvider
        key={eventListRefreshKey}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<EventListToolBar />}
        layout={{ card: true }}
        sorting={[{ id: "eff_date", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          doGetListAccumulationTrigger(
            pageIndex,
            pageSize,
            sorting,
            columnFilters,
          )
        }
      >
        <div className="grid gap-5 lg:gap-7.5">
          <DataGridInner />
        </div>
        <TriggerEventEditDialog
          showDialog={showDialog}
          setShowDialog={setShowDialog}
          selectedEvent={selectedEvent}
        />
      </DataGridProvider>
      <DeleteDialog
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        onConfirmDelete={confirmDelete}
        params={{
          thresholdId: selectedThreshold?.acmThresholdId,
          subsEventId: subsEventId!,
        }}
      />
    </>
  );
};

export { EventList };

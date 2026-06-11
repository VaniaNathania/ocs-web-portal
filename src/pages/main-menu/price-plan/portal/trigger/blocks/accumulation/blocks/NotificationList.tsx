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
import { NotificationListToolBar } from "./NotificationListToolBar";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { TriggerNotificationDialog } from "./TriggerNotificationDialog";
import { TriggerNotificationEditDialog } from "./TriggerNotificationEditDialog";
import DeleteDialog from "../../DeleteDialog";

type LoadingButton = "filter" | "reset" | "export" | "refresh" | null;

const API_URL = apiConfig.service_price_plan;

const NotificationList = () => {
  const { GetData } = useCallApi();
  
  const {
    selectedThreshold,
    onConfirmDelete,
    notificationListRefreshKey,
    refreshNotificationList,
    setSelectedTriggerNotification,
  } = useTriggerCreateContext();
  const { selectedOfferVerId } = usePortalData();

  const [showTriggerNotificationDialog, setShowTriggerNotificationDialog] =
    useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    show: boolean;
    deleteType: DeleteTriggerTypeKey | null;
  }>({
    show: false,
    deleteType: null,
  });
  const [selectedTrigger, setSelectedTrigger] = useState<
    TriggerAcmNotification | TriggerBalanceNotification | null
  >(null);

  const columns = useMemo<ColumnDef<TriggerAcmNotification>[]>(
    () => [
      {
        accessorFn: (row) => row.adviceTypeName,
        id: "notificationType",
        header: ({ column }) => (
          <DataGridColumnHeader title="Notification Type" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row: { original: row } }) => {
          return <>{row.adviceTypeName || "-"}</>;
        },
        meta: {
          headerClassName: "text-center w-3/12",
          cellClassName: "whitespace-nowrap",
        },
      },
      {
        accessorFn: (row) => row.adviceEventName,
        id: "notificationEvent",
        header: ({ column }) => (
          <DataGridColumnHeader title="Notification Event" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row: { original: row } }) => {
          return <>{row.adviceEventName || "-"}</>;
        },
        meta: {
          headerClassName: "text-center w-3/12",
        },
      },
      {
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Actions"
            className="text-center"
            column={column}
          />
        ),
        cell: ({ row }) => {
          const data = row.original;

          return (
            <div className="flex justify-center gap-1">
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  setShowTriggerNotificationDialog(true);
                  setSelectedTrigger(data);
                  setSelectedTriggerNotification(data);
                }}
              >
                <KeenIcon icon="notepad-edit" />
              </button>

              {/* <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => handleThresholdAccumulationDialog(true, data)}
              >
                <KeenIcon icon="eye" />
              </button> */}

              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  setShowDeleteConfirm({
                    show: true,
                    deleteType: "acmTriggerNotif",
                  });
                  setSelectedTrigger(data);
                }}
              >
                <KeenIcon icon="trash" />
              </button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/12 text-center",
          cellClassName: "w-1/12 text-center",
        },
      },
    ],
    [],
  );

  const doGetListNotificationTrigger = async (
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

    const response = await GetData(`${API_URL}/trigger/notification/acm/list`, {
      thresholdId: selectedThreshold?.acmThresholdId,
      spId: 0,
    });

    return {
      data: response?.data,
      totalCount: response?.data.length,
    };
  };

  const ConfirmDelete = async (
    deleteType: DeleteTriggerTypeKey,
    params?: DeleteParams | null,
  ): Promise<boolean> => {
    let ok = false;

    if (deleteType === "acmTriggerNotif") {
      ok = await onConfirmDelete("acmTriggerNotif", {
        thresholdId: params?.thresholdId,
        adviceEventId: params?.adviceEventId,
        adviceType: params?.adviceType,
        notifyParamsId: params?.notifyParamsId,
      });
    } else {
      ok = await onConfirmDelete(deleteType, null);
    }

    if (ok) {
      setShowDeleteConfirm({ show: false, deleteType: null });
      refreshNotificationList();
      setSelectedTrigger(null);
    }

    return ok;
  };

  return (
    <>
      <DataGridProvider
        key={notificationListRefreshKey}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<NotificationListToolBar />}
        layout={{ card: true }}
        sorting={[{ id: "eff_date", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          doGetListNotificationTrigger(
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
        {/* <TriggerNotificationDialog
          showDialog={showTriggerNotificationDialog}
          setShowDialog={setShowTriggerNotificationDialog}
        /> */}
        <TriggerNotificationEditDialog
          showDialog={showTriggerNotificationDialog}
          setShowDialog={setShowTriggerNotificationDialog}
        />
        <DeleteDialog
          showDeleteConfirm={showDeleteConfirm}
          setShowDeleteConfirm={setShowDeleteConfirm}
          onConfirmDelete={ConfirmDelete}
          params={{
            thresholdId: selectedThreshold?.acmThresholdId,
            adviceEventId: selectedTrigger?.adviceEventId!,
            adviceType: selectedTrigger?.adviceType,
            notifyParamsId: selectedTrigger?.notifyParamsId!,
          }}
        />
      </DataGridProvider>
    </>
  );
};

export { NotificationList };

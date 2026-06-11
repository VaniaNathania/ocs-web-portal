// BenefitList.tsx - Versi tanpa ref/forwardRef

import {
  KeenIcon,
  DataGridColumnHeader,
  DataGridProvider,
  DataGridInner,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { DeleteTriggerTypeKey, useTriggerCreateContext } from "../../../hooks";
import { useCallback, useMemo, useState } from "react";
import DeleteDialog from "../../DeleteDialog";
import { TriggerBenefitDialog } from "./TriggerBenefitDialog";
import { TriggerBenefitEditDialog } from "./TriggerBenefitEditDialog";
import { BenefitListToolBar } from "./BenefitListToolBar";

// Tidak perlu BenefitListRef interface lagi
// export interface BenefitListRef {
//   refreshData: () => void;
// }

// Tidak perlu forwardRef
const BenefitList = () => {
  const {
    selectedThreshold,
    onConfirmDelete,
    doGetListTriggerBenefit,
    balanceTriggerListRefreshKey,
    refreshBalanceTriggerList,
  } = useTriggerCreateContext();

  const [showTriggerBenefitDialog, setShowTriggerBenefitDialog] =
    useState(false);
  const [showTriggeEditBenefitDialog, setShowTriggerEditBenefitDialog] =
    useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    show: boolean;
    deleteType: DeleteTriggerTypeKey | null;
  }>({
    show: false,
    deleteType: null,
  });
  const [selectedTrigger, setSelectedTrigger] =
    useState<BalanceTriggerBenefitList | null>(null);

  const columns = useMemo<ColumnDef<BalanceTriggerBenefitList>[]>(
    () => [
      {
        accessorFn: (row) => row.acctResName,
        id: "accountBalance",
        header: ({ column }) => (
          <DataGridColumnHeader title="Account Balance Type " column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "text-center w-3/12",
          cellClassName: "whitespace-nowrap",
        },
        cell: ({ row: { original: row } }) => {
          return <>{row.acctResName || "-"}</>;
        },
      },
      {
        accessorFn: (row) => row.value,
        id: "benefitValue",
        header: ({ column }) => (
          <DataGridColumnHeader title="Benefit Value" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "text-center w-3/12",
        },
        cell: ({ row: { original: row } }) => {
          return (
            <p className="text-[14px] whitespace-nowrap">{row.value || "-"}</p>
          );
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
        cell: ({ row }) => {
          return (
            <div className="flex justify-center">
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  setShowTriggerEditBenefitDialog(true);
                  setSelectedTrigger(row.original);
                }}
              >
                <KeenIcon icon="notepad-edit" />
              </button>

              {/* <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => handleThresholdAccumulationDialog(true, null)}
              >
                <KeenIcon icon="eye" />
              </button> */}

              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  setSelectedTrigger(row.original);
                  setShowDeleteConfirm({
                    show: true,
                    deleteType: "balanceTriggerBenefit",
                  });
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
    []
  );

  const confirmDelete = async (
    deleteType: DeleteTriggerTypeKey,
    params?: DeleteParams | null
  ): Promise<boolean> => {
    let ok = false;

    if (deleteType === "balanceTriggerBenefit") {
      ok = await onConfirmDelete(deleteType, {
        thresholdId: params?.thresholdId,
        periodId: params?.periodId,
        subBalTypeId: params?.subBalTypeId,
      });
    } else {
      ok = await onConfirmDelete(deleteType, null);
    }

    if (ok) {
      setShowDeleteConfirm({ show: false, deleteType: null });
      refreshBalanceTriggerList();
      setSelectedTrigger(null);
    }

    return ok;
  };

  return (
    <>
      <DataGridProvider
        key={balanceTriggerListRefreshKey}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={
          <BenefitListToolBar
            showDialog={showTriggerBenefitDialog}
            setShowDialog={setShowTriggerBenefitDialog}
          />
        }
        layout={{ card: true }}
        sorting={[{ id: "eff_date", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          doGetListTriggerBenefit(
            "balance",
            pageIndex,
            pageSize,
            sorting,
            columnFilters
          )
        }
      >
        <div className="grid gap-5 lg:gap-7.5">
          <DataGridInner />
        </div>
        <TriggerBenefitDialog
          showDialog={showTriggerBenefitDialog}
          setShowDialog={setShowTriggerBenefitDialog}
        />
        <TriggerBenefitEditDialog
          showDialog={showTriggeEditBenefitDialog}
          setShowDialog={setShowTriggerEditBenefitDialog}
          subBalTypeId={selectedTrigger?.subBalTypeId}
        />
        <DeleteDialog
          showDeleteConfirm={showDeleteConfirm}
          setShowDeleteConfirm={setShowDeleteConfirm}
          onConfirmDelete={confirmDelete}
          params={{
            thresholdId: selectedTrigger?.balThresholdId,
            subBalTypeId: selectedTrigger?.subBalTypeId,
            periodId: selectedTrigger?.periodId,
          }}
        />
      </DataGridProvider>
    </>
  );
};

export { BenefitList };

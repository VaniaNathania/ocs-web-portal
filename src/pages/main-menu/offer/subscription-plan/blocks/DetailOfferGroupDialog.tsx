import React, { useState, useMemo } from "react";
import { apiConfigOffer } from "@/config/api.config";
import { DataGridColumnHeader, DataGridProvider, KeenIcon, useDataGrid } from "@/components";
import { useCallApi } from "@/hooks";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";

interface DetailOfferGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  group: any | null;
}

const API_URL_OFFER = apiConfigOffer.offer;

const DetailOfferGroupDialog: React.FC<DetailOfferGroupDialogProps> = ({ isOpen, onClose, group }) => {
  // const { reload } = useDataGrid();
  const { PostData, GetData } = useCallApi();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  // Data Grid Columns
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: ({ column }) => <DataGridColumnHeader className="" title="Offer Group Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.mode,
        id: "mode",
        header: ({ column }) => <DataGridColumnHeader className="" title="Group Mode" column={column} />,
        enableSorting: true,
        enableHiding: false,
        // cell: ({ row }) => (row.original.csrVisible === "Y" ? <KeenIcon icon="eye" /> : null),
      },
      {
        accessorFn: (row) => row.isNecessary,
        id: "isNecessary",
        header: ({ column }) => <DataGridColumnHeader className="w-[100px] min-w-[100px] max-w-[100px] whitespace-normal break-words text-center" title="Is Necesarry" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => (row.original.isNecessary === "Y" ? <KeenIcon icon="check" /> : "-"),
      },
      {
        accessorFn: (row) => row.defaultValue,
        id: "defaultValue",
        header: ({ column }) => <DataGridColumnHeader className="w-[100px] min-w-[100px] max-w-[100px] whitespace-normal break-words text-center" title="Default Value" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.csrVisible,
        id: "csrVisible",
        header: ({ column }) => <DataGridColumnHeader className="" title="Visible" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => (row.original.csrVisible === "Y" ? <KeenIcon icon="eye" /> : null),
      },
      {
        accessorFn: (row) => row.agreementPeriod,
        id: "agreementPeriod",
        header: ({ column }) => <DataGridColumnHeader className="w-[100px] min-w-[100px] max-w-[100px] whitespace-normal break-words text-center" title="Agreement Period" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.feature,
        id: "feature",
        header: ({ column }) => <DataGridColumnHeader className="" title="Feature" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          return <button>Feature</button>;
        },
      },
    ],
    []
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-3 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg">Detail Offer Group</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <DialogBody className="max-h-[75vh] overflow-y-auto">
          {alert.show && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{alert.message}</p>
            </div>
          )}

          <div className="p-2">
            <DataGridProvider
              // key={reloadKey}
              columns={columns}
              pagination={{ size: 10 }}
              data={group?.subRow ?? []}
              // getSubRows={(row) => row.subRow ?? []}
              layout={{ card: true }}
              sorting={[{ id: "featureName", desc: false }]}
              serverSide={false}
              // onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
              //   return doGetListData(pageIndex + 1, pageSize, sorting, columnFilters);
              // }}
            ></DataGridProvider>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default DetailOfferGroupDialog;

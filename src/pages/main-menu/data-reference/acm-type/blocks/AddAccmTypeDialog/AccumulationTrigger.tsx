import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { useAccmTypeStore } from "../../stores/accmType.store";

const AccumulationTrigger = ({
  data,
}: {
  data: InitDetailTriggerAccumulation[];
}) => {
  const { reloadKey } = useAccmTypeStore();
  const columns: ColumnDef<InitDetailTriggerAccumulation>[] = [
    {
      accessorKey: "pricePlanName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Accumulation Price" column={column} />
      ),
    },
    {
      accessorFn: (row) => row.effDate,
      id: "effDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="Validate Date" column={column} />
      ),
      cell: ({ row }) => {
        return (
          <div>
            {row.original.effDate} - {row.original.expDate}
          </div>
        );
      },
    },
  ];

  return (
    <DataGridProvider
      key={reloadKey}
      columns={columns}
      data={data}
      pagination={{ size: 5 }}
      layout={{ card: true }}
    ></DataGridProvider>
  );
};

export default AccumulationTrigger;

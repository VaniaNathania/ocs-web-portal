import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { useAccmTypeStore } from "../../stores/accmType.store";

const Accumulation = ({ data }: { data: InitDetailAccumulation[] }) => {
  const { reloadKey, triggerReload } = useAccmTypeStore();

  const columns: ColumnDef<InitDetailAccumulation>[] = [
    {
      accessorKey: "pricePlanName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Price Plan" column={column} />
      ),
    },
    {
      accessorKey: "ratePlanName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Rate Plan" column={column} />
      ),
    },
    {
      accessorKey: "reNames",
      header: ({ column }) => (
        <DataGridColumnHeader title="Event" column={column} />
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
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataGridColumnHeader title="Accumulation Type" column={column} />
      ),
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

export default Accumulation;

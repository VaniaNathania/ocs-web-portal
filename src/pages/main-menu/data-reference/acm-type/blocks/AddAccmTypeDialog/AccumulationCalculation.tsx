import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { useAccmTypeStore } from "../../stores/accmType.store";

const AccumulationCalculation = ({
  data,
}: {
  data: InitDetailAccmCalculation[];
}) => {
  const {reloadKey} = useAccmTypeStore();
 

  const columns: ColumnDef<InitDetailAccmCalculation>[] = [
    {
      accessorKey: "pricePlanName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Price Plan" column={column} />
      ),
    },
    {
      accessorKey: "priceName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Price" column={column} />
      ),
    },
    {
      accessorKey: "timeSpanUpId",
      header: ({ column }) => (
        <DataGridColumnHeader title="Accumulation Period" column={column} />
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

export default AccumulationCalculation;

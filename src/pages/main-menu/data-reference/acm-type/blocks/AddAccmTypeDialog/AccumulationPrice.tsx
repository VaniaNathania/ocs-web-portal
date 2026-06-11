import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { useAccmTypeStore } from "../../stores/accmType.store";

const AccumulationPrice = ({ data }: { data: InitDetailAccmPrice[] }) => {
  const { reloadKey } = useAccmTypeStore();

  const columns: ColumnDef<InitDetailAccmPrice>[] = [
    {
      accessorKey: "pricePlanName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Price Plan" column={column} />
      ),
    },
    {
      accessorKey: "priceName",
      header: ({ column }) => (
        <DataGridColumnHeader title="price" column={column} />
      ),
    },
    {
      accessorKey: "resourceName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Accumulation Price" column={column} />
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

export default AccumulationPrice;

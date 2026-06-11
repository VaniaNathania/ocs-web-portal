import { DataGridProvider } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

interface tableBuilderProps {
  data?: any[];
}

const TableBuilder = ({ data }: tableBuilderProps) => {
  // console.log("ini data table", data);
  if (!data || !data[0]) return;

  const key = Object.keys(data[0]).filter((item) => item !== "children");
  // console.log("ini key", key);

  const columndef: ColumnDef<any>[] = key.map((item) => ({
    accessorFn: (row) => row[item],
    accessorKey: item,
    header: item,
    // filterFn: "includesString",
  }));

  const column = useMemo<ColumnDef<any>[]>(() => columndef, []);
  return <DataGridProvider data={data} columns={column} serverSide={false} />;
};

export default TableBuilder;

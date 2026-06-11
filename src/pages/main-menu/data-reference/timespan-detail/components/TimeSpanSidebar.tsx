import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { useTimeSpanContext } from "../hooks/useTimeSpanContext";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { TimeSpanDatasProps } from "../hooks/SpanTimeContext";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";

const TimeSpanSidebar = () => {
  const { selectedItemSidebar, handleItemSidebarClick, timeSpanDatas } = useTimeSpanContext();

  const columnsSidebar = useMemo<ColumnDef<TimeSpanDatasProps>[]>(
    () => [
      {
        accessorFn: (row) => row.timeSpanName,
        id: "timeSpanName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Time Span Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
    ],
    [selectedItemSidebar]
  );

  return (
    <div className="p-2 h-full overflow-y-auto">
      <DataGridProvider
        columns={columnsSidebar}
        pagination={{ size: 10 }}
        data={timeSpanDatas}
        getRowProps={(row) => ({
          className: row.original.timeSpanId === selectedItemSidebar?.timeSpanId ? selectedRowHighLight : nonSelectedRowHighLight,
          onClick: () => handleItemSidebarClick(row.original),
        })}
        layout={{ card: true }}
        sorting={[{ id: "value", desc: false }]}
        serverSide={false}
      ></DataGridProvider>
    </div>
  );
};

export default TimeSpanSidebar;

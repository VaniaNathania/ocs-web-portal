import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { useTimeSpanContext } from "../hooks/useTimeSpanContext";
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { TimeSpanDetailDatasProps } from "../hooks/SpanTimeContext";
import { Button } from "@/components/ui/button";
import { timeUnitLabels } from "../blocks/utils/MapDisplayData";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";

const TimeSpanContent = () => {
  const { timeSpanDetailDatas, selectedItemContent, handleItemContentClick, triggerEditMode, triggerDeleteMode } = useTimeSpanContext();

  const columnsContent = useMemo<ColumnDef<TimeSpanDetailDatasProps>[]>(
    () => [
      {
        accessorFn: (row) => row.cycleBeginDate,
        id: "cycleBeginDate1",
        header: ({ column }) => <DataGridColumnHeader className="" title="Start Date" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const dateTime = row.original.cycleBeginDate;
          const startDate = dateTime?.split("T")[0] ?? "";
          return <div className="cursor-pointer">{startDate}</div>;
        },
      },
      {
        accessorFn: (row) => row.cycleBeginDate,
        id: "cycleBeginDate2",
        header: ({ column }) => <DataGridColumnHeader className="" title="Start Time" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const dateTime = row.original.cycleBeginDate;
          const startTime = dateTime?.split("T")[1] ?? "";
          return <div>{startTime}</div>;
        },
      },
      {
        accessorFn: (row) => row,
        id: "cycleUnit",
        header: ({ column }) => <DataGridColumnHeader className="" title="Cycle" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const cycleUnit = row.original.cycleUnit;
          const timeUnit = row.original.timeUnit;

          return (
            <div>
              <span>{`${cycleUnit} ${timeUnitLabels[timeUnit] ?? timeUnit}`}</span>
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.duration,
        id: "duration",
        header: ({ column }) => <DataGridColumnHeader className="" title="Duration (s)" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "operations",
        header: ({ column }) => <DataGridColumnHeader className="text-center" title="Operation" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <div className="flex justify-center gap-1">
              <Button variant="ghost" onClick={() => triggerEditMode(row.original)} className="p-2 cursor-pointer">
                <KeenIcon icon="notepad-edit" />
              </Button>
              <Button variant="ghost" onClick={() => triggerDeleteMode(row.original)} className="p-2 cursor-pointer text-red-500 hover:text-gray-700">
                <KeenIcon icon="trash" className="" />
              </Button>
            </div>
          );
        },
      },
    ],
    [selectedItemContent]
  );
  return (
    <>
      <div className="p-2 h-full overflow-y-auto">
        <DataGridProvider
          columns={columnsContent}
          pagination={{ size: 10 }}
          data={timeSpanDetailDatas}
          layout={{ card: true }}
          sorting={[{ id: "startTime", desc: false }]}
          serverSide={false}
          getRowProps={(row) => ({
            className: row.original.id.seq === selectedItemContent?.id.seq ? selectedRowHighLight : nonSelectedRowHighLight,
            onClick: () => handleItemContentClick(row.original),
          })}
        ></DataGridProvider>
      </div>
    </>
  );
};

export default TimeSpanContent;

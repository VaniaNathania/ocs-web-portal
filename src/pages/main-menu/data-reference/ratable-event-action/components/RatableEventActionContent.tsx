import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { useRatableEventActionContext } from "../hooks/useRatableEventActionContext";
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { RatableEventActionContentProps } from "../hooks/RatableEventActionContext";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";

const RatableEventActionContent = () => {
  const { reActionDetailDatas, selectedItemContent, handleItemContentClick, getOperationFlagName } = useRatableEventActionContext();



  const columnsContent = useMemo<ColumnDef<RatableEventActionContentProps>[]>(
    () => [
      {
        accessorFn: (row) => row.pricePlanName,
        id: "pricePlanName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Price Plan Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.effDate,
        id: "effDate",
        header: ({ column }) => <DataGridColumnHeader className="" title="Effective Date" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.expDate,
        id: "expDate",
        header: ({ column }) => <DataGridColumnHeader className="" title="Expiry Date" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.operationFlag,
        id: "operationFlag",
        header: ({ column }) => <DataGridColumnHeader className="" title="Operation Flag" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          return <div className="max-w-[250px] whitespace-normal break-words">{getOperationFlagName(row.original.operationFlag)}</div>;
        },
      },
    ],
    [selectedItemContent]
  );
  return (
    <>
      <div className="p-2 h-[380px] overflow-y-auto">
        <DataGridProvider
          columns={columnsContent}
          pagination={{ size: 10 }}
          data={reActionDetailDatas}
          layout={{ card: true }}
          sorting={[{ id: "pricePlanName", desc: false }]}
          serverSide={false}
          getRowProps={(row) => ({
            className: row.original.reActionPricePlanId === selectedItemContent?.reActionPricePlanId ? selectedRowHighLight : nonSelectedRowHighLight,
            onClick: () => handleItemContentClick(row.original),
          })}
        ></DataGridProvider>
      </div>
    </>
  );
};

export default RatableEventActionContent;

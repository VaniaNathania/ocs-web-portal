import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { useRatableEventActionContext } from "../hooks/useRatableEventActionContext";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { RatableEventActionMasterProps } from "../hooks/RatableEventActionContext";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";

const RatableEventActionMaster = () => {
  const { selectedItemMaster, handleItemMasterClick, reActionDatas } = useRatableEventActionContext();

  const columnsMaster = useMemo<ColumnDef<RatableEventActionMasterProps>[]>(
    () => [
      {
        accessorFn: (row) => row.reActionName,
        id: "reActionName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Action Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.reActionCode,
        id: "reActionCode",
        header: ({ column }) => <DataGridColumnHeader className="" title="Action Code" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
    ],
    [selectedItemMaster]
  );

  return (
    <div className="p-2 h-[380px] overflow-y-auto">
      <DataGridProvider
        columns={columnsMaster}
        pagination={{ size: 10 }}
        data={reActionDatas}
        getRowProps={(row) => ({
          className: row.original.reActionId === selectedItemMaster?.reActionId ? selectedRowHighLight : nonSelectedRowHighLight,
          onClick: () => handleItemMasterClick(row.original),
        })}
        layout={{ card: true }}
        sorting={[{ id: "value", desc: false }]}
        serverSide={false}
      ></DataGridProvider>
    </div>
  );
};

export default RatableEventActionMaster;

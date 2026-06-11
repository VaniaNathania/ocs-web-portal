import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

const MakeBillData = () => {
  const [selectedRows, setSelectedRows] = useState<any>([]);

  const column = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.transaction,
        id: "transaction",
        header: ({ column }) => <DataGridColumnHeader className="" title="Transaction No." column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.accNbr,
        id: "accNbr",
        header: ({ column }) => <DataGridColumnHeader className="" title="Service Number" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.accNbr,
        id: "accNbr",
        header: ({ column }) => <DataGridColumnHeader className="" title="Account Number" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.accountItemType,
        id: "accountItemType",
        header: ({ column }) => <DataGridColumnHeader className="" title="Account Item Type" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.charge,
        id: "charge",
        header: ({ column }) => <DataGridColumnHeader className="" title="Charge" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.state,
        id: "state",
        header: ({ column }) => <DataGridColumnHeader className="" title="State" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.stateDate,
        id: "stateDate",
        header: ({ column }) => <DataGridColumnHeader className="" title="State Date" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  return (
    <div className="my-4 h-[300px]">
      <DataGridProvider<any>
        // key={`grid-resource-${accountBalanceDatas}-${refreshKey}`}
        data={[]}
        pagination={{ size: 5 }}
        sorting={[{ id: "accNbr", desc: false }]}
        // toolbar={<ListToolBar />}
        layout={{ card: true }}
        columns={column}
        serverSide={false}
        // onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => doGetListData(pageIndex + 1, pageSize, sorting, columnFilters)}
        getRowProps={(row) => ({
          className: row.original.balId === selectedRows?.balId ? selectedRowHighLight : nonSelectedRowHighLight,
          onClick: () => setSelectedRows(row.original),
        })}
      >
        {/* <DataGridTable /> */}
      </DataGridProvider>
    </div>
  );
};

export default MakeBillData;

import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DatasProps } from "../interface/interface";
import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { datas } from "../mockDatas/mockDatas";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { useSimcardProfileContext } from "../hooks/SimcardProfileContext";
import ServiceNbrDetail from "./ServiceNbrDetail";

const SimcardProfileTable = () => {
  const { selectedRow, setSelectedRow } = useSimcardProfileContext();
  const [isOpenServiceNbrDetail, setIsOpenServiceNbrDetail] = useState<boolean>(false);

  const handleRowClick = (item: DatasProps) => {
    console.log(item, "item");
    setSelectedRow(item);
  };

  const columns = useMemo<ColumnDef<DatasProps>[]>(
    () => [
      {
        id: "iccid",
        accessorFn: (row) => row.iccid,
        header: ({ column }) => <DataGridColumnHeader column={column} className="" title="ICCID" />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "imsi",
        accessorFn: (row) => row.imsi,
        header: ({ column }) => <DataGridColumnHeader column={column} className="" title="IMSI" />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "simTypeName",
        accessorFn: (row) => row.simTypeName,
        header: ({ column }) => <DataGridColumnHeader column={column} className="" title="Sim Card Type" />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "simStateName",
        accessorFn: (row) => row.simStateName,
        header: ({ column }) => <DataGridColumnHeader column={column} className="" title="State" />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "areaName",
        accessorFn: (row) => row.areaName,
        header: ({ column }) => <DataGridColumnHeader column={column} className="" title="Telecom Region" />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "hlrName",
        accessorFn: (row) => row.hlrName,
        header: ({ column }) => <DataGridColumnHeader column={column} className="" title="Primary NE" />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "orgName",
        accessorFn: (row) => row.orgName,
        header: ({ column }) => <DataGridColumnHeader column={column} className="" title="Organization" />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "isBindingFlag",
        accessorFn: (row) => (row.isBindingFlag === "Y" ? "Yes" : "No"),
        header: ({ column }) => <DataGridColumnHeader column={column} className="text-center" title="Bound" />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "simCardId",
        accessorFn: (row) => row.simCardId,
        header: ({ column }) => <DataGridColumnHeader column={column} className="text-center" title="Bound Number" />,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const simCardId = row.original.simCardId;

          return (
            <div onClick={() => setIsOpenServiceNbrDetail(true)} className="cursor-pointer hover:text-blue-500">
              {simCardId}
            </div>
          );
        },
        meta: {
          headerClassName: "w-2",
          cellClassName: "text-center items-center",
        },
      },
    ],
    [],
  );

  return (
    <div className="flex-1 w-full px-4 py-1">
      <div className="relative border rounded-lg shadow-md h-full pb-5 p-3">
        <DataGridProvider<DatasProps>
          columns={columns}
          //   key={`${queryTrigger}-${refreshTrigger}`}
          data={datas}
          pagination={{ size: 10 }}
          layout={{ card: true }}
          serverSide={false}
          sorting={[{ id: "simCardId", desc: true }]}
          //   onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
          //     const page = pageIndex + 1;
          //     setCurrentPage(page);
          //     if (!queryTrigger || isReset) {
          //       return Promise.resolve({ data: [], totalCount: 0 });
          //     }
          //     return fetchAccNbrDetails({
          //       page,
          //       size: pageSize,
          //       sortBy: sorting?.[0].id,
          //       sortDirection: sorting?.[0].desc ? "DESC" : "ASC",
          //       prefix: "670",
          //       spId: 0,
          //     });
          //   }}
          getRowProps={(row) => ({
            className: row.original.simCardId === selectedRow?.simCardId ? selectedRowHighLight : nonSelectedRowHighLight,
            onClick: () => handleRowClick(row.original),
          })}
        />
      </div>

      <ServiceNbrDetail isOpenServiceNbrDetail={isOpenServiceNbrDetail} setIsOpenServiceNbrDetail={() => setIsOpenServiceNbrDetail(false)} selectedRow={selectedRow} />
    </div>
  );
};

export default SimcardProfileTable;

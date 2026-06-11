import { ColumnDef } from "@tanstack/react-table";

export const ColumnAdvancedSearch = (
  onRowClick: (row: AcctInfo) => void
): ColumnDef<AcctInfo>[] => {
  return [
    {
      accessorKey: "custName",
      header: "Customer Name",
      cell: ({ row }) => (
        <div
          className="cursor-pointer"
          onClick={() => onRowClick(row.original)}
        >
          {row.getValue("custName") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "acctNbr",
      header: "Account Number",
      cell: ({ row }) => (
        <div
          className="font-medium cursor-pointer hover:text-blue-600"
          onClick={() => onRowClick(row.original)}
        >
          {row.getValue("acctNbr")}
        </div>
      ),
    },

    {
      accessorKey: "certNbr",
      header: "Doc Number",
      cell: ({ row }) => (
        <div
          className="cursor-pointer"
          onClick={() => onRowClick(row.original)}
        >
          {row.getValue("certNbr") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "certTypeName",
      header: "Doc Name",
      cell: ({ row }) => (
        <div
          className="cursor-pointer"
          onClick={() => onRowClick(row.original)}
        >
          {row.getValue("certTypeName") ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "billingCycleTypeName",
      header: "Pre-paid/Post-paid",
      cell: ({ row }) => (
        <div
          className="cursor-pointer"
          onClick={() => onRowClick(row.original)}
        >
          {row.getValue("billingCycleTypeName") === "N"
            ? "Post-paid"
            : "Pre-paid"}
        </div>
      ),
    },
    // {
    //   accessorKey: "status",
    //   header: "Status",
    //   cell: ({ row }) => {
    //     const status = row.getValue("status") as string;
    //     const acctStatus = row.original.acctStatus;
    //     const displayStatus = status || acctStatus || "Unknown";

    //     return (
    //       <div
    //         className="cursor-pointer"
    //         onClick={() => onRowClick(row.original)}
    //       >
    //         <div
    //           className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    //             displayStatus?.toLowerCase() === "active"
    //               ? "bg-green-100 text-green-800"
    //               : displayStatus?.toLowerCase() === "inactive"
    //                 ? "bg-red-100 text-red-800"
    //                 : "bg-gray-100 text-gray-800"
    //           }`}
    //         >
    //           {displayStatus}
    //         </div>
    //       </div>
    //     );
    //   },
    // },
  ];
};

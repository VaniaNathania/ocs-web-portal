import {
  DataGridColumnHeader,
  DataGridPagination,
  DataGridProvider,
  DataGridTable,
  KeenIcon,
} from "@/components";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { OfferApply } from "../../../interface";
import { useOfferApply } from "../hooks/context";

const AvailableOffer = () => {
  const { availableOffer, setAvailableOffer, available } = useOfferApply();
  const [search, setSearch] = useState("");

  /* ---------------- selection helpers ---------------- */

  const isAllSelected = (rows: OfferApply[]) =>
    rows.length > 0 &&
    rows.every((row) => availableOffer.some((s) => s.offerId === row.offerId));

  const handleSelectAll = (rows: OfferApply[]) => {
    if (isAllSelected(rows)) {
      setAvailableOffer((prev) =>
        prev.filter((item) => !rows.some((row) => row.offerId === item.offerId))
      );
    } else {
      setAvailableOffer((prev) => {
        const merged = [
          ...prev,
          ...rows.filter((row) => !prev.some((p) => p.offerId === row.offerId)),
        ];
        return merged;
      });
    }
  };

  const handleSelectRow = (row: OfferApply) => {
    setAvailableOffer((prev) =>
      prev.some((p) => p.offerId === row.offerId)
        ? prev.filter((p) => p.offerId !== row.offerId)
        : [...prev, row]
    );
  };

  /* ---------------- filtered data ---------------- */

  const filteredData = useMemo(
    () =>
      available.filter((item) =>
        item.offerName.toLowerCase().includes(search.toLowerCase())
      ),
    [available, search]
  );

  /* ---------------- columns (STABLE) ---------------- */

  const columns = useMemo<ColumnDef<OfferApply>[]>(
    () => [
      {
        accessorKey: "offerId",
        id: "offerId",
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => {
          const rows = table.getFilteredRowModel().rows.map((r) => r.original);

          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={isAllSelected(rows)}
                onChange={() => handleSelectAll(rows)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
          );
        },
        cell: ({ row }) => {
          const data = row.original;
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={availableOffer.some((p) => p.offerId === data.offerId)}
                onChange={() => handleSelectRow(data)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
          );
        },
        meta: {
          headerClassName: "w-[50px] text-center sticky top-0 z-10 bg-gray-100",
          cellClassName: "text-center",
        },
      },
      {
        accessorKey: "offerName",
        id: "offerName",
        enableHiding: false,

        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Offer Name" />
        ),
        // enableSorting: false,
        cell: ({ row }) => <div>{row.original.offerName}</div>,
        meta: {
          headerClassName: "sticky top-0 z-10 bg-gray-100",
        },
      },
      {
        accessorKey: "offerTypeName",
        id: "offerTypeName",
        enableHiding: false,

        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Offer Type" />
        ),
        // enableSorting: false,
        cell: ({ row }) => <div>{row.original.offerTypeName}</div>,
        meta: {
          headerClassName: "sticky top-0 z-10 bg-gray-100",
        },
      },
    ],
    [availableOffer, available]
  ); // 🚨 NO deps

  /* ---------------- render ---------------- */

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 items-center">
        <div className="text-md w-28">
          Available offer {`(${filteredData.length})`}
        </div>
        <div className="input input-sm flex-1 flex items-center gap-2">
          <Input
            placeholder="Offer Name"
            className="border-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <KeenIcon icon="magnifier" />
        </div>
      </div>

      <DataGridProvider
        key={`${filteredData.length}`}
        columns={columns}
        data={filteredData}
        pagination={{ size: filteredData.length }}
        layout={{ card: true }}
        serverSide={false}
      >
        <div className="h-[368px] overflow-y-auto border-2 rounded-md">
          <DataGridTable />
        </div>
        {/* <DataGridPagination /> */}
      </DataGridProvider>
    </div>
  );
};

export default AvailableOffer;

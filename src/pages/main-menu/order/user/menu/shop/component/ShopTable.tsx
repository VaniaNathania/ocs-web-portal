import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { Button } from "@/components/ui/button";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useOrderShop } from "../hooks/shopContext";
import { ShopTableItem } from "@/pages/main-menu/order/models/interfaces";

const ShopTable = () => {
  const [loadingSearch] = useState<boolean>(false);
  const {
    groupedTable,
    selectedShopHeadItem,
    search,
    setShowOrderForm,
    setSelectedTableItem,
    setStep,
  } = useOrderShop();
  const [rows, setRows] = useState<ShopTableItem[]>([]);

  const column = useMemo<ColumnDef<ShopTableItem>[]>(
    () => [
      {
        accessorFn: (row) => row.offerName,
        id: "offerName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Offer Name" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.salePrice,
        id: "salePrice",
        header: ({ column }) => (
          <DataGridColumnHeader title="Sale Price" column={column} />
        ),
        cell: ({ row }) => {
          return (
            <div>
              {!row.original.salePrice || row.original.salePrice === "0" ? (
                <div className="text-sm text-white bg-green-600 w-fit px-3 py-0.5 rounded-md">
                  Free
                </div>
              ) : (
                row.original.salePrice
              )}
            </div>
          );
        },
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.rentListPrice,
        id: "rentListPrice",
        header: ({ column }) => (
          <DataGridColumnHeader title="Rent Price" column={column} />
        ),
        cell: ({ row }) => {
          return (
            <div>
              {!row.original.rentListPrice ||
              row.original.rentListPrice === "0" ? (
                <div className="text-sm text-white bg-green-600 w-fit px-3 py-0.5 rounded-md">
                  Free
                </div>
              ) : (
                row.original.rentListPrice
              )}
            </div>
          );
        },
        enableHiding: false,
        enableSorting: false,
      },
      {
        // accessorFn: (row) => row.orderName,
        id: "Agreement",
        header: ({ column }) => (
          <DataGridColumnHeader title="Agreement" column={column} />
        ),
        cell: ({ row }) => {
          return <div className=""></div>;
        },
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.expDate,
        id: "expDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Expire Date" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },
      {
        // accessorFn: (row) => row.expDate,
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader title="Action" column={column} />
        ),
        cell: ({ row }) => {
          return (
            <Button
              variant={"outline"}
              size={"sm"}
              onClick={() => {
                setStep(0);
                setSelectedTableItem(row.original);
                setShowOrderForm(true);
              }}
            >
              Order
            </Button>
          );
        },
        meta: {
          headerClassName: "flex items-center justify-center",
          cellClassName: "flex items-center justify-center",
        },
        enableHiding: false,
        enableSorting: false,
      },
    ],
    [search],
  );

  useEffect(() => {
    const selectedGroup = groupedTable.find(
      (group) => group.parentCatgId === selectedShopHeadItem?.nodeId,
    );
    // console.log(selectedShopHeadItem, selectedGroup);
    setRows(selectedGroup?.row ?? []);
  }, [selectedShopHeadItem]);

  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      try {
        let processedData: ShopTableItem[] = [...rows];

        // Optional: Apply sorting
        if (sorting && sorting.length > 0) {
          const { id, desc } = sorting[0];
          processedData.sort((a, b) => {
            const aValue = a[id as keyof ShopTableItem];
            const bValue = b[id as keyof ShopTableItem];

            if (!aValue || !bValue) return 0;

            if (typeof aValue === "string" && typeof bValue === "string") {
              return desc
                ? bValue.localeCompare(aValue)
                : aValue.localeCompare(bValue);
            }

            if (aValue < bValue) return desc ? 1 : -1;
            if (aValue > bValue) return desc ? -1 : 1;
            return 0;
          });
        }

        // ✅ Filter first
        const filtered = processedData.filter(
          (item) =>
            item.offerName &&
            item.offerName.toLowerCase().includes(search.toLowerCase()),
        );

        // ✅ Then paginate
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filtered.slice(startIndex, endIndex);

        return {
          data: paginatedData,
          totalCount: filtered.length, // ✅ correct total
        };
      } catch (error) {
        toast.error("❌ Failed to fetch feature data");
        return { data: [], totalCount: 0 };
      }
    },
    [rows, search],
  );

  return (
    <div>
      <div className="flex flex-col gap-2 relative">
        {loadingSearch && <Loading />}
        <div className="">
          {/* {(isLoading || isExpanding) && <Loading />} */}
          <DataGridProvider
            key={`available-features-grid-${search}`}
            columns={column}
            pagination={{ size: 5 }}
            layout={{ card: true }}
            sorting={[{ id: "custName", desc: false }]}
            serverSide={true}
            data={rows}
            onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
              return doGetListData(
                pageIndex + 1,
                pageSize,
                sorting,
                columnFilters,
              );
            }}
          >
            {/* <div className="h-[450px] overflow-y-auto w-full border-2">
                    <DataGridTable />
                  </div> */}
          </DataGridProvider>
        </div>
      </div>
    </div>
  );
};

export default ShopTable;

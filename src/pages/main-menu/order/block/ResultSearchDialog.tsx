import React, {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DialogWrapper,
  ParentDialogProps,
} from "../../role-management/generalUseComp";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { Loading } from "../../role-management/block/loadingBlock";
import { useOrder } from "../hooks/orderContext";
import { toast } from "sonner";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { useLoaders } from "@/providers";
import { CustomerInfo } from "../models/interfaces";
import { useOrderLayout } from "@/layouts/main-menu/order";

const SearchResultDialog = ({ isOpen, handleDialog }: ParentDialogProps) => {
  const { setActiveTab } = useOrderLayout();
  const { setScreenLoader } = useLoaders();
  const [selectedRow, setSelectedRow] = useState<CustomerInfo>();
  const {
    searchResult,
    setSearch,
    fetchSearch,
    loadingSearch,
    setSelectedUser,
    selectedUser,
  } = useOrder();

  const column = useMemo<ColumnDef<CustomerInfo>[]>(
    () => [
      {
        accessorFn: (row) => row.custName,
        id: "custName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Customer Name" column={column} />
        ),
        // cell: ({ row }) => {
        //   return (
        //     <Button
        //       variant={"ghost"}
        //       size={"sm"}
        //       // onClick={() => setSelectedRow(row.original)}
        //     >
        //       {row.original.custName}
        //     </Button>
        //   );
        // },
        // meta: {
        //   cellClassName: "m-0 p-0",
        // },
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.certTypeName,
        id: "certTypeName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Doc Type" column={column} />
        ),

        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.certNbr,
        id: "certNbr",
        header: ({ column }) => (
          <DataGridColumnHeader title="Doc Number" column={column} />
        ),

        enableHiding: false,
        enableSorting: false,
      },
    ],
    [searchResult, selectedRow],
  );

  useEffect(() => {
    if (isOpen) fetchSearch();
  }, [isOpen]);

  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      try {
        let processedData = [...searchResult];

        // Optional: Apply sorting
        if (sorting && sorting.length > 0) {
          const { id, desc } = sorting[0];
          processedData.sort((a, b) => {
            const aValue = a[id as keyof CustomerInfo];
            const bValue = b[id as keyof CustomerInfo];

            if (typeof aValue === "string" && typeof bValue === "string") {
              return desc
                ? bValue.localeCompare(aValue)
                : aValue.localeCompare(bValue);
            }
            if (!aValue || !bValue) return 1;

            if (aValue < bValue) return desc ? 1 : -1;
            if (aValue > bValue) return desc ? -1 : 1;
            return 0;
          });
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = processedData.slice(startIndex, endIndex);

        return {
          data: paginatedData,
          totalCount: processedData.length,
        };
      } catch (error) {
        toast.error("❌ Failed to fetch feature data");
        return { data: [], totalCount: 0 };
      }
    },
    [searchResult],
  );

  const setUser = async () => {
    if (!selectedRow) return toast.error("Please select the user first");
    // console.log("Setting user:", selectedRow);
    setSearch("");

    setSelectedUser(selectedRow);
  };

  useEffect(() => {
    if (selectedUser) {
      setScreenLoader(true);
      // console.log("✅ User updated:", selectedUser);
      // navigate("/order-entry/user"); // ✅ Redirect after state update
      setActiveTab("user");
      handleDialog(false);
    }
  }, [selectedUser]);

  return (
    <DialogWrapper
      isOpen={isOpen}
      //   onClose={() => handleDialog(false)}
      title="Select Customer"
      size={{ width: "4xl", height: "" }}
      handleDialog={handleDialog}
    >
      <div className="flex flex-col gap-2 relative">
        {loadingSearch && <Loading />}
        <div className="">
          {/* {(isLoading || isExpanding) && <Loading />} */}
          <DataGridProvider
            // key={`available-features-grid-${search}`}
            columns={column}
            pagination={{ size: 5 }}
            layout={{ card: false }}
            sorting={[{ id: "custName", desc: false }]}
            serverSide={true}
            data={searchResult}
            onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
              return doGetListData(
                pageIndex + 1,
                pageSize,
                sorting,
                columnFilters,
              );
            }}
            getRowProps={(row) => ({
              className:
                row.original.custId === selectedRow?.custId
                  ? selectedRowHighLight
                  : nonSelectedRowHighLight,
              onClick: () => setSelectedRow(row.original),
            })}
          >
            {/* <div className="h-[450px] overflow-y-auto w-full border-2">
              <DataGridTable />
            </div> */}
          </DataGridProvider>
        </div>
        <div className="flex flex-row justify-end gap-2">
          <Button onClick={setUser} size={"sm"}>
            Ok
          </Button>
          <Button
            onClick={() => handleDialog(false)}
            size={"sm"}
            variant={"outline"}
          >
            Cancel
          </Button>
        </div>
      </div>
    </DialogWrapper>
  );
};

export default SearchResultDialog;

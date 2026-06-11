import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import { Loading } from "@/components/common/Loading";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { useSearch } from "../hooks/SearchContext";
import { AcctInfoPayment } from "@/pages/main-menu/payment/interfaces";

const SearchTable = () => {
  const {
    selectedTemp,
    setSelectedTemp,
    rows,
    isLoading,
    setQuery,
    query,
    totalRows,
  } = useSearch();

  const column = useMemo<ColumnDef<AcctInfoPayment>[]>(
    () => [
      {
        accessorFn: (row) => row.custName,
        id: "custName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Customer Name"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.acctNbr,
        id: "acctNbr",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Account Number"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.certNbr,
        id: "certNbr",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Doc Number"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.certTypeName,
        id: "certTypeName",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Doc Type" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      try {
        // mark first load
        // if (!hasFetch.current) {
        //   // console.log("test");

        //   hasFetch.current = true;
        // } else {
        // only update query after first load
        if (limit !== query?.size) {
          // console.log("test");

          setQuery((prev) => ({ ...prev, size: limit }));
        }
        if (page !== query?.page) {
          // console.log("test");

          setQuery((prev) => ({ ...prev, page: page }));
        }

        if (sorting.length > 0) {
          const sortBy = sorting[0].id;
          const sortDirection = sorting[0].desc ? "desc" : "asc";

          if (
            query?.sortBy !== sortBy ||
            query?.sortDirection !== sortDirection
          ) {
            // console.log("test");

            setQuery((prev) => ({ ...prev, sortBy, sortDirection }));
          }
        }
        // }

        // console.log(user);

        return {
          data: rows,
          pageCount: Math.ceil(totalRows / limit),
          totalCount: totalRows,
          hasNextPage: page * limit < totalRows,
          hasPreviousPage: page > 1,
        };
      } catch (err) {
        console.error("❌ Error fetching user data:", err);
        return {
          data: [],
          pageCount: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        };
      }
    },
    [query, rows, totalRows],
  );
  return (
    <div className="flex flex-col gap-2 relative">
      {isLoading && <Loading />}
      <DataGridProvider
        key={`resource-grid-${query}`}
        data={rows}
        // pagination={{ size: query.size, page: query.page }}
        columns={column}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          doGetListData(pageIndex + 1, pageSize, sorting, columnFilters)
        }
        layout={{ card: true }}
        getRowProps={(row) => ({
          className:
            row.original.acctId === selectedTemp?.acctId
              ? selectedRowHighLight
              : nonSelectedRowHighLight,
          onClick: () => setSelectedTemp(row.original),
        })}
      />
    </div>
  );
};

export default SearchTable;

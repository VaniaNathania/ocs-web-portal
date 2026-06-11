import { DataGridColumnHeader, DataGridProvider, DefaultTooltip, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UserMData } from "../hook/UserManagementProvider";
import { useUserManagement } from "../hook/useUserManagemet";
import { Loading } from "../../role-management/block/loadingBlock";
import { UserMTableOps } from "./userMTableOps";
import { ConfirmDialogUser } from "./confirmationDialog";
import { nonSelectedRowHighLight, selectedRowHighLight, selectedRowHigligt } from "@/styles/style";

export const UserManagementTable = () => {
  // const [pageSize, setPageSize] = useState(5);
  const { selectedRow, setSelectedRow, query, user, setQuery, total, loading, showConfirm, setShowConfirm, onConfirm, setOnConfirm, desc, setDesc, fetchUserExport } = useUserManagement();

  const handleSelectRow = (row: UserMData) => {
    if (row.userId !== selectedRow?.userId) setSelectedRow(row);
  };

  const handleExport = () => {
    fetchUserExport();
  };

  const availableColumns = useMemo<ColumnDef<UserMData>[]>(
    () => [
      {
        accessorFn: (row) => row.userName,
        id: "userName",
        header: ({ column }) => <DataGridColumnHeader title="User Name" column={column} />,
        cell: ({ row }) => {
          const isSelected = selectedRow?.userId === row.original.userId;
          return (
            <div
            // onClick={() => handleSelectRow(row.original)}
            // className={`opacity-100 bg-scroll`}
            >
              {row.original.userName}
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "sticky left-0 z-10 bg-gray-50",
          cellClassName: `sticky left-0 z-10 bg-inherit`,
        },
      },
      {
        accessorFn: (row) => row.userType,
        id: "userType",
        header: ({ column }) => <DataGridColumnHeader title="User Type" column={column} />,
        cell: ({ row }) => {
          return <div>{row.original.userType != null ? row.original.userType : "BSS"}</div>;
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.userCode,
        id: "userCode",
        header: ({ column }) => <DataGridColumnHeader title="User Code" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.loginFail,
        id: "loginFail",
        header: ({ column }) => <DataGridColumnHeader title="Login Fail" column={column} />,
        cell: ({ row }) => {
          return <div>{row.original.loginFail}</div>;
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.state,
        id: "state",
        header: ({ column }) => <DataGridColumnHeader title="State" column={column} />,
        cell: ({ row }) => {
          return <div>{row.original.state}</div>;
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.isLocked,
        id: "isLocked",
        header: ({ column }) => <DataGridColumnHeader title="Is Locked" column={column} />,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => <div className="text-gray-600">{row.original.isLocked === "Y" ? "Yes" : "No"}</div>,
      },
      // {
      //   accessorFn: (row) => row.portalName,
      //   id: "portalName",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Default Portal" column={column} />
      //   ),
      //   cell: ({ row }) => {
      //     return <div>{row.original.portalName}</div>;
      //   },
      //   enableSorting: false,
      //   enableHiding: false,
      // },
      {
        accessorFn: (row) => row.userEffDate,
        id: "userEffDate",
        header: ({ column }) => <DataGridColumnHeader title="Effective Date" column={column} />,
        cell: ({ row }) => {
          return <div>{row.original.userEffDate}</div>;
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.userExpDate,
        id: "userExpDate",
        header: ({ column }) => <DataGridColumnHeader title="Expiry Date" column={column} />,
        cell: ({ row }) => {
          return <div>{row.original.userExpDate}</div>;
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "Options",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => <DataGridColumnHeader title="Options" className="text-center" column={column} />,
        cell: ({ row }) => {
          return <UserMTableOps row={row.original} handleConfirm={setOnConfirm} handleDesc={setDesc} handleDialog={setShowConfirm} />;
        },
        meta: {
          headerClassName: "max-w-[150px]",
          cellClassName: "max-w-[150px] flex justify-center items-center",
        },
      },
    ],
    [selectedRow],
  );

  const [tableKey, setTableKey] = useState(0);
  const prevQueryRef = useRef<typeof query>();

  useEffect(() => {
    const prev = prevQueryRef.current;
    if (prev) {
      const isFilterChange = prev.isLocked !== query?.isLocked || prev.userName !== query?.userName || prev.userName !== query?.userName || prev.userType !== query?.userType;

      const isResetToPageOne = query?.page === 1 && prev.page !== 1;
      if (isFilterChange || isResetToPageOne) {
        setTableKey((prev) => prev + 1);
      }
    }

    prevQueryRef.current = query;
  }, [query]);

  const doGetAvailableData = useCallback(
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

          setQuery((prev) => ({ ...prev, page }));
        }

        if (sorting.length > 0) {
          const sortBy = sorting[0].id;
          const sortDirection = sorting[0].desc ? "desc" : "asc";

          if (query?.sortBy !== sortBy || query?.sortDirection !== sortDirection) {
            // console.log("test");

            setQuery((prev) => ({ ...prev, sortBy, sortDirection }));
          }
        }
        // }

        // console.log(user);

        return {
          data: user,
          pageCount: Math.ceil(total / limit),
          totalCount: total,
          hasNextPage: page * limit < total,
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
    [query, user, total],
  );

  const Toolbar = () => {
    return (
      <div className="flex justify-start p-2">
        <DefaultTooltip title="Export Data" placement="top">
          <Button variant={"outline"} size={"sm"} onClick={handleExport}>
            Export
          </Button>
        </DefaultTooltip>
      </div>
    );
  };

  return (
    <div>
      <ConfirmDialogUser isOpen={showConfirm} handleDialog={setShowConfirm} onConfirm={onConfirm} desc={desc} />
      <div className="m-5 rounded-md bg-white p-5 shadow-md overflow-x-auto relative border-2">
        {loading && <Loading />}
        <DataGridProvider
          key={`user-management-grid-${tableKey}`}
          columns={availableColumns}
          pagination={{ size: query?.size || 5 }}
          layout={{ card: false }}
          toolbar={<Toolbar />}
          sorting={[{ id: query?.sortBy || "userName", desc: false }]}
          serverSide={true}
          rowSelection={true}
          getRowProps={(row) => ({
            className: row.original.userId === selectedRow?.userId ? selectedRowHighLight : nonSelectedRowHighLight,
            onClick: () => setSelectedRow((prev) => (prev = row.original)),
          })}
          data={user}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => doGetAvailableData(pageIndex + 1, pageSize, sorting, columnFilters)}
        />
      </div>
    </div>
  );
};

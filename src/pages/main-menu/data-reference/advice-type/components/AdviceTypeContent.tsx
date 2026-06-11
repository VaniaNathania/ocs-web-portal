import {
  DataGridColumnHeader,
  DataGridProvider,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ListToolbar from "../blocks/ListToolbar";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { Button } from "@/components/ui/button";
import { useAdviceTypeContext } from "../hooks/useAdviceTypeContext";
import { Loading } from "@/components/common/Loading";
import { adviceTypeContentProps } from "../hooks/AdviceTypeContext";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const API_URL_REF = apiConfigRef.ref;

const AdviceTypeContent = () => {
  const { GetData } = useCallApi();
  const {
    selectedContent,
    handleSelectedContent,
    selectedChildrenSide,
    selectedSubChildrenSide,
    setShowParameterListContent,
    setShowCopyContent,
    setShowMoveContent,
    setShowDetailContent,
    setContentDetail,
    dataTableContext,
    isLoadingList,
    searchContent,
    appliedSearch,
    isAddingData,
    setIsEditMode,
    menuPrivAccess,
  } = useAdviceTypeContext();

  const tableRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const doGetListDataForTable = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      try {
        let allData = [...dataTableContext];

        if (appliedSearch.trim()) {
          const keyword = appliedSearch.toLocaleLowerCase();
          allData = allData.filter(
            (item) =>
              item.adviceTypeName?.toLocaleLowerCase().includes(keyword) ||
              item.stdCode.toLocaleLowerCase().includes(keyword),
          );
        }

        // if (selectedContent) {
        //   const selectedIndex = allData.findIndex((item) => item.adviceTypeName === selectedContent.adviceTypeName);
        //   if (selectedIndex > -1) {
        //     const [selectedItem] = allData.splice(selectedIndex, 1);
        //     allData.unshift(selectedItem);
        //   }
        // }

        // Client-side pagination
        const startIndex = (page - 1) * limit;
        const paginatedData = allData.slice(startIndex, startIndex + limit);

        return {
          data: paginatedData,
          pageCount: Math.ceil(allData.length / limit),
          totalCount: allData.length,
          hasNextPage: page * limit < allData.length,
          hasPreviousPage: page > 1,
          currentPage: page,
        };
      } catch (error) {
        console.error("Error fetching advice type:", error);
        return {
          data: [],
          pageCount: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          currentPage: 1,
        };
      }
    },
    [dataTableContext, appliedSearch],
  );

  const column = useMemo<ColumnDef<adviceTypeContentProps>[]>(
    () => [
      {
        id: "adviceTypeName",
        accessorFn: (row) => row.adviceTypeName,
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            className=""
            title="Template Name"
          />
        ),
        cell: ({ row }) => {
          const isSelected =
            selectedContent?.adviceTypeName === row.original.adviceTypeName;
          const adviceType = row.original.adviceTypeName;

          return (
            <div
              className={`text-gray-800 cursor-pointer p-2 rounded ${isSelected ? "bg-red-500 text-white font-semibold" : "hover:bg-gray-50"}`}
              onClick={() => {handleSelectedContent(row.original)}}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setShowDetailContent(true);
                setContentDetail("view");
              }}
            >
              {adviceType}
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "stdCode",
        accessorFn: (row) => row.stdCode,
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            className=""
            title="Standard Code"
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "adviceChannelName",
        accessorFn: (row) => row.adviceChannelName,
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            className=""
            title="Message Channel"
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "effTime",
        accessorFn: (row) => row.effTime,
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            className=""
            title="Effective Time"
          />
        ),
        cell: ({ row }) => {
          const effTime = row.original.effTime;
          if (!effTime) return <span className="text-gray-400">-</span>;

          const date = new Date(effTime);
          const formattedDate = date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          const formattedTime = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          return (
            <div className="flex flex-col">
              <span className="text-gray-800 font-medium">{formattedDate}</span>
              <span className="text-gray-500 text-xs">{formattedTime}</span>
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "expTime",
        accessorFn: (row) => row.expTime,
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            className=""
            title="Expiry Time"
          />
        ),
        cell: ({ row }) => {
          const expTime = row.original.expTime;
          if (!expTime) return <span className="text-gray-400">-</span>;

          const date = new Date(expTime);
          const formattedDate = date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          const formattedTime = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          return (
            <div className="flex flex-col">
              <span className="text-gray-800 font-medium">{formattedDate}</span>
              <span className="text-gray-500 text-xs">{formattedTime}</span>
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "disabled",
        accessorFn: (row) => row.disabled,
        header: ({ column }) => (
          <DataGridColumnHeader column={column} className="" title="Disabled" />
        ),
        cell: ({ row }) => {
          const disabled = row.original.disabled;
          const isDisabled = disabled === "Y";

          return (
            <div className="flex items-center justify-center">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${isDisabled ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}
              >
                {isDisabled ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "isHis",
        accessorFn: (row) => row.isHis,
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            className=""
            title="Retain History"
          />
        ),
        cell: ({ row }) => {
          const isHis = row.original.isHis;
          const retainHistory = isHis === "Y";

          return (
            <div className="flex items-center justify-center">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${retainHistory ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}
              >
                {retainHistory ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
      // {
      //   id: "operation",
      //   header: ({ column }) => <DataGridColumnHeader className="text-center" column={column} title="Operation" />,
      //   cell: ({ row }) => {
      //     return (
      //       <div className="flex justify-center">
      //         <DefaultTooltip title="Edit" placement="top">
      //           <Button
      //             variant="ghost"
      //             className="text-lg"
      //             onClick={(e) => {
      //               e.stopPropagation();
      //               handleSelectedContent(row.original);
      //               setIsEditMode(true);
      //               setContentDetail("edit");
      //               setShowDetailContent(true);
      //             }}
      //           >
      //             <KeenIcon icon="notepad-edit" />
      //           </Button>
      //         </DefaultTooltip>
      //         <DefaultTooltip title="Delete" placement="top">
      //           <Button
      //             variant="ghost"
      //             className="text-red-500 text-lg"
      //             onClick={(e) => {
      //               e.stopPropagation();
      //             }}
      //           >
      //             <KeenIcon icon="trash" />
      //           </Button>
      //         </DefaultTooltip>
      //       </div>
      //     );
      //   },
      //   enableSorting: false,
      //   enableHiding: false,
      // },
    ],
    [selectedContent],
  );

  useEffect(() => {
    if (dataTableContext.length > 0 && !isAddingData) {
      handleSelectedContent(dataTableContext[0]);
    }
  }, [dataTableContext, isAddingData]);

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [selectedChildrenSide, selectedSubChildrenSide, appliedSearch]);

  return (
    <div className="flex-1 border-[1px] shadow-md h-full p-3 overflow-y-auto relative">
      <div className="relative" ref={tableRef}>
        <DataGridProvider
          key={refreshKey}
          data={dataTableContext}
          columns={column}
          toolbar={<ListToolbar />}
          layout={{ card: true }}
          pagination={{ size: 10 }}
          serverSide={true}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            return doGetListDataForTable(
              pageIndex + 1,
              pageSize,
              sorting,
              columnFilters,
            );
          }}
        />
        {isLoadingList && (
          <div className="absolute flex items-center justify-center inset-0">
            <Loading />
          </div>
        )}
      </div>

      <div className="flex gap-3 py-3">
        <Button
          variant="default"
          className="text-sm h-8"
          onClick={() => setShowParameterListContent(true)}
          disabled={!selectedContent}
        >
          Parameter List
        </Button>
        <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
          <Button
            variant="outline"
            className="text-sm h-8"
            onClick={() => setShowCopyContent(true)}
            disabled={!selectedContent}
          >
            Copy
          </Button>
        </AccessWrapper>
        <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
          <Button
            variant="outline"
            className="text-sm h-8"
            onClick={() => setShowMoveContent(true)}
            disabled={!selectedContent}
          >
            Move
          </Button>
        </AccessWrapper>
      </div>
    </div>
  );
};

export default AdviceTypeContent;

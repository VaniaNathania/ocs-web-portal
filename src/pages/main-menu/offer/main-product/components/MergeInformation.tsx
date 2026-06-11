import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { Input } from "@/components/ui/input";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

interface props {
  isOpen: boolean;
  handleIsOpen: (open: boolean) => void;
  payload: {
    offerGroupId: number;
  };
  rowData?: any;
}

const API_URL_OFFER = apiConfigOffer.offer;
export const MergeInformation = ({
  isOpen,
  handleIsOpen,
  payload,
  rowData,
}: props) => {
  const { GetData } = useCallApi();

  const subscriptionColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.subsPlanName,
        id: "subsPlanName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Subscription Plan Name"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: (data: any) => {
          const row = data.row.original;
          return (
            <button
              className="font-medium text-left transition-all duration-200 text-red-500 hover:text-blue-800"
              // onClick={() => handleOpenModalSubsPlan(row)}
              title="View Details"
            >
              <div className="flex items-center gap-2">
                <span>{row.subsPlanName}</span>
              </div>
            </button>
          );
        },
      },
      {
        accessorFn: (row) => row.effDate,
        id: "version",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Version" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  );

  const doGetSubscriptionData = useCallback(
    async (
      page: number,
      limit: number,
      sorting: { id: string; desc: boolean }[],
      filter: any
    ) => {
      let sortBy = "offerName";
      let sortDirection = "asc";

      if (sorting.length > 0) {
        sortBy = sorting[0].id;
        sortDirection = sorting[0].desc ? "desc" : "asc";
      }

      // console.log(rowData);

      try {
        const response = await GetData(
          `${API_URL_OFFER}/offer/subs-plan/qry-subs-plan-by-offer-group-id`,
          {
            offerGroupId: payload.offerGroupId,
            page,
            size: limit,
            sortBy,
            sortDirection,
          }
        );

        const data = response?.data;
        const content = data?.content ?? data ?? [];
        const total = data?.totalElements ?? content.length;
        // setTempRow(content);

        return {
          data: content,
          totalCount: total,
        };
      } catch (error) {
        console.error("Error fetching subscription plan:", error);
        toast.error("Gagal mengambil subscription plan");
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [payload, GetData]
  );
  return (
    <DialogWrapper
      isOpen={isOpen}
      handleDialog={handleIsOpen}
      onClose={() => handleIsOpen(false)}
      title="Offer Group Detail"
      size={{ height: "600px", width: "2xl" }}
    >
      <div className="flex flex-col my-5 gap-2">
        <div className="flex flex-col w-1/3 sm:w-1/2">
          <label className="block text-sm font-medium text-gray-700">
            Group Name
          </label>
          <Input
            type="text"
            placeholder="No UserName Selected"
            autoComplete="off"
            className=""
            value={rowData?.offerGroupName}
            disabled={true}
          />
        </div>
        {/* <div className="w-40 h-40 border-2"></div> */}
        <DataGridProvider
          data={[]}
          columns={subscriptionColumns}
          pagination={{ size: 10 }}
          // toolbar={<ListToolbarSubsPlan />}
          layout={{ card: false }}
          sorting={[{ id: "offerName", desc: false }]}
          serverSide={true}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            return doGetSubscriptionData(
              pageIndex + 1,
              pageSize,
              sorting ?? [],
              columnFilters ?? []
            );
          }}
        />
      </div>
    </DialogWrapper>
  );
};

import React, {
  useMemo,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import { DataGridProvider, DataGridColumnHeader } from "@/components";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { KeenIcon } from "@/components";
import { SubscriptionPlanOfferListContext } from "../hooks/SubscriptionPlanOfferListContext";
import DetailCategoryContentSubsPlan from "./DetailCategoryContent/DetailCategoryContentSubsPlan";
import { useSubscriptionPlanOfferListContext } from "../hooks/useSubscriptionPlanOfferListContext";

interface SubscriptionPlanProps {
  subsPlanId?: string;
  indepProdSpecId: number;
  priority?: string;
  saleFlag?: string;
  isBundleFlag?: string;
  spId?: string;
  offerId?: string;
  offerType?: string;
  offerName?: string;
  comments?: string;
  offerCode?: string;
  saleListPrice?: string;
  rentListPrice?: string;
  effDate?: string;
  expDate?: string;
  createdDate?: string;
  state?: string;
  effType?: string;
  expOff?: string;
  timeUnit?: string;
  autoContinueFlag?: string;
  cycleQuantity?: string;
  duplicateFlag?: string;
  offerSpId?: string;
  expTimeUnit?: string;
  agreementEffType?: string;
  salesRuleScript?: string;
  prodType?: string;
}

interface SubscriptionPlanSectionPublicOfferGroupProps {
  rowData?: any;
  offerGroupId?: number;
  onEditSubscriptionPlan?: () => void;
  refresh: number;
}

const API_URL_OFFER = apiConfigOffer.offer;

const SubscriptionPlanSectionPublicOfferGroup = ({
  rowData,
  offerGroupId,
  onEditSubscriptionPlan,
  refresh,
}: SubscriptionPlanSectionPublicOfferGroupProps) => {
  const { GetData } = useCallApi();
  const { handleOpenModalSubsPlan } = useSubscriptionPlanOfferListContext();

  // useEffect(() => {
  // //  console.log("test");
  // }, [offerGroupId]);

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
      // {
      //   accessorFn: (row) => row.cycleQuantity,
      //   id: "agrementPeriod",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader
      //       className=""
      //       title="Agreement Period"
      //       column={column}
      //     />
      //   ),
      //   enableSorting: false,
      //   enableHiding: false,
      // },
      {
        accessorFn: (row) => (row.autoContinueFlag === "Y" ? "Yes" : "No"),
        id: "autoContinueFlag",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Automatic Renewal"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
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
      {
        accessorFn: (row) => (row.saleFlag === "0" ? "Sold Unlimitedly" : ""),
        id: "saleFlag",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Sale Type"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) =>
          `${row.effDate === null ? "" : row.effDate} - ${row.expDate === null ? "" : row.expDate}`,
        id: "validPeriod",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Valid Period"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.effDate,
        id: "effDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Effective Date"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.expDate,
        id: "expDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Expiry Date"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const [subscriptionData, setSubscriptionData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    //  console.log(refresh, offerGroupId, "ini refresh");
    if (!offerGroupId) {
      setSubscriptionData([]);
      setTotalCount(0);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await GetData(
          `${API_URL_OFFER}/offer/subs-plan/qry-subs-plan-by-offer-group-id`,
          {
            offerGroupId,
            page: 1, // default page
            size: 10, // default size
            sortBy: "subsPlanName",
            sortDirection: "asc",
          },
        );

        const data = response?.data;
        const content = data?.content ?? data ?? [];
        const total = data?.totalElements ?? content.length;

        setSubscriptionData(content);
        setTotalCount(total);
      } catch (error) {
        console.error("Error fetching subscription plan:", error);
        toast.error("Gagal mengambil subscription plan");
      }
    };

    fetchData();
  }, [offerGroupId, GetData, refresh]);

  // const doGetSubscriptionData = useCallback(
  //   async (
  //     page: number,
  //     limit: number,
  //     sorting: { id: string; desc: boolean }[],
  //     filter: any
  //   ) => {
  //     let sortBy = "offerName";
  //     let sortDirection = "asc";

  //     if (sorting.length > 0) {
  //       sortBy = sorting[0].id;
  //       sortDirection = sorting[0].desc ? "desc" : "asc";
  //     }

  //   //  console.log("test doget");

  //     try {
  //       const response = await GetData(
  //         `${API_URL_OFFER}/offer/subs-plan/qry-subs-plan-by-offer-group-id`,
  //         {
  //           offerGroupId: offerGroupId,
  //           page,
  //           size: limit,
  //           sortBy,
  //           sortDirection,
  //         }
  //       );

  //       const data = response?.data;
  //       const content = data?.content ?? data ?? [];
  //       const total = data?.totalElements ?? content.length;
  //       // setTempRow(content);

  //       return {
  //         data: content,
  //         totalCount: total,
  //       };
  //     } catch (error) {
  //       console.error("Error fetching subscription plan:", error);
  //       toast.error("Gagal mengambil subscription plan");
  //       return {
  //         data: [],
  //         totalCount: 0,
  //       };
  //     }
  //   },
  //   [offerGroupId]
  // );

  return (
    <div className="pt-2 col-span-full border-t">
      <div className="py-5 pl-3 font-medium text-lg">
        Subscription Plan List
      </div>
      <div className="w-full">
        {/* <DataGridProvider
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
         */}
        <DataGridProvider
          data={subscriptionData}
          columns={subscriptionColumns}
          pagination={{ size: 10 }}
          layout={{ card: false }}
          sorting={[{ id: "subsPlanName", desc: false }]}
        />

        {/* <DetailCategoryContentSubsPlan
          isOpen={showDetailModalSubsPlan}
          onClose={() => setShowDetailModalSubsPlan(false)}
          rowData={detailContent || rowData} // Perbaikan di sini
          category={selectedDetailContent ?? ""}
        /> */}
      </div>
    </div>
  );
};

export default SubscriptionPlanSectionPublicOfferGroup;

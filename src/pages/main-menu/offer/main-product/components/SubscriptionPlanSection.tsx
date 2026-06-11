import React, { useMemo, useCallback, useRef, useState } from "react";
import { DataGridProvider, DataGridColumnHeader } from "@/components";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { dataTagSymbol } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { useNavigate } from "react-router";

interface SubscriptionPlanProps {
  subsPlanId: number;
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

interface SubscriptionPlanSectionProps {
  rowData: any;
}

const API_URL_OFFER = apiConfigOffer.offer;

const subscriptionPlanCache = new Map<
  string,
  {
    data: SubscriptionPlanProps[];
    timestamp: number;
  }
>();

const CACHE_EXPIRY_MS = 5 * 60 * 1000;

const SubscriptionPlanSection: React.FC<SubscriptionPlanSectionProps> = ({
  rowData,
}) => {
  const navigate = useNavigate();
  const { GetData } = useCallApi();
  const { setMoveToSubsPlan, setActiveTab } = useOfferLayout();
  const isFetchingRef = useRef(false);
  const [cacheKey, setCacheKey] = useState(0);

  const handleSubsPlanClick = (subsPlanId: number) => {
    setMoveToSubsPlan((prev) => (prev = { ...prev, subsPlanId }));
  };

  const subscriptionColumns = useMemo<ColumnDef<SubscriptionPlanProps>[]>(
    () => [
      {
        accessorFn: (row) => row.offerName,
        id: "offerName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Subscription Plan Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-700 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                //  console.log("DATA SUBSPLAN", row.original);
                handleSubsPlanClick(row.original.subsPlanId);
                setActiveTab("subs");
                // navigate("/main/offer/subscription-plan");
              }}
            >
              {row.original.offerName}
            </Button>
          );
        },
      },
      {
        accessorFn: (row) => row.cycleQuantity,
        id: "agrementPeriod",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Agreement Period"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
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
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.effDate,
        id: "version",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Version" column={column} />
        ),
        enableSorting: true,
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
        enableSorting: true,
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
        enableSorting: true,
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
        enableSorting: true,
        enableHiding: false,
      },
    ],
    [],
  );

  const isCacheValid = (offerId: string): boolean => {
    const cached = subscriptionPlanCache.get(offerId);
    if (!cached) return false;

    const now = Date.now();
    const isExpired = now - cached.timestamp > CACHE_EXPIRY_MS;

    if (isExpired) {
      // console.log(`🗑️ Cache expired for offerId: ${offerId}`);
      subscriptionPlanCache.delete(offerId);
      return false;
    }

    return true;
  };

  const doGetSubscriptionData = useCallback(
    async (
      page: number,
      limit: number,
      sorting: { id: string; desc: boolean }[],
      filter: any,
    ) => {
      const offerId = rowData?.offerId;

      //  console.log(rowData, "data row offer");

      if (!offerId) {
        console.warn("⚠️ No offerId provided for subscription plan");
        return {
          data: [],
          totalCount: 0,
        };
      }

      const cacheId = `${offerId}`;

      if (isCacheValid(cacheId)) {
        const cached = subscriptionPlanCache.get(cacheId)!;

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedContent = cached.data.slice(startIndex, endIndex);

        return {
          data: paginatedContent,
          totalCount: cached.data.length,
        };
      }
      if (isFetchingRef.current) {
        return {
          data: [],
          totalCount: 0,
        };
      }

      isFetchingRef.current = true;

      let sortBy = "offerName";
      let sortDirection = "asc";

      if (sorting.length > 0) {
        sortBy = sorting[0].id;
        sortDirection = sorting[0].desc ? "desc" : "asc";
      }

      try {
        const response = await GetData(
          `${API_URL_OFFER}/offer/subs-plan/qry-subs-plan-by-indep-prod-id`,
          {
            indepProdSpecId: offerId,
            page: 1,
            size: 1000,
            sortBy,
            sortDirection,
          },
        );

        const data = response?.data;
        const allContent = data?.content ?? data ?? [];
        const total = data?.totalElements ?? allContent.length;

        subscriptionPlanCache.set(cacheId, {
          data: allContent,
          timestamp: Date.now(),
        });

        // console.log(`✅ Cached ${allContent.length} subscription plans for offerId: ${offerId}`);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedContent = allContent.slice(startIndex, endIndex);

        return {
          data: paginatedContent,
          totalCount: total,
        };
      } catch (error) {
        // console.error("❌ Error fetching subscription plan:", error);
        toast.error("Gagal mengambil subscription plan");
        return {
          data: [],
          totalCount: 0,
        };
      } finally {
        isFetchingRef.current = false;
      }
    },
    [rowData?.offerId, GetData],
  );

  return (
    <div className="border-t pt-6 col-span-full">
      <h3 className="text-lg font-semibold mb-4">Subscription Plan</h3>
      <div className="w-full">
        <DataGridProvider
          key={`subscription-grid-${cacheKey}`}
          data={[]}
          columns={subscriptionColumns}
          pagination={{ size: 10 }}
          layout={{ card: false }}
          sorting={[{ id: "offerName", desc: false }]}
          serverSide={true}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            return doGetSubscriptionData(
              pageIndex + 1,
              pageSize,
              sorting ?? [],
              columnFilters ?? [],
            );
          }}
        />
      </div>
    </div>
  );
};

export default SubscriptionPlanSection;

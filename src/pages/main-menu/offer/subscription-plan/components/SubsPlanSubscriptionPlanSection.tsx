import React, { useMemo, useCallback, useContext, useState, useRef, useEffect } from "react";
import { DataGridProvider, DataGridColumnHeader } from "@/components";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { ListToolbarSubsPlan } from "../blocks/ListToolbarSubsPlan";
import { KeenIcon } from "@/components";
import { SubscriptionPlanOfferListContext } from "../hooks/SubscriptionPlanOfferListContext";
import DetailCategoryContentSubsPlan from "./DetailCategoryContent/DetailCategoryContentSubsPlan";
import { useSubscriptionPlanOfferListContext } from "../hooks/useSubscriptionPlanOfferListContext";
import EditDialogSubsPlan from "../blocks/EditDialogSubsPlan";
import DeleteDialogSubsPlan from "../blocks/DeleteDialogSubsPlan";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface SubsPlanSubscriptionPlanProps {
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

interface SubsPlanSubscriptionPlanSectionProps {
  rowData: any;
  onEditSubscriptionPlan?: () => void;
}

const API_URL_OFFER = apiConfigOffer.offer;

const subscriptionPlanCache = new Map<
  string,
  {
    data: SubsPlanSubscriptionPlanProps[];
    timestamp: number;
  }
>();

const CACHE_EXPIRY_MS = 5 * 60 * 1000;

const SubsPlanSubscriptionPlanSection: React.FC<SubsPlanSubscriptionPlanSectionProps> = ({ rowData }) => {
  const {menuPrivAccess} = useOfferLayout()
  const { GetData } = useCallApi();
  const { setSelectedSubSubPlan } = useOfferLayout();
  const context = useContext(SubscriptionPlanOfferListContext);
  const { handleOpenModalSubsPlan, showDetailModalSubsPlan, setShowDetailModalSubsPlan, detailContent, selectedDetailContent, refreshDataGrid, fetchSubscriptionPlans, selectedDetailSideBar, subsPlanRefreshTrigger } = useSubscriptionPlanOfferListContext();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSubsPlan, setSelectedSubsPlan] = useState<{
    subsPlanId: number;
    offerName: string;
  } | null>(null);
  const isFetchingRef = useRef(false);
  const [cacheKey, setCacheKey] = useState(0);
  const offerId = useMemo(() => rowData?.offerId, [rowData?.offerId]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const forceRefetchRef = useRef(false);

  const lastProcessedTriggerRef = useRef(0);

  const saleFlagOptions: Record<string, string> = {
    "0": "Sold Unlimitedly",
    "1": "Sold Separately",
    "2": "Sold in Bundle",
  };

  const subscriptionColumns = useMemo<ColumnDef<SubsPlanSubscriptionPlanProps>[]>(
    () => [
      {
        accessorFn: (row) => row.offerName,
        id: "offerName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Subscription Plan Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: (data: any) => {
          const row = data.row.original;
          return (
            <button className="font-medium text-left transition-all duration-200 text-red-500 hover:text-blue-800" onClick={() => handleOpenModalSubsPlan(row)} title="View Details">
              <div className="flex items-center gap-2">
                <span>{row.offerName}</span>
              </div>
            </button>
          );
        },
      },
      {
        accessorFn: (row) => (row.autoContinueFlag === "Y" ? "Yes" : "No"),
        id: "autoContinueFlag",
        header: ({ column }) => <DataGridColumnHeader className="" title="Automatic Renewal" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => saleFlagOptions[row.saleFlag ?? ""] || "-",
        id: "saleFlag",
        header: ({ column }) => <DataGridColumnHeader title="Sale Type" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.effDate,
        id: "effDate",
        header: ({ column }) => <DataGridColumnHeader className="" title="Effective Date" column={column} />,
        cell: ({ row }) => {
          return <div>{row.original.effDate?.split("T")[0]}</div>;
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.expDate,
        id: "expDate",
        header: ({ column }) => <DataGridColumnHeader className="" title="Expiry Date" column={column} />,
        cell: ({ row }) => {
          return <div>{row.original.expDate?.split("T")[0]}</div>;
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "Options",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => <DataGridColumnHeader title="Options" className="text-center" column={column} />,
        cell: (data: any) => {
          const row = data.row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  setSelectedSubsPlan({
                    subsPlanId: row.subsPlanId,
                    offerName: row.offerName,
                  });
                  setSelectedSubSubPlan(data.row.original);
                  setEditDialogOpen(true);
                }}
                title="Edit"
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                title="Delete"
                onClick={() => {
                  setSelectedSubsPlan({
                    subsPlanId: row.subsPlanId,
                    offerName: row.offerName,
                  });
                  setDeleteDialogOpen(true);
                }}
              >
                <KeenIcon icon="trash" />
              </button>
              </AccessWrapper>
            </div>
          );
        },
        meta: {
          headerClassName: "w-[100px] text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [handleOpenModalSubsPlan],
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
    async (page: number, limit: number, sorting: { id: string; desc: boolean }[], filter: any) => {
      if (!offerId) {
        console.warn("⚠️ No offerId provided");
        return { data: [], totalCount: 0 };
      }

      const cacheId = `${offerId}`;

      // ✅ Check force refetch flag
      const cached = subscriptionPlanCache.get(cacheId);
      const now = Date.now();
      const isCacheExpired = cached ? now - cached.timestamp > CACHE_EXPIRY_MS : true;

      if (isCacheExpired && cached) {
        // console.log(`🗑️ Cache expired for offerId: ${offerId}`);
        subscriptionPlanCache.delete(cacheId);
      }

      // ✅ Use cache only if not force refetch AND cache valid
      const shouldUseCache = !forceRefetchRef.current && cached && !isCacheExpired;

      if (shouldUseCache) {
        // console.log(`📦 Using cached subscription data for offerId: ${offerId} (${cached!.data.length} items)`);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedContent = cached!.data.slice(startIndex, endIndex);

        return {
          data: paginatedContent,
          totalCount: cached!.data.length,
        };
      }

      if (isFetchingRef.current) {
        // console.log("⏳ Already fetching subscription data, skipping...");
        return { data: [], totalCount: 0 };
      }

      // console.log(`🌐 Fetching subscription data from API for offerId: ${offerId} ${forceRefetchRef.current ? "(FORCED)" : ""}`);
      isFetchingRef.current = true;
      setIsRefreshing(true); // ✅ Show loading

      let sortBy = "offerName";
      let sortDirection = "asc";

      if (sorting.length > 0) {
        sortBy = sorting[0].id;
        sortDirection = sorting[0].desc ? "desc" : "asc";
      }

      try {
        const response = await GetData(`${API_URL_OFFER}/offer/subs-plan/qry-subs-plan-by-indep-prod-id`, {
          indepProdSpecId: offerId,
          page: 1,
          size: 1000,
          sortBy,
          sortDirection,
        });

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
        console.error("❌ Error fetching subscription plan:", error);
        toast.error("Gagal mengambil subscription plan");
        return {
          data: [],
          totalCount: 0,
        };
      } finally {
        isFetchingRef.current = false;
        setIsRefreshing(false); // ✅ Hide loading
        forceRefetchRef.current = false; // ✅ Reset force flag
      }
    },
    [offerId, GetData],
  );

  const handleRefresh = useCallback(() => {
    // console.log("🔄 Manual refresh triggered - clearing cache");
    if (offerId) {
      subscriptionPlanCache.delete(`${offerId}`);
      forceRefetchRef.current = true; // ✅ Set force flag
    }
    setCacheKey((prev) => prev + 1);
    refreshDataGrid();
    if (offerId) {
      fetchSubscriptionPlans(offerId.toString());
    }
  }, [offerId, refreshDataGrid, fetchSubscriptionPlans]);

  // ✅ PERBAIKAN: Cek apakah trigger baru sebelum proses
  useEffect(() => {
    // Only process if trigger value changed AND is greater than 0
    if (subsPlanRefreshTrigger > 0 && subsPlanRefreshTrigger !== lastProcessedTriggerRef.current) {
      // console.log(`🎯 SubsPlan: Processing refresh trigger ${subsPlanRefreshTrigger} (last: ${lastProcessedTriggerRef.current})`);

      // Update last processed value BEFORE calling handleRefresh
      lastProcessedTriggerRef.current = subsPlanRefreshTrigger;

      // Call refresh
      handleRefresh();
    }
  }, [subsPlanRefreshTrigger]); // ✅ REMOVE handleRefresh from deps

  const stableFetchData = useCallback(
    (params: { pageIndex: number; pageSize: number; sorting?: any; columnFilters?: any }) => {
      return doGetSubscriptionData(params.pageIndex + 1, params.pageSize, params.sorting ?? [], params.columnFilters ?? []);
    },
    [doGetSubscriptionData],
  );

  return (
    <div className="pt-2 col-span-full">
      <div className="w-full border-t">
        <div className="font-medium text-lg py-5 pl-5">Subscription Plan List</div>
        <DataGridProvider key={`subscription-grid-${cacheKey}`} data={[]} columns={subscriptionColumns} pagination={{ size: 10 }} toolbar={<ListToolbarSubsPlan />} layout={{ card: true }} sorting={[{ id: "offerName", desc: false }]} serverSide={true} onFetchData={stableFetchData} />

        <EditDialogSubsPlan isOpen={editDialogOpen} onClose={() => setEditDialogOpen(false)} subsPlanId={selectedSubsPlan?.subsPlanId ?? null} indepProdSpecId={rowData?.offerId ?? null} onSucces={handleRefresh} category={rowData} />

        <DetailCategoryContentSubsPlan isOpen={showDetailModalSubsPlan} onClose={() => setShowDetailModalSubsPlan(false)} rowData={detailContent || rowData} category={selectedDetailContent ?? ""} onSuccess={handleRefresh} />

        <DeleteDialogSubsPlan isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} subsPlanId={selectedSubsPlan?.subsPlanId ?? null} subsPlanName={selectedSubsPlan?.offerName ?? null} onSuccess={handleRefresh} />
      </div>
    </div>
  );
};

export default SubsPlanSubscriptionPlanSection;

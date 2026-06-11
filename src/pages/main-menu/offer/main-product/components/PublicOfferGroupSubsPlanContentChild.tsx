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

interface SubscriptionPlanSectionPublicOfferGroupProps {
  rowData?: any;
  offerGroupId?: number;
  onEditSubscriptionPlan?: () => void;
}

const API_URL_OFFER = apiConfigOffer.offer;

const SubscriptionPlanSectionPublicOfferGroup = ({
  rowData,
  offerGroupId,
  onEditSubscriptionPlan,
}: SubscriptionPlanSectionPublicOfferGroupProps) => {
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
    []
  );

  const [subscriptionData, setSubscriptionData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // PENTING: useEffect untuk reset dan fetch data ketika offerGroupId berubah
  useEffect(() => {
    // Reset data terlebih dahulu ketika offerGroupId berubah
    setSubscriptionData([]);
    setTotalCount(0);

    if (!offerGroupId) {
      return;
    }

    const fetchData = async () => {
      try {
        const response = await GetData(
          `${API_URL_OFFER}/offer/subs-plan/qry-subs-plan-by-offer-group-id`,
          {
            offerGroupId,
            page: 1,
            size: 10,
            sortBy: "subsPlanName",
            sortDirection: "asc",
          }
        );

        const data = response?.data;
        const content = data?.content ?? data ?? [];
        const total = data?.totalElements ?? content.length;

        setSubscriptionData(content);
        setTotalCount(total);
      } catch (error) {
        console.error("Error fetching subscription plan:", error);
        toast.error("Gagal mengambil subscription plan");
        // Set ke array kosong jika error
        setSubscriptionData([]);
        setTotalCount(0);
      }
    };

    fetchData();
  }, [offerGroupId, GetData]);

  return (
    <div className="pt-2 col-span-full border-t">
      <div className="py-5 pl-3 font-medium text-lg">
        Subscription Plan List
      </div>
      <div className="w-full">
        {subscriptionData.length === 0 && offerGroupId ? (
          <div className="flex items-center justify-center py-10 text-gray-500">
            No data available
          </div>
        ) : (
          <DataGridProvider
            data={subscriptionData}
            columns={subscriptionColumns}
            pagination={{ size: 10 }}
            layout={{ card: false }}
            sorting={[{ id: "subsPlanName", desc: false }]}
          />
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlanSectionPublicOfferGroup;
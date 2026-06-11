import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { Button } from "@/components/ui/button";
// import { ProductBase } from "@/pages/main-menu/order/interfaces";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import {
  prodStateTrackAfter,
  usedResExList,
} from "@/pages/main-menu/order/models/interfaces";
import { prodStateTrackAfterMock } from "../../models/mockData";
import { useSubscriberListContext } from "../../../../../../hooks";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useOrderSubsDetail } from "../../../../hooks/SubsDetailContext";

interface menuItem {
  name: string;
  menu: "company" | "history";
}

const API_URL = apiConfigOrder.order;

const ProdLifeCycleCalcTable = () => {
  const { selectedSubs } = useSubscriberListContext();
  const { GetData } = useCallApi();
  const [rows, setRows] = useState<prodStateTrackAfter[]>([]);
  const { subsBaseDetail } = useOrderSubsDetail();

  const [selectedMenu, setSelectedMenu] = useState<"company" | "history">(
    "company",
  );
  const menuItem: menuItem[] = [
    {
      name: "company",
      menu: "company",
    },
  ];

  const fetchStateSubs = async (): Promise<prodStateTrackAfter[]> => {
    try {
      const resp = await GetData(
        `${API_URL}/api/order-entry/subs-info/querySubsStateCycle`,
        {
          prodId: selectedSubs?.subsId,
          prodCurrState: selectedSubs?.prodState,
          prodState: selectedSubs?.prodState,
          offerId: subsBaseDetail?.data?.offerId,
          acctId: subsBaseDetail.data?.acctId,
        },
      );

      if (!resp.data) {
        toast.error("Failed to fetch state");
        return [];
      }

      return resp.data;
    } catch (error) {
      toast.error("Client Side Error");
      return [];
    }
  };

  const StateSubsList = useQuery({
    queryKey: ["state-subs", selectedSubs],
    queryFn: fetchStateSubs,
    refetchOnWindowFocus: false,
  });

  const column = useMemo<ColumnDef<prodStateTrackAfter>[]>(
    () => [
      {
        accessorFn: (row) => row.nextStateName,
        id: "nextStateName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="State Name"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.nextStateDate,
        id: "nextStateDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="State Date"
            column={column}
          />
        ),
        cell: ({ row }) => (
          <div>{row.original.nextStateDate.split("T")[0]}</div>
        ),

        enableSorting: false,
        enableHiding: false,
      },
    ],
    [selectedMenu],
  );

  return (
    <div className="flex flex-col gap-2">
      {/* <div className="flex flex-row gap-2">
        {menuItem.map((menu, index) => (
          <div
            className={`whitespace-nowrap py-2 ${selectedMenu === menu.menu ? highlighted : nonHighlighted}`}
            key={index}
            onClick={() => setSelectedMenu(menu.menu)}
          >
            {menu.name}
          </div>
        ))}
      </div> */}
      <DataGridProvider
        key={`state-grid-${selectedMenu}`}
        data={StateSubsList.data}
        columns={column}
        serverSide={false}
      />
    </div>
  );
};

export default ProdLifeCycleCalcTable;

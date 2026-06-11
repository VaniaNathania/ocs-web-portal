import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { Button } from "@/components/ui/button";
// import { ProductBase } from "@/pages/main-menu/order/interfaces";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { useOrderSubsDetailSubsInfo } from "../../hooks/SubsDetailSubsInfoContext";
import { highlighted, nonHighlighted } from "../../../../blocks/menu";
import { usedResExList } from "@/pages/main-menu/order/models/interfaces";
import { useCallApi } from "@/hooks";
import { useSubscriberListContext } from "../../../../../../hooks";
import { apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface menuItem {
  name: string;
  menu: "resource" | "history";
}

const API_URL = apiConfigOrder.order;

const ResourceTable = () => {
  const [selectedMenu, setSelectedMenu] = useState<"resource" | "history">(
    "resource",
  );
  const { GetData } = useCallApi();
  const { selectedSubs } = useSubscriberListContext();

  const fetchResSubs = async (): Promise<usedResExList[]> => {
    try {
      const resp = await GetData(
        `${API_URL}/api/order-entry/used-res/qry-used-res-by-subs-id`,
        { subsId: selectedSubs?.subsId },
      );

      if (!resp.status) {
        toast.error(resp.message);
        return [];
      }

      return resp.data;
    } catch (error) {
      toast.error("Client Side Error");
      return [];
    }
  };

  const ResSubsList = useQuery({
    queryKey: ["res-subs", selectedSubs],
    queryFn: fetchResSubs,
    refetchOnWindowFocus: false,
  });

  const menuItem: menuItem[] = [
    {
      name: "Resource",
      menu: "resource",
    },
  ];

  const column = useMemo<ColumnDef<usedResExList>[]>(
    () => [
      {
        accessorFn: (row) => row.resTypeName,
        id: "resTypeName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Resource Type"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.resNbr,
        id: "resNbr",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Source Number"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.createdDate,
        id: "createdDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Resource Date"
            column={column}
          />
        ),
        cell: ({ row }) => <div>{row.original.createdDate.split("T")[0]}</div>,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [selectedMenu],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        {menuItem.map((menu, index) => (
          <div
            className={`whitespace-nowrap py-2 ${selectedMenu === menu.menu ? highlighted : nonHighlighted}`}
            key={index}
            onClick={() => setSelectedMenu(menu.menu)}
          >
            {menu.name}
          </div>
        ))}
      </div>
      <DataGridProvider
        key={`resource-grid-${selectedMenu}`}
        data={ResSubsList.data}
        columns={column}
        serverSide={false}
      />
    </div>
  );
};

export default ResourceTable;

import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { Button } from "@/components/ui/button";
// import { any } from "@/pages/main-menu/order/interfaces";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { useOrderSubsDetailSubsInfo } from "../../hooks/SubsDetailSubsInfoContext";
import { highlighted, nonHighlighted } from "../../../../blocks/menu";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useSubscriberListContext } from "../../../../../../hooks";
import { apiConfigOrder } from "@/config/api.config";
import { useQuery } from "@tanstack/react-query";

interface menuItem {
  name: string;
  menu: "goods" | "history";
}

const API_URL = apiConfigOrder.order;

const GoodsTable = () => {
  const { selectedSubs } = useSubscriberListContext();
  const { GetData } = useCallApi();
  const [rows, setRows] = useState<any[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<"goods" | "history">(
    "goods",
  );

  const fetchGoodsData = async (): Promise<any[]> => {
    try {
      const resp = await GetData(
        `${API_URL}/api/order-entry/goods-prod-spec/qrySubsGoodsInstHis`,
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

  const goodsQuery = useQuery({
    queryKey: ["goods-table", selectedSubs?.subsId, selectedMenu],
    queryFn: fetchGoodsData,
    enabled: !!selectedSubs?.subsId,
    refetchOnWindowFocus: false,
  });

  const menuItem: menuItem[] = [
    {
      name: "Goods",
      menu: "goods",
    },
  ];

  const column = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.goodsName,
        id: "goodsName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Goods Name"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.quantity,
        id: "quantity",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Unit" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.seq,
        id: "seq",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Goods Sequence"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.comments,
        id: "comments",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Comments" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        // accessorFn: (row) => row.agreementExpDate,
        id: "feature",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Feature" column={column} />
        ),
        cell: ({ row }) => {
          return (
            <div>
              <Button size={"sm"} variant={"outline"}>
                Detail
              </Button>
            </div>
          );
        },
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
        key={`goods-grid-${selectedMenu}`}
        data={goodsQuery.data}
        columns={column}
        serverSide={false}
      />
    </div>
  );
};

export default GoodsTable;

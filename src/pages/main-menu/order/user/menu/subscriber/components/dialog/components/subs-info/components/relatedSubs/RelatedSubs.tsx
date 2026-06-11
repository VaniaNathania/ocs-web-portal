import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { Button } from "@/components/ui/button";
// import { ProductBase } from "@/pages/main-menu/order/interfaces";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { useOrderSubsDetailSubsInfo } from "../../hooks/SubsDetailSubsInfoContext";
import { highlighted, nonHighlighted } from "../../../../blocks/menu";
import { RelationSubsList } from "../../../../models/interfaces";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { useSubscriberListContext } from "../../../../../../hooks";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface menuItem {
  name: string;
  menu: "related" | "history";
}

const API_URL = apiConfigOrder.order;

const RelatedTable = () => {
  // const { detail } = useOrderSubsDetailSubsInfo();
  // const [rows, setRows] = useState<any[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<"related" | "history">(
    "related",
  );
  const { GetData } = useCallApi();
  const { selectedSubs } = useSubscriberListContext();

  const fetchRelaSubs = async (): Promise<RelationSubsList[]> => {
    try {
      const resp = await GetData(
        `${API_URL}/api/order-entry/subs-info/qry-rela-subs`,
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

  const RelaSubsList = useQuery({
    queryKey: ["rela-subs", selectedSubs],
    queryFn: fetchRelaSubs,
    refetchOnWindowFocus: false,
  });

  const menuItem: menuItem[] = [
    {
      name: "Related",
      menu: "related",
    },
  ];

  const column = useMemo<ColumnDef<RelationSubsList>[]>(
    () => [
      {
        accessorFn: (row) => row.sourceAccNbr,
        id: "sourceAccNbr",
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
        accessorFn: (row) => row.relaAccNbr,
        id: "relaAccNbr",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Related Number"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.bindTypeName,
        id: "bindTypeName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Related Type"
            column={column}
          />
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
        key={`Related-grid-${selectedMenu}`}
        data={RelaSubsList.data}
        columns={column}
        serverSide={false}
      />
    </div>
  );
};

export default RelatedTable;

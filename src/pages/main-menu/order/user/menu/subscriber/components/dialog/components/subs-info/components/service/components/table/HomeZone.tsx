import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { highlighted, nonHighlighted } from "../../../../../../blocks/menu";
import { HomeZoneOrderDto } from "../../models/interfaces";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { useSubscriberListContext } from "@/pages/main-menu/order/user/menu/subscriber/hooks";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface MenuItem {
  name: string;
  menu: "main" | "history";
}

const API_URL = apiConfigOrder.order;

const HomeZoneTable = () => {
  const { selectedSubs } = useSubscriberListContext();
  const { GetData } = useCallApi();

  const [selectedMenu, setSelectedMenu] = useState<"main" | "history">("main");

  const fetchHomeZone = async (): Promise<HomeZoneOrderDto[]> => {
    try {
      // 🔹 MAIN
      if (selectedMenu === "main") {
        const resp = await GetData(
          `${API_URL}/api/order-entry/subs-info/qrySubsHomeZone`,
          { subsId: selectedSubs?.subsId },
        );

        if (!resp.status) {
          toast.error(resp.message);
          return [];
        }

        return resp.data ?? [];
      }

      // 🔹 HISTORY
      const resp = await GetData(
        `${API_URL}/api/order-entry/subs-info/qryGeoHomeZoneListBySubsId`,
        { subsId: selectedSubs?.subsId },
      );

      if (!resp.status) {
        toast.error(resp.message);
        return [];
      }

      return resp.data ?? [];
    } catch (error) {
      toast.error("Client Side Error");
      return [];
    }
  };

  const homeZoneQuery = useQuery({
    queryKey: ["home-zone", selectedSubs?.subsId, selectedMenu],
    queryFn: fetchHomeZone,
    enabled: !!selectedSubs?.subsId,
    refetchOnWindowFocus: false,
  });

  const menuItems: MenuItem[] = [
    { name: "Home Zone", menu: "main" },
    { name: "Home Zone History", menu: "history" },
  ];

  const columns = useMemo<ColumnDef<HomeZoneOrderDto>[]>(
    () => [
      {
        accessorFn: (row) => row.geoHomeZoneName,
        id: "geoHomeZoneName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Home Zone Name" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.comments,
        id: "comments",
        header: ({ column }) => (
          <DataGridColumnHeader title="Remarks" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-2">
      {/* MENU */}
      <div className="flex flex-row gap-2">
        {menuItems.map((menu) => (
          <div
            key={menu.menu}
            className={`whitespace-nowrap py-2 cursor-pointer ${
              selectedMenu === menu.menu ? highlighted : nonHighlighted
            }`}
            onClick={() => setSelectedMenu(menu.menu)}
          >
            {menu.name}
          </div>
        ))}
      </div>

      {/* TABLE */}
      <DataGridProvider
        key={`home-zone-${selectedMenu}`}
        data={homeZoneQuery.data ?? []}
        columns={columns}
        serverSide={false}
      />
    </div>
  );
};

export default HomeZoneTable;

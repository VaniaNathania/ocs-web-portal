import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { highlighted, nonHighlighted } from "../../../../../../blocks/menu";
import { useQuery } from "@tanstack/react-query";
import { FellowNbrOrderDto } from "../../models/interfaces";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { useSubscriberListContext } from "@/pages/main-menu/order/user/menu/subscriber/hooks";

interface MenuItem {
  name: string;
  menu: "main" | "history";
}

const API_URL = apiConfigOrder.order;

const FellowNumberTable = () => {
  const { selectedSubs } = useSubscriberListContext();
  const { GetData } = useCallApi();

  const [selectedMenu, setSelectedMenu] = useState<"main" | "history">("main");

  const fetchFellowNumber = async (): Promise<FellowNbrOrderDto[]> => {
    try {
      // 🔹 MAIN
      if (selectedMenu === "main") {
        const resp = await GetData(
          `${API_URL}/api/order-entry/fellow-nbr/qry-fellow-nbr`,
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
        `${API_URL}/api/order-entry/fellow-nbr/qry-family-number-history`,
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

  const fellowNbrQuery = useQuery({
    queryKey: ["fellow-number", selectedSubs?.subsId, selectedMenu],
    queryFn: fetchFellowNumber,
    enabled: !!selectedSubs?.subsId,
    refetchOnWindowFocus: false,
  });

  const menuItems: MenuItem[] = [
    { name: "Fellow Number", menu: "main" },
    { name: "Fellow Number History", menu: "history" },
  ];

  const columns = useMemo<ColumnDef<FellowNbrOrderDto>[]>(
    () => [
      {
        accessorFn: (row) => row.fellowNbr,
        id: "fellowNbr",
        header: ({ column }) => (
          <DataGridColumnHeader title="Fellow Number" column={column} />
        ),
      },
      {
        accessorFn: (row) => row.fellowNbrTypeName,
        id: "fellowNbrTypeName",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Fellow Number Type Name"
            column={column}
          />
        ),
      },
      {
        accessorFn: (row) => row.effDate,
        id: "effDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Effective Date" column={column} />
        ),
      },
      {
        accessorFn: (row) => row.expDate,
        id: "expDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Expiry Date" column={column} />
        ),
      },
      {
        accessorFn: (row) => row.valid,
        id: "valid",
        header: ({ column }) => (
          <DataGridColumnHeader title="Valid" column={column} />
        ),
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
        data={fellowNbrQuery.data ?? []}
        columns={columns}
        serverSide={false}
      />
    </div>
  );
};

export default FellowNumberTable;

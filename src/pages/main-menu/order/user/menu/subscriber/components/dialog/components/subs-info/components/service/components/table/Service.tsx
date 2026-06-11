import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { Button } from "@/components/ui/button";
import { ProductBase } from "@/pages/main-menu/order/models/interfaces";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { highlighted, nonHighlighted } from "../../../../../../blocks/menu";
import { useCallApi } from "@/hooks";
import { useSubscriberListContext } from "@/pages/main-menu/order/user/menu/subscriber/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface MenuItem {
  name: string;
  menu: "service" | "history";
}

const API_URL = apiConfigOrder.order;

const ServiceTable = () => {
  const { selectedSubs } = useSubscriberListContext();
  const { GetData } = useCallApi();

  const [selectedMenu, setSelectedMenu] = useState<"service" | "history">(
    "service",
  );

  const fetchServiceData = async (): Promise<ProductBase[]> => {
    try {
      // 🔹 ACTIVE SERVICE
      if (selectedMenu === "service") {
        const resp = await GetData(
          `${API_URL}/api/order-entry/subs-upp/qrySubsUppInstApi`,
          {
            subsId: selectedSubs?.subsId,
            state: "A",
          },
        );
        const respDepend = await GetData(
          `${API_URL}/api/order-entry/prod/qrySubsDependProd`,
          {
            indepProdId: selectedSubs?.subsId,
            prodState: "A",
          },
        );

        if (!resp.status || !respDepend.status) {
          toast.error("Error fetching data service");
          return [];
        }

        return [...(resp.data ?? []), ...(respDepend.data ?? [])];
      }

      // 🔹 SERVICE HISTORY
      const resp = await GetData(
        `${API_URL}/api/order-entry/prod/qry-VAS-His`,
        { subsId: selectedSubs?.subsId },
      );

      if (!resp.status) {
        toast.error(resp.message);
        return [];
      }

      return [
        ...(resp.data?.dependProdList ?? []),
        ...(resp.data?.subsUppInstList ?? []),
      ];
    } catch (error) {
      toast.error("Client Side Error");
      return [];
    }
  };

  const serviceQuery = useQuery({
    queryKey: ["service-table", selectedSubs?.subsId, selectedMenu],
    queryFn: fetchServiceData,
    enabled: !!selectedSubs?.subsId,
    refetchOnWindowFocus: false,
  });

  const menuItems: MenuItem[] = [
    { name: "Service", menu: "service" },
    { name: "Service History", menu: "history" },
  ];

  const columns = useMemo<ColumnDef<ProductBase>[]>(
    () => [
      {
        accessorFn: (row) => row.offerName,
        id: "offerName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Offer Name" column={column} />
        ),
      },
      {
        accessorFn: (row) => row.effDate ?? row.createdDate,
        id: "effDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Effective Date" column={column} />
        ),
        cell: ({ row }) => (
          <div>
            {(row.original.effDate ?? row.original.createdDate)
              ?.split(".")[0]
              .replace("T", " ")}
          </div>
        ),
        sortingFn: "datetime",
      },
      {
        accessorFn: (row) => row.expDate,
        id: "expDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Expiry Date" column={column} />
        ),
        cell: ({ row }) => (
          <div>{row.original.expDate?.split(".")[0].replace("T", " ")}</div>
        ),
        sortingFn: "datetime",
      },
      {
        accessorFn: (row) => row.updateDate,
        id: "updateDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Update Date" column={column} />
        ),
        cell: ({ row }) => (
          <div>{row.original.updateDate?.split(".")[0].replace("T", " ")}</div>
        ),
        sortingFn: "datetime",
      },
      {
        accessorFn: (row) => row.state,
        id: "state",
        header: ({ column }) => (
          <DataGridColumnHeader title="State" column={column} />
        ),
      },
      {
        accessorFn: (row) => row.agreementEffDate,
        id: "agreementEffDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Agreement Effective Date"
            column={column}
          />
        ),
        sortingFn: "datetime",
      },
      {
        accessorFn: (row) => row.agreementExpDate,
        id: "agreementExpDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Agreement Expiry Date" column={column} />
        ),
      },
      // {
      //   id: "feature",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Feature" column={column} />
      //   ),
      //   cell: () => (
      //     <Button size="sm" variant="outline">
      //       Detail
      //     </Button>
      //   ),
      // },
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
        data={serviceQuery.data ?? []}
        columns={columns}
        serverSide={false}
      />
    </div>
  );
};

export default ServiceTable;

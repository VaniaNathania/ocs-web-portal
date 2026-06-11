import { DataGridColumnHeader, DataGridProvider } from "@/components";
// import { ProductBase } from "@/pages/main-menu/order/interfaces";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { useCallApi } from "@/hooks";
import { useSubscriberListContext } from "../../../../../../hooks";
import { BcMemberQueryResultDto } from "../../models/interfaces";
import { apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface menuItem {
  name: string;
  menu: "company" | "history";
}

const API_URL = apiConfigOrder.order;

const CompanyTable = () => {
  const [selectedMenu, setSelectedMenu] = useState<"company" | "history">(
    "company",
  );

  const { GetData } = useCallApi();
  const { selectedSubs } = useSubscriberListContext();

  const fetchCompSubs = async (): Promise<BcMemberQueryResultDto[]> => {
    try {
      const resp = await GetData(
        `${API_URL}/api/order-entry/subs-info/qry-bc-member-list`,
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

  const CompSubsList = useQuery({
    queryKey: ["Comp-subs", selectedSubs],
    queryFn: fetchCompSubs,
    refetchOnWindowFocus: false,
  });

  const menuItem: menuItem[] = [
    {
      name: "company",
      menu: "company",
    },
  ];

  const column = useMemo<ColumnDef<BcMemberQueryResultDto>[]>(
    () => [
      {
        accessorFn: (row) => row.memberCustName,
        id: "memberCustName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Customer Name"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.memberAcctName,
        id: "memberAcctName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Account Name"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.bcMemberTypeName,
        id: "bcMemberTypeName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Member Type Name"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.acctId,
        id: ".acctId",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Account Balance"
            column={column}
          />
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
        key={`company-grid-${selectedMenu}`}
        data={CompSubsList.data}
        columns={column}
        serverSide={false}
      />
    </div>
  );
};

export default CompanyTable;

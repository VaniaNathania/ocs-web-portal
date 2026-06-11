import { KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrderListContext } from "../hooks";
import { useEffect } from "react";
import { defaultOrderQuery } from "../models/mock";

const ListToolBar = () => {
  const { totalRows, table, setColumnFilters } = useDataGrid();
  const { setShowSearch, setRefreshKey, orderItemQuery, setOrderItemQuery } =
    useOrderListContext();

  // useEffect(() => {
  // //  console.log("log query", orderItemQuery);

  //   table
  //     .getColumn("orderState")
  //     ?.setFilterValue(orderItemQuery.state?.split(","));
  //   table.getColumn("accNbr")?.setFilterValue(orderItemQuery.accNbr);
  //   table.getColumn("offerName")?.setFilterValue(orderItemQuery.offerName);
  //   table.getColumn("orderNbr")?.setFilterValue(orderItemQuery.orderNbr);
  //   table.getColumn("subsEventId")?.setFilterValue(orderItemQuery.subsEventId);
  //   // table.getColumn("orgId")?.setFilterValue(orderItemQuery.orgId);
  //   table
  //     .getColumn("createdDate")
  //     ?.setFilterValue(orderItemQuery.startDate?.split("T")[0]);
  // }, [orderItemQuery]);

  return (
    <div className="flex flex-row justify-between p-5 items-center">
      <div className="flex flex-row gap-2 items-center">
        <div>All</div>
        <span className="text-primary">{totalRows}</span>
        <Button
          variant={"outline"}
          size={"sm"}
          onClick={() => {
            setOrderItemQuery(defaultOrderQuery);
            setRefreshKey((prev) => prev + 1);
          }}
        >
          <KeenIcon icon="arrows-circle" />
        </Button>
      </div>
      <div className="flex flex-row gap-2">
        <div className="input input-sm">
          <Input
            placeholder="Order Number"
            size={"sm"}
            className="p-0 border-none"
          />
          <Button className="h-fit p-0" variant={"ghost"}>
            <KeenIcon icon="magnifier" />
          </Button>
        </div>
        <Button
          variant={"outline"}
          size={"sm"}
          onClick={() => setShowSearch(true)}
        >
          <KeenIcon icon="double-right" />
        </Button>
      </div>
    </div>
  );
};

export default ListToolBar;

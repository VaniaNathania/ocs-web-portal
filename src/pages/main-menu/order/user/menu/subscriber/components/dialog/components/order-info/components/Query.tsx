import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { mockOrderState, mockSubsEvent } from "../mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderSubsDetailOrderInfo } from "../hooks/SubsDetailOrderInfoContext";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { SubsEventList } from "@/pages/main-menu/data-reference/event/hooks/EventContext";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import {
  OrderQuery,
  orderState,
} from "@/pages/main-menu/order/user/menu/order/models/interfaces";
import { defaultOrderQuery } from "@/pages/main-menu/order/user/menu/order/models/mock";

const API_REF = apiConfigRef.ref;

const Query = () => {
  const { table, setColumnFilters } = useDataGrid();
  const { orderItemQuery, setOrderItemQuery } = useOrderSubsDetailOrderInfo();
  const { GetData } = useCallApi();
  const [tempQuery, setTempQuery] = useState<OrderQuery>(defaultOrderQuery);

  // useEffect(() => {
  //   // console.log("log query", orderItemQuery);

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

  const fetchSubsEvent = async () => {
    try {
      const resp = await GetData(`${API_REF}/api/event/qry-subs-event-list`, {
        sortBy: "SUBS_EVENT_ID",
        sortDirection: "asc",
      });

      if (!resp.status) {
        toast.error(resp.message ?? "Failed to fetch");
        return resp.data;
      }
      return resp.data;
    } catch (error) {
      toast.error("Error");
      return [];
    }
  };

  const subsEvent: UseQueryResult<SubsEventList[], Error> = useQuery({
    queryKey: ["Order-Search"],
    queryFn: () => fetchSubsEvent(),
    refetchOnWindowFocus: false,
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5">
      <BuildFormRow label="Order Number">
        <div className="input input-sm">
          <Input
            // type="number"
            className="border-none p-0"
            placeholder="Search Order Number"
            value={(tempQuery.orderNbr ?? "").toString()}
            onChange={(e) =>
              setTempQuery((prev) => ({
                ...prev,
                orderNbr:
                  Number(e.target.value) > 0 ? Number(e.target.value) : null,
              }))
            }
          />
        </div>
      </BuildFormRow>
      <BuildFormRow label="Service Number">
        <div className="input input-sm">
          <Input
            className="border-none p-0"
            placeholder="Search Service Number"
            value={tempQuery.accNbr ?? ""}
            onChange={(e) =>
              setTempQuery((prev) => ({
                ...prev,
                accNbr: e.target.value,
              }))
            }
          />
        </div>
      </BuildFormRow>
      <BuildFormRow label="Subscription Event">
        <div className="input input-sm">
          <Select
            value={
              tempQuery.subsEventId ? tempQuery.subsEventId.toString() : ""
            }
            onValueChange={(val) =>
              setTempQuery((prev) => ({
                ...prev,
                subsEventId: Number(val),
              }))
            }
          >
            <SelectTrigger className="border-none bg-transparent p-0">
              <SelectValue placeholder="Select Subscription Event" />
            </SelectTrigger>
            <SelectContent>
              {subsEvent.data?.map((item) => (
                <SelectItem
                  value={item.subsEventId.toString()}
                  key={item.subsEventId}
                >
                  {item.eventName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!!tempQuery.subsEventId && (
            <Button
              size={"sm"}
              variant={"ghost"}
              className="h-fit p-0"
              onClick={() =>
                setTempQuery((prev) => ({
                  ...prev,
                  subsEventId: undefined,
                }))
              }
            >
              <KeenIcon icon="cross" />
            </Button>
          )}
        </div>
      </BuildFormRow>
      <BuildFormRow label="Order State">
        <div className="input input-sm">
          <Select
            value={tempQuery.state}
            onValueChange={(val: orderState) =>
              setTempQuery((prev) => ({
                ...prev,
                state: val,
              }))
            }
          >
            <SelectTrigger className="border-none bg-transparent p-0">
              <SelectValue placeholder="Select Order State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value={"I,P,B,S,G,C,T,E,J,W"}
                key={"I,P,B,S,G,C,T,E,J,W"}
              >
                All Order
              </SelectItem>
              <SelectItem value={"I,P,B,S,G"} key={"I,P,B,S,G"}>
                Uncomplete Order
              </SelectItem>
              <SelectItem value={"C"} key={"C"}>
                complete Order
              </SelectItem>
              <SelectItem value={"T"} key={"T"}>
                Reservation Order
              </SelectItem>
              <SelectItem value={"E"} key={"E"}>
                Undo Order
              </SelectItem>
            </SelectContent>
          </Select>
          {tempQuery.state != "I,P,B,S,G,C,T,E,J,W" && (
            <Button
              size={"sm"}
              variant={"ghost"}
              className="h-fit p-0"
              onClick={() =>
                setTempQuery((prev) => ({
                  ...prev,
                  state: "I,P,B,S,G,C,T,E,J,W",
                }))
              }
            >
              <KeenIcon icon="cross" />
            </Button>
          )}
        </div>
      </BuildFormRow>
      <BuildFormRow label="Offer Name">
        <div className="input input-sm">
          <Input
            // type="number"
            className="border-none p-0"
            placeholder="Search Offer Name"
            value={(tempQuery.offerName ?? "").toString()}
            onChange={(e) =>
              setTempQuery((prev) => ({
                ...prev,
                offerName: e.target.value,
              }))
            }
          />
        </div>
      </BuildFormRow>
      {/* <BuildFormRow label="Business Hall">
          <div className="input input-sm flex flex-row">
            <div className="flex-1">{org?.orgName}</div>
            <Button
              className="h-fit p-0"
              size={"sm"}
              variant={"ghost"}
              onClick={() => setShowOrg(true)}
            >
              <KeenIcon icon="notepad-edit" />
            </Button>
          </div>
        </BuildFormRow> */}
      <BuildFormRow label="Created Date">
        <div className="input input-sm">
          <input
            type="date"
            className="border-none p-0"
            value={tempQuery.startDate ?? ""}
            onChange={(e) =>
              setTempQuery((prev) => ({
                ...prev,
                startDate: e.target.value,
              }))
            }
          />
        </div>
      </BuildFormRow>
      <div className="col-span-1 sm:col-span-2 flex flex-row justify-end gap-2">
        <Button
          size={"sm"}
          onClick={() => {
            setOrderItemQuery(tempQuery);
          }}
        >
          Query
        </Button>
        <Button
          size={"sm"}
          onClick={() => {
            setOrderItemQuery(defaultOrderQuery);
            setTempQuery(defaultOrderQuery);
          }}
          variant={"outline"}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default Query;

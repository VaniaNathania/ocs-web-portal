import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import { useOrderListContext } from "../hooks";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { SubsEventList } from "@/pages/main-menu/data-reference/event/hooks/EventContext";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { orderState } from "../models/interfaces";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
import { useEffect, useMemo, useState } from "react";
import OrganizationSelector, {
  OrgData,
} from "@/pages/main-menu/offer/subscription-plan/components/OrganizationSelector";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const API_REF = apiConfigRef.ref;

const OrderSearch = () => {
  const {
    showSearch,
    setShowSearch,
    setOrderItemQuery,
    orderItemQuery,
    setRefreshKey,
  } = useOrderListContext();

  const [showOrg, setShowOrg] = useState<boolean>(false);
  const [searchAcctRes, setSearchAcctRes] = useState<string>("");
  const [openAcctRes, setOpenAcctRes] = useState<boolean>(false);
  const [org, setOrg] = useState<OrgData>();

  const { GetData } = useCallApi();

  const handleOrgData = (data: OrgData) => {
    setOrderItemQuery((prev) => ({ ...prev, orgId: data.orgId }));
    setOrg(data);
  };

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

  const BalTypeOptions = useMemo(
    () =>
      subsEvent.data?.filter((item) =>
        item.eventName.toLowerCase().includes(searchAcctRes.toLowerCase()),
      ),
    [subsEvent.data, searchAcctRes],
  );

  const SelectedBalType = useMemo(
    () =>
      BalTypeOptions?.find((e) => e.subsEventId === orderItemQuery?.subsEventId)
        ?.eventName || "Please Select",
    [orderItemQuery?.subsEventId, subsEvent.data],
  );

  return (
    <DialogWrapper
      isOpen={showSearch}
      handleDialog={setShowSearch}
      title="Seacrh Order"
      size={{ width: "4xl" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <BuildFormRow label="Order Number">
          <div className="input input-sm">
            <Input
              // type="number"
              className="border-none p-0"
              placeholder="Search Order Number"
              value={(orderItemQuery.orderNbr ?? "").toString()}
              onChange={(e) =>
                setOrderItemQuery((prev) => ({
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
              value={orderItemQuery.accNbr ?? ""}
              onChange={(e) =>
                setOrderItemQuery((prev) => ({
                  ...prev,
                  accNbr: e.target.value,
                }))
              }
            />
          </div>
        </BuildFormRow>
        <BuildFormRow label="Subscription Event">
          {/* <div className="input input-sm">
            <Select
              value={
                orderItemQuery.subsEventId
                  ? orderItemQuery.subsEventId.toString()
                  : ""
              }
              onValueChange={(val) =>
                setOrderItemQuery((prev) => ({
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
            {!!orderItemQuery.subsEventId && (
              <Button
                size={"sm"}
                variant={"ghost"}
                className="h-fit p-0"
                onClick={() =>
                  setOrderItemQuery((prev) => ({
                    ...prev,
                    subsEventId: undefined,
                  }))
                }
              >
                <KeenIcon icon="cross" />
              </Button>
            )}
          </div> */}
          <div className="flex flex-1 min-w-0" title={SelectedBalType}>
            <Popover open={openAcctRes} onOpenChange={setOpenAcctRes}>
              <PopoverTrigger
                asChild
                className="flex-1 flex"
                // disabled={!selectedRow}
              >
                <Button
                  className="justify-start flex-1 truncate"
                  variant="outline"
                  size={"sm"}
                >
                  <div className="flex flex-row w-full items-center justify-between">
                    {SelectedBalType}
                    <KeenIcon icon="down" />
                  </div>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                <Command>
                  <CommandInput
                    placeholder="Search..."
                    value={searchAcctRes}
                    onValueChange={setSearchAcctRes}
                  />

                  <CommandEmpty>No results</CommandEmpty>

                  <CommandGroup className="overflow-y-auto max-h-[400px]">
                    {BalTypeOptions?.map((item) => (
                      <CommandItem
                        key={item.subsEventId}
                        onSelect={() => {
                          setOrderItemQuery((prev) => ({
                            ...prev,
                            subsEventId: item.subsEventId,
                          }));

                          setOpenAcctRes(false); // close popover
                        }}
                      >
                        {item.eventName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </BuildFormRow>
        <BuildFormRow label="Order State">
          <div className="input input-sm">
            <Select
              value={orderItemQuery.state}
              onValueChange={(val: orderState) =>
                setOrderItemQuery((prev) => ({
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
            {orderItemQuery.state != "I,P,B,S,G,C,T,E,J,W" && (
              <Button
                size={"sm"}
                variant={"ghost"}
                className="h-fit p-0"
                onClick={() =>
                  setOrderItemQuery((prev) => ({
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
              value={(orderItemQuery.offerName ?? "").toString()}
              onChange={(e) =>
                setOrderItemQuery((prev) => ({
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
              value={orderItemQuery.startDate ?? ""}
              onChange={(e) =>
                setOrderItemQuery((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
            />
          </div>
        </BuildFormRow>
        <div className="col-span-2 flex flex-row justify-end gap-2">
          <Button
            size={"sm"}
            onClick={() => {
              setShowSearch(false);
              setRefreshKey((prev) => prev + 1);
            }}
          >
            Submit
          </Button>
        </div>
      </div>
      <OrganizationSelector
        isOpen={showOrg}
        onClose={() => setShowOrg(false)}
        organizationData={handleOrgData}
      />
    </DialogWrapper>
  );
};

export default OrderSearch;

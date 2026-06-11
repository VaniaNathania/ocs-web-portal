import { DefaultTooltip, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallApi } from "@/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AttrFieldOrder } from "../../../../subscriber/blocks/AttrFieldOrder";
import { apiConfigOrder, apiConfigRef } from "@/config/api.config";
import { useOrderForm } from "../hooks/context";
import { useOrderShop } from "../../../hooks/shopContext";
import NumberDialog from "./numberDialog";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { useOrderUser } from "@/pages/main-menu/order/user/hooks/context";
import clsx from "clsx";
import {
  AttrOrder,
  SIMCardDetail,
} from "@/pages/main-menu/order/models/interfaces";
import { DPOfferOrderList } from "../../../../subscriber/components/modifysubscriber/model/interfaces";
import { TimeUnitMapSubsPlan } from "@/pages/main-menu/offer/bundleNew-offer/types/BundleTypes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { v4 } from "uuid";
import { formatAmount } from "../../../../accBalance/block/AccBalTable";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

const API_URL = apiConfigOrder.order;
const API_REF = apiConfigRef.ref;

const Steps1 = () => {
  const {
    ownedOffer,
    setShowNumber,
    setShowAdd,
    showAdd,
    attrRec,
    setAttrRec,
    setDpOfferAttrRec,
    dpOfferAttrRec,
    setOwnedOffer,
    setUuidRec,
    uuidRec,
    form,
    setForm,
    orderNbr,
  } = useOrderForm();
  const { selectedTableItem } = useOrderShop();
  const { orderUseQuery, setShowAddAcc } = useOrder();
  const { acctList } = useOrderUser();
  const [childShow, setChildShow] = useState<{ [id: string]: boolean }>({});
  const [attrShow, setAttrShow] = useState<{ [id: string]: boolean }>({});
  const [editedExpDate, setEditedExpDate] = useState<
    Record<string, DPOfferOrderList>
  >({});
  const [openPopover, setOpenPopover] = useState<Record<string, boolean>>({});
  const { GetData } = useCallApi();

  const fetchAttr = async (offerId: number): Promise<AttrOrder[]> => {
    try {
      const payload = {
        offerId: offerId,
        subsPlanId: selectedTableItem?.id,
      };
      const resp = await GetData(
        `${API_URL}/api/order-entry/subs-plan/qry-subs-plan-attr-fiji`,
        payload,
      );

      if (resp.status) {
        return resp.data;
      }
      toast.error(resp.message);
      return [];
    } catch (error) {
      toast.error("Failed to fetch data");
      return [];
    }
  };

  const toggleAttr = async (id: string) => {
    try {
      if (attrShow[id] === undefined)
        setAttrShow((prev) => ({ ...prev, [id]: false }));
      else setAttrShow((prev) => ({ ...prev, [id]: !prev[id] }));
      if (attrShow[id] || attrRec[id]?.length > 0) return;
      const attr: AttrOrder[] = await fetchAttr(Number(id));
      setAttrRec((prev) => ({ ...prev, [id]: attr }));
      // console.log("ini toggle attr", dpOfferAttrRec[id], attr);

      // setDpOfferAttrRec((prev) => {
      //   if (prev[id] && prev[id].length > 0) return prev;

      //   const temp = attr.map((item) => ({
      //     attrName: item.attrName,
      //     value: item.defaultValue ?? "",
      //     valueMark: item.defaultValueMark ?? "",
      //     offerId: Number(id),
      //     attrId: item.attrId,
      //     operationType: "A",
      //     oldValue: "",
      //   }));
      // //  console.log("ini temp", temp);

      //   return {
      //     ...prev,
      //     [id]: temp,
      //   };
      // });
    } catch (error) {
    } finally {
      // //  console.log(attrRec);
    }
  };

  const hanldeDelete = (item: DPOfferOrderList) => {
    if (item.operationType === "X") {
      return setOwnedOffer((prev) => {
        return prev.map((mp) =>
          item.offerSeq === mp.offerSeq
            ? {
                ...mp,
                operationType: "D",
              }
            : mp,
        );
      });
    }
    if (item.operationType === "D") {
      return setOwnedOffer((prev) => {
        return prev.map((mp) =>
          item.offerSeq === mp.offerSeq
            ? {
                ...mp,
                operationType: "X",
              }
            : mp,
        );
      });
    }
    return setOwnedOffer((prev) => {
      return prev.filter((fl) => item.offerSeq !== fl.offerSeq);
    });
  };

  const Duplicate = (item: DPOfferOrderList) => {
    const tempUUID = v4();
    setUuidRec((prev) => ({
      ...prev,
      [item.offerId]: [...(prev[item.offerId] ?? []), tempUUID],
    }));
    setDpOfferAttrRec((prev) => ({
      ...prev,
      [`${item.offerId}#${tempUUID}`]: prev[`${item.offerId}#${item.offerSeq}`],
    }));
    setOwnedOffer((prev) => [
      ...prev,
      {
        ...item,
        operationType: "A",
        offerSeq: tempUUID,
      },
    ]);
  };

  const fetchAllAttr = () => {
    ownedOffer.forEach((ofr) => {
      if (!attrRec[String(ofr.offerId)])
        if (ofr.offerId) toggleAttr(ofr.offerId?.toString());
    });
    return true;
  };

  const queryAllAttr: UseQueryResult<boolean> = useQuery({
    queryKey: ["all-attr", ownedOffer],
    queryFn: fetchAllAttr,
    enabled: !!ownedOffer,
    // staleTime: 1000 * 1, // 10 minutes (master data rarely changes)
    refetchOnWindowFocus: false,
  });

  const FetchSimCard = async (
    simCardId: number,
  ): Promise<SIMCardDetail | undefined> => {
    try {
      const resp = await GetData(
        `${API_REF}/change-number-profile/qry-sim-card-details`,
        {
          simCardId,
          search: "",
          page: 1,
          size: 1,
          sortBy: "SIM_CARD_ID",
          sortDirection: "asc",
        },
      );
      if (!resp.status) {
        toast.error(resp.message);
        return;
      }
      const temp: SIMCardDetail = resp.data[0];
      return temp;
    } catch (error) {}
  };

  const FetchNewSimCard = async () => {
    try {
      if (!form?.simCardId) return;
      const temp = await FetchSimCard(form.simCardId);
      // if (!temp) {
      //   toast.error("Iccid not found");
      //   return;
      // }
      // if (temp.simState === "A") {
      //   toast.error("Sim Card is Active");
      //   return;
      // }
      // if (temp.isBindingFlag === "Y") {
      //   toast.error("Sim Card is already binded");
      //   return;
      // }
      setForm((prev) => ({ ...prev, simCard: temp }));
    } catch (error) {}
  };

  useEffect(() => {
    // console.log("ini owned offer", ownedOffer);
    FetchNewSimCard();
  }, [form?.simCardId]);

  useEffect(() => {
    // console.log("ini main datanya", attrRec, uuidRec);

    Object.entries(uuidRec).forEach(([uuid, uuidList]) => {
      uuidList.forEach((val) => {
        setDpOfferAttrRec((prev) => {
          // 🔒 already initialized → do nothing
          if (prev[`${uuid}#${val}`]?.length > 0) {
            // console.log("ini prev", prev);

            return prev;
          }

          const temp = attrRec[uuid]
            ? attrRec[uuid].map((item) => {
                const tempDefaultValue =
                  item.inputType === "4"
                    ? item.value
                    : item.attrValueList.find(
                        (list) => list.value === item.defaultValue,
                      )?.valueMark;
                return {
                  attrName: item.attrName,
                  value: item.defaultValue ?? "",
                  valueMark: tempDefaultValue ?? "",
                  offerId: Number(uuid),
                  attrId: item.attrId,
                  operationType: "A",
                  oldValue: "",
                };
              })
            : [];

          const allTemp = {
            ...prev,
            [`${uuid}#${val}`]: temp,
          };

          // console.log("ini all temp", allTemp);

          return allTemp;
        });
      });
    });
  }, [attrRec, uuidRec]);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <div className="h-5 w-2 rounded-sm bg-primary" />
          <div>Offer Information</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">Subscription Plan</Label>
            <div className="input input-sm">
              <Input
                className="border-none p-0"
                defaultValue={selectedTableItem?.offerName}
                disabled
              />
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">Order Number</Label>
            <div className="input input-sm">
              <Input
                className="border-none p-0"
                readOnly
                disabled
                value={orderNbr}
              />
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">Language</Label>
            <div className="input input-sm">
              <Select
                value={form?.defLangId?.toString() ?? ""}
                onValueChange={(e) =>
                  setForm((prev) => ({ ...prev, defLangId: Number(e) }))
                }
              >
                <SelectTrigger className="border-none bg-transparent p-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderUseQuery.data?.defLang.map((item) => (
                    <SelectItem
                      value={item.defLangId.toString()}
                      key={item.defLangId}
                    >
                      {item.defLangName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">Account</Label>
            <div className="input input-sm">
              <Select
                value={form?.acct?.acctId?.toString() ?? ""}
                onValueChange={(e) => {
                  const temp = acctList?.data?.find(
                    (item) => item.acctId === Number(e),
                  );

                  //  console.log(temp);

                  setForm((prev) => ({
                    ...prev,
                    acct: temp,
                  }));
                }}
              >
                <SelectTrigger className="border-none bg-transparent p-0 text-left">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {acctList?.data?.map((item) => (
                    <SelectItem
                      value={item.acctId?.toString() ?? ""}
                      key={item.acctId}
                    >
                      {item.custName + `[${item.acctNbr}]`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size={"sm"}
                variant={"ghost"}
                className="w-[20px] h-[20px]"
                onClick={() => setShowAddAcc(true)}
              >
                <KeenIcon icon="plus" />
              </Button>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">User Type</Label>
            <div className="input input-sm">
              <Input
                className="border-none p-0"
                readOnly
                disabled
                value={form?.acct?.billingCycleTypeName ?? ""}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <div className="h-5 w-2 rounded-sm bg-primary" />
          <div>Choose a Number</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">Number</Label>
            <div className="input input-sm">
              <Input
                className="border-none p-0"
                value={form?.simCard?.accNbr}
              />
              <Button
                size={"sm"}
                variant={"ghost"}
                className="w-[20px] h-[20px] p-0"
                onClick={() => {
                  setShowNumber(true);
                  // console.log("dipencet");
                }}
              >
                <KeenIcon icon="dots-horizontal" />
              </Button>
              <Button
                size={"sm"}
                variant={"ghost"}
                className="w-[20px] h-[20px] p-0"
              >
                <KeenIcon icon="arrows-circle" />
              </Button>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">ICCID</Label>
            <div className="input input-sm">
              <Input className="border-none p-0" value={form?.simCard?.iccid} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <div className="h-5 w-2 rounded-sm bg-primary" />
          <div>Select Service</div>
          <Button
            size={"sm"}
            variant={"ghost"}
            className="text-primary"
            onClick={() => setShowAdd(true)}
          >
            <KeenIcon icon="plus" />
            Add
          </Button>
        </div>
        {ownedOffer.map((item, index) => {
          // if (item.timerEventId) return;
          return (
            <div
              className={clsx(
                `flex flex-col overflow-hidden`,
                "transition-[max-height] duration-500 ease-in-out",
                `${attrShow[`${item.offerId}#${item.offerSeq}`] ? "max-h-[200px]" : "max-h-[80px]"}`,
              )}
              key={index}
            >
              <div className=" px-5 items-center flex flex-row ">
                <div className="flex flex-row gap-2 text-primary">
                  {item.offerName}
                </div>
                {item.duplicateFlag && item.duplicateFlag !== "A" && (
                  <Button
                    variant={"ghost"}
                    size={"sm"}
                    onClick={() => Duplicate(item)}
                  >
                    <KeenIcon icon="copy" />
                  </Button>
                )}
              </div>
              <div className=" px-5 grid grid-cols-9">
                <div className="col-span-2 flex flex-col">
                  <div className="text-xs opacity-50 truncate">OTC</div>
                  <div className="text-sm text-orange-400 truncate flex-1 items-center">
                    {formatAmount(item.offer?.saleListPrice ?? 0)}
                  </div>
                </div>
                <div className="col-span-2 flex flex-col">
                  <div className="text-xs opacity-50 truncate">MRC</div>
                  <div className="text-sm text-orange-400 truncate flex-1 items-center">
                    {formatAmount(item.offer?.rentListPrice ?? 0)}
                  </div>
                </div>
                <div className="col-span-2 flex flex-col">
                  <div className="text-xs opacity-50 truncate">
                    Effective Type
                  </div>
                  <div className="text-sm flex flex-row flex-1 items-center">
                    <div className="truncate ">
                      {item.absEffDate?.toString().replace("T", " ") ??
                        "instant"}
                    </div>
                    {/* <div>
                        <KeenIcon icon="notepad-edit" />
                      </div> */}
                  </div>
                </div>
                <div className="col-span-2 flex flex-col">
                  <div className="text-xs opacity-50 truncate">
                    Effective Duration {`{Date}`}
                  </div>
                  <div className="text-sm flex flex-row items-center">
                    <div className="truncate ">
                      {/* {item.relExpUnit
                          ? `${TimeUnitMapSubsPlan[item.relExpUnit]}(${item.relExpOffset ?? ""})`
                          : (item.absExpDate?.toString() ?? "Forever")} */}
                      {item.absExpDate
                        ? item.absExpDate?.toString().replace("T", " ")
                        : item.relExpUnit
                          ? `${TimeUnitMapSubsPlan[item.relExpUnit]}(${item.relExpOffset})`
                          : "Forever"}
                    </div>
                    <Popover
                      open={
                        openPopover[`${item.offerId}#${item.offerSeq}`] ?? false
                      }
                      onOpenChange={(open) =>
                        setOpenPopover((prev) => ({
                          ...prev,
                          [`${item.offerId}#${item.offerSeq}`]: open,
                        }))
                      }
                    >
                      <PopoverTrigger
                        asChild
                        onClick={() => {
                          setEditedExpDate((prev) => ({
                            ...prev,
                            [`${item.offerId}#${item.offerSeq}`]: item,
                          }));

                          setOpenPopover((prev) => ({
                            ...prev,
                            [`${item.offerId}#${item.offerSeq}`]: true,
                          }));
                        }}
                      >
                        <Button size="sm" variant="ghost">
                          <KeenIcon icon="notepad-edit" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent
                        side="bottom"
                        align="end"
                        className="w-72 p-4 space-y-3"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-row gap-2 items-center">
                            <Label className="w-20 truncate">
                              Effective Type
                            </Label>
                            <Input
                              className="flex-1"
                              size={"sm"}
                              defaultValue={"Instant"}
                              disabled
                            />
                          </div>
                          <div className="flex flex-row gap-2 items-center">
                            <Label className="w-20 truncate">
                              Effective Duration
                            </Label>
                            <div className="flex-1 flex flex-row gap-2">
                              <Input
                                size={"sm"}
                                type="number"
                                value={
                                  editedExpDate[
                                    `${item.offerId}#${item.offerSeq}`
                                  ]?.relExpOffset ?? ""
                                }
                                onChange={(e) =>
                                  setEditedExpDate((prev) => ({
                                    ...prev,
                                    [`${item.offerId}#${item.offerSeq}`]: {
                                      ...prev[
                                        `${item.offerId}#${item.offerSeq}`
                                      ],
                                      relExpOffset: e.target.value,
                                    },
                                  }))
                                }
                              />

                              <Select
                                value={
                                  editedExpDate[
                                    `${item.offerId}#${item.offerSeq}`
                                  ]?.relExpUnit ?? ""
                                }
                                onValueChange={(e) =>
                                  setEditedExpDate((prev) => ({
                                    ...prev,
                                    [`${item.offerId}#${item.offerSeq}`]: {
                                      ...prev[
                                        `${item.offerId}#${item.offerSeq}`
                                      ],
                                      relExpUnit: e,
                                    },
                                  }))
                                }
                              >
                                <SelectTrigger className="" size={"sm"}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(TimeUnitMapSubsPlan).map(
                                    ([key, val], idx) => (
                                      <SelectItem key={idx} value={key}>
                                        {val}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (!item.offerId) return;

                                setEditedExpDate((prev) => ({
                                  ...prev,
                                  [`${item.offerId}#${item.offerSeq}`]: item,
                                }));

                                setOpenPopover((prev) => ({
                                  ...prev,
                                  [`${item.offerId}#${item.offerSeq}`]: false,
                                }));
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                if (!item.offerId) return;

                                setOwnedOffer((prev) =>
                                  prev.map((o) =>
                                    o.offerSeq === item.offerSeq
                                      ? editedExpDate[
                                          `${o.offerId}#${o.offerSeq}`
                                        ]
                                      : o,
                                  ),
                                );

                                setOpenPopover((prev) => ({
                                  ...prev,
                                  [`${item.offerId}#${item.offerSeq}`]: false,
                                }));
                              }}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex flex-wrap justify-end">
                  <Button
                    variant={"ghost"}
                    size={"sm"}
                    onClick={() => hanldeDelete(item)}
                  >
                    {item.operationType !== "D" ? (
                      <KeenIcon icon="trash" />
                    ) : (
                      <KeenIcon icon="arrow-circle-left" />
                    )}
                  </Button>
                  <Button
                    variant={"ghost"}
                    size={"sm"}
                    onClick={() => {
                      // console.log(item);

                      toggleAttr(`${item.offerId}#${item.offerSeq}`);
                    }}
                  >
                    <KeenIcon
                      icon="down"
                      className={`transition-all duration-300 ${attrShow[`${item.offerId}#${item.offerSeq}`] ? "rotate-180" : "rotate-0"}`}
                    />
                  </Button>
                </div>
              </div>
              <div
                className={clsx(
                  `bg-primary-clarity px-5 flex flex-row transition-all  duration-300 overflow-hidden overflow-x-auto
                            items-center gap-2 `,
                  `${attrShow[`${item.offerId}#${item.offerSeq}`] ? `${attrRec[String(item.offerId)]?.length > 0 ? "h-20" : "h-0"}` : "h-0"}`,
                )}
                // className={`bg-orange-200 px-5 flex flex-row transition-all  duration-300 overflow-hidden overflow-x-auto
                //           items-center gap-2  ${attrShow[item.offerId ?? ""] ? "h-20" : "h-0"}`}
              >
                {!attrRec[String(item.offerId)] && <div>No Data</div>}
                {attrRec[String(item.offerId)]?.map((attr, atid) => {
                  return (
                    <div className="flex flex-col text-xs w-40" key={atid}>
                      <DefaultTooltip title={attr.attrName} placement="top">
                        <Label className="truncate">{attr.attrName}</Label>
                      </DefaultTooltip>
                      <AttrFieldOrder
                        offerId={item.offerId ?? 0}
                        uuid={item.offerSeq ?? ""}
                        attrId={attr.attrId}
                        rowData={attrRec[String(item.offerId)]}
                        setRowData={setAttrRec}
                        rec={dpOfferAttrRec[`${item.offerId}#${item.offerSeq}`]}
                        setRec={setDpOfferAttrRec}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <NumberDialog />
    </div>
  );
};

export default Steps1;

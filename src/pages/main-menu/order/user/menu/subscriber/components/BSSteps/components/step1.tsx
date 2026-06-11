import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { DefaultTooltip, KeenIcon } from "@/components";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { Label } from "@/components/ui/label";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { useSubscriberListContext } from "../../../hooks";
import { AttrFieldOrder } from "../../../blocks/AttrFieldOrder";
import { useBrandShift } from "../hooks/context";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import clsx from "clsx";
import { AttrOrder } from "@/pages/main-menu/order/models/interfaces";
import { apiConfigOrder } from "@/config/api.config";
import { DPOfferOrderList } from "../../modifysubscriber/model/interfaces";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeUnitMapSubsPlan } from "@/pages/main-menu/offer/bundleNew-offer/types/BundleTypes";
import { v4 } from "uuid";
import NewSubsSelect from "../blocks/newSubsSelection";
import { formatAmount } from "../../general";

const API_URL = apiConfigOrder.order;

const BrandShiftStep1 = () => {
  const {
    handleModifySubscriberDetailAddDialog,
    // ownedOffer,
    selectedSubs,
    showDialog,
    // ownedOffer,
  } = useSubscriberListContext();
  const {
    attrRec,
    setAttrRec,
    selectedNewSubs,
    ownedOffer,
    setOwnedOffer,
    setDpOfferAttrRec,
    dpOfferAttrRec,
    setUuidRec,
    uuidRec,
    setSubsSelect,
  } = useBrandShift();
  const { selectedUser } = useOrder();
  const [attrShow, setAttrShow] = useState<{ [id: string]: boolean }>({});
  const { GetData, PostData } = useCallApi();
  const [editedExpDate, setEditedExpDate] = useState<
    Record<string, DPOfferOrderList>
  >({});
  const [openPopover, setOpenPopover] = useState<Record<string, boolean>>({});

  const now = new Date();

  const fetchAttr = async (offerId: number): Promise<AttrOrder[]> => {
    try {
      const payload = {
        offerId: offerId,
        subsPlanId: selectedSubs?.subsPlanId,
      };

      // return [];
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
      const attr: AttrOrder[] = await fetchAttr(Number(id.split("#")[0]));
      setAttrRec((prev) => ({ ...prev, [id.split("#")[0]]: attr }));
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

  useEffect(() => {
    // console.log("ini owned offer", ownedOffer);

    if (!showDialog)
      ownedOffer.forEach((ofr) => {
        if (!attrRec[String(ofr.offerId)] && !ofr.timerEventId)
          if (ofr.offerId) toggleAttr(`${ofr.offerId}#${ofr.offerSeq}`);
      });
  }, [ownedOffer, showDialog]);

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
    <div className="bg-white flex flex-col gap-5 p-5 w-full">
      <div className="flex flex-col gap-5">
        <div className="flex flex-row gap-5 items-center">
          <div className="flex flex-row items-center gap-2">
            <div className="h-5 w-2 rounded-sm bg-primary" />
            <div>Change Subscription Plan</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Service Number
            </label>
            <div className="text-sm text-gray-900">{selectedSubs?.acctNbr}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Offer Name
            </label>
            <div className="text-sm text-gray-900">
              {selectedSubs?.offerName}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Old Subscription Plan
            </label>
            <div className="text-sm text-gray-900">
              {selectedSubs?.subsPlanName}
            </div>
          </div>
          <BuildFormRow label="New Subscription Plan" isRequired>
            {/* <Input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Select plan"
            /> */}
            <div className="input flex flex-row justify-between">
              <span className="flex-1">{selectedNewSubs?.offerName}</span>
              <Button
                size={"sm"}
                variant={"ghost"}
                onClick={() => setSubsSelect(true)}
              >
                <KeenIcon icon="notepad-edit" />
              </Button>
            </div>
          </BuildFormRow>
          <div>
            <label className="block text-sm text-gray-600 mb-1">ERF</label>
            <Input
              type="text"
              value="0.00000"
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
            />
          </div>
          <BuildFormRow label="User Type" isRequired>
            <Select value={"prepaid"} disabled>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Price Plan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prepaid">Prepaid</SelectItem>
              </SelectContent>
            </Select>
          </BuildFormRow>
        </div>
      </div>
      {/* Select Service */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-row gap-5 items-center">
          <div className="flex flex-row items-center gap-2">
            <div className="h-5 w-2 rounded-sm bg-primary" />
            <div>Select Service</div>
          </div>
          <button
            className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm"
            onClick={() => handleModifySubscriberDetailAddDialog(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        <div className=" flex flex-col gap-2">
          {ownedOffer
            .sort((a, b) => a.offerId - b.offerId)
            .map((item, index) => {
              // if (item.offerGroupType === "6") return;
              if (item.operationType === "D") return;
              if (item.timerEventId) return;
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
                            openPopover[`${item.offerId}#${item.offerSeq}`] ??
                            false
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
                                      [`${item.offerId}#${item.offerSeq}`]:
                                        item,
                                    }));

                                    setOpenPopover((prev) => ({
                                      ...prev,
                                      [`${item.offerId}#${item.offerSeq}`]:
                                        false,
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
                                      [`${item.offerId}#${item.offerSeq}`]:
                                        false,
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
                    //           items-center gap-2  ${attrShow[`${item.offerId}#${item.offerSeq}`] ? "h-20" : "h-0"}`}
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
                            rec={
                              dpOfferAttrRec[`${item.offerId}#${item.offerSeq}`]
                            }
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
      </div>

      <NewSubsSelect />

      {/* Order Information */}
      {/* <div className="flex flex-col gap-5">
        <div className="flex flex-row gap-5 items-center">
          <div className="flex flex-row items-center gap-2">
            <div className="h-5 w-2 rounded-sm bg-primary" />
            <div>Order Information</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <BuildFormRow label="Reservation Time">
            <div className="flex flex-col w-full">
              <input
                type="datetime-local"
                value={orderInfoForm?.bespAddress ?? ""}
                onChange={(e) => {
                  const value = e.target.value;

                  if (!value) return;

                  const selected = new Date(value);
                  const today = new Date();

                  // normalize both to date-only
                  selected.setHours(0, 0, 0, 0);
                  today.setHours(0, 0, 0, 0);

                  if (selected <= today) {
                    setDateError("Date must be after today");
                  } else {
                    setDateError("");
                  }

                  setOrderInfoForm((prev) => ({
                    ...prev,
                    bespAddress: value,
                  }));
                }}
                className={clsx(
                  "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2",
                  dateError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500",
                )}
              />

              {dateError && (
                <p className="text-red-500 text-xs mt-1">{dateError}</p>
              )}
            </div>
          </BuildFormRow>
          <BuildFormRow label="Remarks">
            <input
              value={orderInfoForm?.comments ?? ""}
              onChange={(e) =>
                setOrderInfoForm((prev) => ({
                  ...prev,
                  comments: e.target.value,
                }))
              }
              type="text"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </BuildFormRow>
        </div>
      </div> */}
    </div>
  );
};

export default BrandShiftStep1;

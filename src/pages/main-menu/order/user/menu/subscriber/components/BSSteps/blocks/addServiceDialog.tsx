import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Loader } from "@/components/common/Loading";
import { v4 } from "uuid";
import { KeenIcon } from "@/components";
import { useSubscriberListContext } from "../../../hooks";
import { useBrandShift } from "../hooks/context";
import { DPOfferOrderList } from "../../modifysubscriber/model/interfaces";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUUID(value?: string): boolean {
  return typeof value === "string" && UUID_REGEX.test(value);
}

const BrandShiftAddDialog = () => {
  const {
    showModifySubscriberDetailAddDialog,
    handleModifySubscriberDetailAddDialog,
    availableOffer,
    // setOwnedOffer,
    // ownedOffer,

    // fetchOfferData,
    offerList,
  } = useSubscriberListContext();
  const { ownedOffer, setOwnedOffer, uuidRec, setUuidRec } = useBrandShift();
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({
    prepaid: true,
    vas: true,
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
  const [tempOffer, setTempOffer] = useState<DPOfferOrderList[]>([]);

  const init = async () => {
    setIsLoading(true);
    try {
      setSelectedItems(ownedOffer.flatMap((child) => child.offerName ?? ""));
      setTempOffer([]);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!showModifySubscriberDetailAddDialog) return;
    init();
  }, [showModifySubscriberDetailAddDialog]);

  const save = () => {
    const tempOfferRec = tempOffer.map((val) => {
      let tempUUID = val.offerSeq;
      if (isUUID(tempUUID)) {
        tempUUID = v4().toString();
      }
      setUuidRec((prev) => ({
        ...prev,
        [val.offerId]: [...(prev[val.offerId] ?? []), tempUUID],
      }));
      return {
        ...val,
        offerSeq: tempUUID,
      };
    });
    setOwnedOffer((prev) => [...prev, ...tempOfferRec]);
    handleModifySubscriberDetailAddDialog(false);
  };

  const suggestions = availableOffer.flatMap(
    (group) =>
      group.children
        ?.filter((child) =>
          child.offerName?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .map((child) => child.offerName ?? "") ?? [],
  );

  return (
    <Dialog
      open={showModifySubscriberDetailAddDialog}
      onOpenChange={handleModifySubscriberDetailAddDialog}
    >
      <DialogContent
        className="max-w-6xl max-h-[90vh] p-0"
        aria-describedby="dialog add service"
      >
        <DialogDescription />
        {isLoading ? (
          <div className="relative min-h-[400px]">
            <Loader title="Loading offers" />
          </div>
        ) : (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <DialogTitle className="text-lg font-semibold">
                Add Offer
              </DialogTitle>
            </DialogHeader>

            <div className="px-6 pt-4 pb-6">
              {isLoading && <Loader />}
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Service Name"
                  value={searchQuery}
                  onChange={(e) => {
                    const q = e.target.value;
                    setSearchQuery(q);
                    setShowSuggestion(true);

                    const match = suggestions.find(
                      (s) => s.toLowerCase() === q.toLowerCase(),
                    );

                    if (match) {
                      const parentIndex = availableOffer.findIndex((g) =>
                        g.children?.some((c) => c.offerName === match),
                      );

                      if (parentIndex !== -1) {
                        setExpandedGroups((prev) => ({
                          ...prev,
                          [parentIndex]: true,
                        }));
                      }

                      setTimeout(() => {
                        itemRefs.current[match]?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }, 150);
                    }
                  }}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {showSuggestion && (
                  <div className="absolute z-50 bg-white border rounded-lg w-full shadow max-h-40 overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                        onMouseDown={() => {
                          setSearchQuery(s);
                          setShowSuggestion(false);

                          // Expand the correct group
                          const parentIndex = availableOffer.findIndex((g) =>
                            g.children?.some((c) => c.offerName === s),
                          );

                          if (parentIndex !== -1) {
                            setExpandedGroups((prev) => ({
                              ...prev,
                              [parentIndex]: true,
                            }));
                          }

                          // Scroll into view (after render)
                          setTimeout(() => {
                            const el = itemRefs.current[s];
                            el?.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }, 150);
                        }}
                      >
                        {s}
                      </div>
                    ))}
                    {suggestions.length === 0 && (
                      <div className="px-3 py-2 text-sm ">
                        No offer with that name
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="border rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 border-b">
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-700">
                    <div className="col-span-6">Offer Group Name</div>
                    <div className="col-span-3 text-right">OTC</div>
                    <div className="col-span-3 text-right">MRC</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="bg-white max-h-[300px] overflow-y-auto">
                  {availableOffer.map((group, index) => {
                    if (group.offerGroupType === "6") return;
                    return (
                      <div key={index} className="border-b last:border-b-0">
                        {/* Group Header */}
                        <div
                          className="px-4 py-3 flex items-center gap-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            setExpandedGroups((prev) => ({
                              ...prev,
                              [index]: !prev[index],
                            }))
                          }
                        >
                          {expandedGroups[index] ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                          <span className="text-blue-500 text-sm">📦</span>
                          <span className="text-sm font-medium text-gray-700">
                            {group.offerGroupName}
                          </span>
                        </div>

                        {/* Group Items */}
                        {expandedGroups[index] && (
                          <div className="bg-gray-50">
                            {group.children?.map((child, indexChild) => {
                              const disable: boolean =
                                !child.duplicateFlag &&
                                (ownedOffer.some(
                                  (ofr) => ofr.offerId === child.offerId,
                                ) ||
                                  tempOffer.some(
                                    (ofr) => ofr.offerId === child.offerId,
                                  ));
                              return (
                                <div
                                  key={indexChild}
                                  ref={(el) => {
                                    if (child.offerName)
                                      itemRefs.current[child.offerName] = el;
                                  }}
                                  className="grid grid-cols-12 gap-4 px-4 py-3 border-t hover:bg-gray-100"
                                >
                                  <div className="col-span-6 flex items-center gap-3 pl-8">
                                    {/* <input
                                  type="checkbox"
                                  checked={selectedItems.includes(
                                    child.offerName ?? "/",
                                  )}
                                  onChange={() => {
                                    if (!child.offerName) return; // do nothing

                                    setSelectedItems((prev) =>
                                      prev.includes(child.offerName!)
                                        ? prev.filter(
                                            (i) => i !== child.offerName,
                                          )
                                        : [...prev, child.offerName!],
                                    );
                                    const parentName = group.offerGroupId;
                                    const childName = child.offerName;

                                    if (!parentName || !childName) return;

                                    setTempOffer((prev) => {
                                      // Find parent
                                      const index = prev.findIndex(
                                        (p) => p.offerId === child.offerId,
                                      );

                                      const genUUID = v4().toString();

                                      // Case 1: Parent NOT found → add parent with single child
                                      if (index === -1) {
                                        const temp: DPOfferOrderList[] = [
                                          ...prev,
                                          {
                                            ...child,
                                            offerSeq: genUUID,
                                            orderItemId: undefined,
                                            dpOfferOrderAttrList: [],
                                            reserveDpOffer: false,
                                            operationType: "A",
                                          },
                                        ];
                                        return temp;
                                      }
                                      if (prev[index].operationType !== "A") {
                                        return prev.map((item, i) =>
                                          i === index
                                            ? item.operationType === "D"
                                              ? {
                                                  ...item,
                                                  operationType: "X", // or whatever you need to change
                                                }
                                              : {
                                                  ...item,
                                                  operationType: "D", // or whatever you need to change
                                                }
                                            : item,
                                        );
                                      }
                                      return prev.filter(
                                        (_, idx) => idx === index,
                                      );

                                      // Parent exists
                                      // const parent = prev[parentIndex];
                                      // const children = parent.children ?? [];

                                      // // Is child already inside?
                                      // const childExists = children.some(
                                      //   (c) => c.offerName === childName,
                                      // );

                                      // let updatedChildren;

                                      // if (childExists) {
                                      //   // REMOVE child
                                      //   updatedChildren = children.filter(
                                      //     (c) => c.offerName !== childName,
                                      //   );

                                      //   // If no children left → remove the entire parent
                                      //   if (updatedChildren.length === 0) {
                                      //     return prev.filter(
                                      //       (_, i) => i !== parentIndex,
                                      //     );
                                      //   }
                                      // } else {
                                      //   // ADD child
                                      //   updatedChildren = [...children, child];
                                      // }

                                      // console.log(updatedChildren);

                                      // // Replace updated parent
                                      // return prev.map((p, i) =>
                                      //   i === parentIndex
                                      //     ? { ...p, children: updatedChildren }
                                      //     : p,
                                      // );
                                    });
                                  }}
                                  className="w-4 h-4 rounded border-gray-300"
                                /> */}
                                    {
                                      <div className="flex flex-row items-center">
                                        <Button
                                          size={"sm"}
                                          variant={"ghost"}
                                          disabled={disable}
                                          onClick={() => {
                                            setTempOffer((prev) => {
                                              const genUUID = v4().toString();

                                              const temp: DPOfferOrderList[] = [
                                                ...prev,
                                                {
                                                  ...child,
                                                  offerSeq: genUUID,
                                                  orderItemId: undefined,
                                                  dpOfferOrderAttrList: [],
                                                  reserveDpOffer: false,
                                                  operationType: "A",
                                                },
                                              ];
                                              return temp;
                                            });
                                          }}
                                        >
                                          <KeenIcon icon="plus" />
                                        </Button>
                                        <span>
                                          {
                                            tempOffer.filter(
                                              (item) =>
                                                item.offerId === child.offerId,
                                            ).length
                                          }
                                        </span>
                                        <Button
                                          size={"sm"}
                                          variant={"ghost"}
                                          onClick={() => {
                                            setTempOffer((prev) => {
                                              const index = prev.findIndex(
                                                (item) =>
                                                  item.offerId ===
                                                  child.offerId,
                                              );

                                              // nothing to remove
                                              if (index === -1) return prev;

                                              const next = [...prev];
                                              next.splice(index, 1); // remove ONE
                                              return next;
                                            });
                                          }}
                                        >
                                          <KeenIcon icon="minus" />
                                        </Button>
                                      </div>
                                    }
                                    <span
                                      className={`text-sm transition-all duration-300 ${child.offerName === searchQuery ? "text-blue-500 font-semibold" : "text-gray-700 font-light"}`}
                                    >
                                      {child.offerName}
                                    </span>
                                  </div>
                                  <div className="col-span-3 text-right text-sm text-gray-600">
                                    {/* {item.otc} */}{" "}
                                    {child.offer?.saleListPrice}
                                  </div>
                                  <div className="col-span-3 text-right text-sm text-gray-600">
                                    {/* {item.mrc} */}{" "}
                                    {child.offer?.rentListPrice}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => handleModifySubscriberDetailAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={save}
                >
                  OK
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { BrandShiftAddDialog };

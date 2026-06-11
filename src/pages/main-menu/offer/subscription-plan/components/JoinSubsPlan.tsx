import { DefaultTooltip, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import {
  DialogWrapper,
  PopUpDialog,
} from "@/pages/main-menu/role-management/generalUseComp";
import { Inbox } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

interface props {
  isOpen: boolean;
  handleOpen: (open: boolean) => void;
  payload: {
    offerGroupType: string;
    offerGroupId: number;
    indepProdSpecId: number;
    networkType: string;
    spId: 0;
  };
}

interface joinSubsPlan {
  offerVerId: number;
  effDate: string;
  expDate: null; //grandchild
  subsPlanName: string; //child
  indepProdSpecId: number;
  offerName: string; //parent
  subsPlanId: number;
  isExpand: boolean;
  necessary: "1" | "0";
}

type GroupedOffer = {
  offerName: string;
  isExpand: boolean;
  child: joinSubsPlan[];
};

const API_URL_OFFER = apiConfigOffer.offer;

export const JoinSubsPlan = ({ isOpen, handleOpen, payload }: props) => {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [partys, setPartys] = useState<joinSubsPlan[]>();
  const [selectedPlans, setSelectedPlans] = useState<joinSubsPlan[]>([]);

  const [partysGroup, setPartysGroup] = useState<GroupedOffer[]>();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filteredPartysGroup, setFilteredPartysGroup] =
    useState<GroupedOffer[]>();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [showConfirmAdd, setShowConfirmAdd] = useState<boolean>(false);

  const { GetData, PostData } = useCallApi();

  const groupByOfferName = (data: joinSubsPlan[]): GroupedOffer[] => {
    const grouped: Record<string, GroupedOffer> = {};

    for (const item of data) {
      if (!grouped[item.offerName]) {
        grouped[item.offerName] = {
          isExpand: true,
          offerName: item.offerName,
          child: [],
        };
      }

      grouped[item.offerName].child.push({ ...item, isExpand: true });
    }

    return Object.values(grouped);
  };

  const initialize = async () => {
    try {
      // console.log("📡 Fetching feature detail data from API...");
      const response = await GetData(
        `${API_URL_OFFER}/offer/subs-plan/qry-subs-plan-ver-for-offer-group-add`,
        {
          ...payload,
          spId: 0,
        },
      );

      // console.log("✅ Detail API response", response);

      if (response?.data) {
        // console.log("✅ Setting detail data:", response.data);
        setPartys(response.data);

        const grouped = groupByOfferName(response.data);

        setPartysGroup(grouped);
        setSelectedPlans([]);

        // console.log(grouped);

        // return response.data;
      }
      //   return null;
    } catch (error) {
      toast.error("failed to fetch join subs data");
      //  console.log(error);
    }
  };

  useEffect(() => {
    if (isOpen) initialize();
  }, [isOpen]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    if (!value.trim()) {
      setSuggestions([]);
      setFilteredPartysGroup(partysGroup); // Reset view
      return;
    }

    const lowerValue = value.toLowerCase();
    const matched: Set<string> = new Set();

    partysGroup?.forEach((group) => {
      if (group.offerName.toLowerCase().includes(lowerValue)) {
        matched.add(group.offerName);
      }
      group.child.forEach((child) => {
        if (child.subsPlanName.toLowerCase().includes(lowerValue)) {
          matched.add(child.subsPlanName);
        }
      });
    });

    setSuggestions(Array.from(matched));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setSuggestions([]);

    setPartysGroup((prev) =>
      prev?.map((group) => {
        const isGroupMatch = group.offerName
          .toLowerCase()
          .includes(suggestion.toLowerCase());

        const hasMatchingChild = group.child.some((child) =>
          child.subsPlanName.toLowerCase().includes(suggestion.toLowerCase()),
        );

        return {
          ...group,
          isExpand: isGroupMatch || hasMatchingChild ? true : group.isExpand,
          child: group.child.map((child) => ({
            ...child,
            isExpand: true, // Optional: expand all children for visibility
          })),
        };
      }),
    );

    // Wait for UI to update before scrolling
    setTimeout(() => {
      const matchingGroup = partysGroup?.find((group) => {
        return (
          group.offerName.toLowerCase().includes(suggestion.toLowerCase()) ||
          group.child.some((child) =>
            child.subsPlanName.toLowerCase().includes(suggestion.toLowerCase()),
          )
        );
      });

      const matchingChild = matchingGroup?.child.find((child) =>
        child.subsPlanName.toLowerCase().includes(suggestion.toLowerCase()),
      );

      const matchRefKey = matchingChild
        ? `child-${matchingChild.subsPlanId}`
        : matchingGroup
          ? `group-${matchingGroup.offerName}`
          : null;

      if (matchRefKey) {
        const element = itemRefs.current[matchRefKey];
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          setHighlightedId(matchRefKey);
          setTimeout(() => setHighlightedId(null), 2000); // remove highlight after 2s
        }
      }
    }, 200);
  };

  useEffect(() => {
    setFilteredPartysGroup(partysGroup);
  }, [partysGroup]);

  const onSelectPlan = (plan: joinSubsPlan) => {
    setSelectedPlans((prev) => {
      const isAlreadySelected = prev.some(
        (p) => p.subsPlanId === plan.subsPlanId,
      );
      if (isAlreadySelected) return prev;
      return [...prev, plan];
    });
  };

  const onSelectGroup = (group: GroupedOffer) => {
    group.child.forEach((plan) => {
      if (!isChecked(plan.subsPlanId)) onSelectPlan(plan);
    });
  };

  const isChecked = (subsPlanId: number): boolean => {
    return (
      selectedPlans.some((plan) => plan.subsPlanId === subsPlanId) ?? false
    );
  };

  const isGroupChecked = (group: GroupedOffer): boolean => {
    return group.child.every((child) =>
      selectedPlans.some((plan) => plan.subsPlanId === child.subsPlanId),
    );
  };

  const onDeletePlan = (plan: joinSubsPlan) => {
    setSelectedPlans((prev) =>
      prev.filter((item) => item.subsPlanId !== plan.subsPlanId),
    );
  };

  const allAdd = () => {
    partysGroup?.forEach((group) => {
      if (!isGroupChecked(group)) onSelectGroup(group);
    });
  };

  const allDelete = () => {
    setSelectedPlans([]);
  };

  const handleConfirm = () => {
    setShowConfirmAdd(true);
  };

  const onConfirm = async () => {
    try {
      const subsPlan = selectedPlans.map(
        (item: any) =>
          (item = {
            necessary: item.necessary ?? "0",
            offerGroupId: payload.offerGroupId,
            offerVerId: item.offerVerId,
            spId: 0,
          }),
      );
      const submitData = {
        offerGroupType: payload.offerGroupType,
        subsPlanOfferSelectDto: subsPlan,
      };

      const response = await PostData(
        `${API_URL_OFFER}/offer/subs-plan/add-subs-plan-offer-select`,
        submitData,
      );

      if (response?.status) {
        toast.success(response.message);
      } else toast.error(response?.message);

      // console.log(submitData);
    } catch (error) {
      //  console.log(error);
      toast.error("Failed to execute the function. Error on client side");
    } finally {
      setShowConfirmAdd(false);
      handleOpen(false);
    }
  };

  return (
    <DialogWrapper
      isOpen={isOpen}
      handleDialog={handleOpen}
      title="Join Subscription Plan"
      onClose={() => handleOpen(false)}
      size={{ width: "6xl", height: "900px" }}
    >
      {/* popUpAdd */}
      <PopUpDialog
        desc="Are you sure to add selected group?"
        isOpen={showConfirmAdd}
        handleDialog={setShowConfirmAdd}
        onConfirm={onConfirm}
        bgOn={false}
      />
      <div className="flex flex-col">
        <div className="w-full flex flex-row h-[700px] ">
          {/* left */}
          <div className="flex flex-col w-[45%] pt-5 gap-2">
            <div className="w-full relative">
              <Input
                type="text"
                // className="border px-4 py-2 w-full rounded"
                placeholder="Search by Offer or Subscription Plan Name..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {suggestions.length > 0 && (
                <ul className="fixed border bg-white shadow rounded mt-2 max-h-60 overflow-y-auto z-10">
                  {suggestions.map((s, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSuggestionClick(s)}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="w-full flex flex-col flex-1 rounded-md overflow-hidden">
              <DefaultTooltip title="Product/Subscription Plan" placement="top">
                <div className="w-full p-2 bg-gray-200">
                  Product/Subscription Plan
                </div>
              </DefaultTooltip>
              <div className="border-2 flex-1 overflow-y-auto overflow-hidden">
                {(partysGroup?.length ?? 0) > 0 ? (
                  partysGroup?.map((item, index) => {
                    const toggleExpandGroup = () => {
                      setPartysGroup((prev) => {
                        const before = prev?.slice(0, index) ?? [];
                        const after = prev?.slice(index + 1, prev.length) ?? [];
                        const newItem: GroupedOffer = {
                          ...item,
                          isExpand: !item.isExpand,
                        };
                        return [...before, newItem, ...after];
                      });
                    };
                    return (
                      <div className="w-full flex flex-col" key={index}>
                        <div
                          className={`w-full flex flex-row p-2 hover:bg-gray-50 transition-all duration-300 ${
                            highlightedId === `group-${item.offerName}`
                              ? "bg-yellow-100"
                              : ""
                          }`}
                          ref={(el) =>
                            (itemRefs.current[`group-${item.offerName}`] = el)
                          }
                        >
                          <input
                            type="checkbox"
                            className="mr-1"
                            disabled
                            checked={isGroupChecked(item)}
                          />
                          <Button
                            variant={"ghost"}
                            size={"sm"}
                            onClick={toggleExpandGroup}
                          >
                            <KeenIcon
                              icon="right"
                              className={item.isExpand ? "rotate-90" : ""}
                            />
                          </Button>
                          <DefaultTooltip
                            title={item.offerName}
                            placement="top"
                          >
                            <div className="flex-1 truncate items-center my-auto">
                              {item.offerName}
                            </div>
                          </DefaultTooltip>
                          <Button
                            variant={"ghost"}
                            size={"sm"}
                            onClick={() => onSelectGroup(item)}
                          >
                            <KeenIcon icon="plus" />
                          </Button>
                        </div>
                        {item.isExpand &&
                          item.child.map((subs, subsIndex) => {
                            const toggleExpandSubs = () => {
                              setPartysGroup((prev) => {
                                const before = prev?.slice(0, index) ?? [];
                                const after =
                                  prev?.slice(index + 1, prev.length) ?? [];
                                const childBefore = item.child.slice(
                                  0,
                                  subsIndex,
                                );
                                const childAfter = item.child.slice(
                                  subsIndex + 1,
                                  item.child.length,
                                );
                                const newChild: joinSubsPlan = {
                                  ...subs,
                                  isExpand: !subs.isExpand,
                                };
                                const newItem: GroupedOffer = {
                                  ...item,
                                  child: [
                                    ...childBefore,
                                    newChild,
                                    ...childAfter,
                                  ],
                                };
                                return [...before, newItem, ...after];
                              });
                            };

                            return (
                              <div
                                className="w-full flex flex-col"
                                key={subsIndex}
                              >
                                <div
                                  className={`w-full flex flex-row p-2 hover:bg-gray-50 transition-all duration-300 ${
                                    highlightedId === `child-${subs.subsPlanId}`
                                      ? "bg-yellow-100"
                                      : ""
                                  }`}
                                  style={{ paddingLeft: "2rem" }}
                                  ref={(el) =>
                                    (itemRefs.current[
                                      `child-${subs.subsPlanId}`
                                    ] = el)
                                  }
                                >
                                  <input
                                    type="checkbox"
                                    className="mr-1"
                                    checked={isChecked(subs.subsPlanId)}
                                    disabled
                                  />

                                  <Button
                                    variant={"ghost"}
                                    size={"sm"}
                                    onClick={toggleExpandSubs}
                                  >
                                    <KeenIcon
                                      icon="right"
                                      className={
                                        subs.isExpand ? "rotate-90" : ""
                                      }
                                    />
                                  </Button>
                                  <DefaultTooltip
                                    title={subs.subsPlanName}
                                    placement="top"
                                  >
                                    <div className="flex-1 truncate items-center my-auto">
                                      {subs.subsPlanName}
                                    </div>
                                  </DefaultTooltip>
                                  <Button
                                    variant={"ghost"}
                                    size={"sm"}
                                    onClick={() => onSelectPlan(subs)}
                                  >
                                    <KeenIcon icon="plus" />
                                  </Button>
                                </div>
                                {subs.isExpand && (
                                  <div
                                    className="w-full flex flex-row p-2 hover:bg-gray-50"
                                    style={{ paddingLeft: "4rem" }}
                                  >
                                    <Button variant={"ghost"} size={"sm"}>
                                      <KeenIcon icon="menu" />
                                    </Button>
                                    <DefaultTooltip
                                      title={subs.effDate}
                                      placement="top"
                                    >
                                      <div className="flex-1 truncate items-center my-auto">
                                        {subs.effDate}
                                      </div>
                                    </DefaultTooltip>
                                    <Button
                                      variant={"ghost"}
                                      size={"sm"}
                                      onClick={() => onSelectPlan(subs)}
                                    >
                                      <KeenIcon icon="plus" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Inbox className="w-8 h-8 mb-2 opacity-50" />
                    No record to view
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* mid */}
          <div className="flex-1 flex flex-col h-full justify-center items-center">
            <Button variant={"ghost"} className="w-[40px]" onClick={allAdd}>
              <KeenIcon icon="right" />
            </Button>
            <Button variant={"ghost"} className="w-[40px]" onClick={allDelete}>
              <KeenIcon icon="left" />
            </Button>
          </div>
          {/* right */}
          <div className="flex flex-col w-[45%] pt-5 gap-2">
            <div className="py-2">
              Your selected member {selectedPlans.length}
            </div>
            <div className="w-full flex flex-col flex-1 rounded-md overflow-hidden">
              <div className="w-full p-2 bg-gray-200 flex flex-row">
                <DefaultTooltip title="Valid Period" placement="top">
                  <div className="w-3/4">Valid Period</div>
                </DefaultTooltip>
                <DefaultTooltip title="Is Necessary" placement="top">
                  <div className="w-1/4 truncate">Is Necessary</div>
                </DefaultTooltip>
              </div>
              <div className="border-2 flex-1 overflow-y-auto overflow-hidden">
                {selectedPlans.length > 0 ? (
                  selectedPlans.map((plan, index) => {
                    const toggleNecessary = () => {
                      setSelectedPlans((prev) => {
                        const before = prev?.slice(0, index) ?? [];
                        const after = prev?.slice(index + 1, prev.length) ?? [];
                        const newItem: joinSubsPlan = {
                          ...plan,
                          necessary: plan.necessary === "1" ? "0" : "1",
                        };
                        return [...before, newItem, ...after];
                      });
                    };

                    return (
                      <div
                        className={`w-full flex flex-row p-2 hover:bg-gray-50 transition-all duration-300 ${
                          highlightedId === `group-${plan.effDate}`
                            ? "bg-yellow-100"
                            : ""
                        }`}
                        ref={(el) =>
                          (itemRefs.current[`group-${plan.effDate}`] = el)
                        }
                      >
                        <DefaultTooltip
                          title={plan.subsPlanName}
                          placement="top"
                        >
                          <div className="flex-1 truncate items-center my-auto">
                            {plan.effDate}
                          </div>
                        </DefaultTooltip>
                        <div className="w-1/5">
                          <input
                            type="checkbox"
                            className="mr-1"
                            // disabled
                            checked={plan.necessary === "1"}
                            onChange={toggleNecessary}
                          />
                          <Button
                            variant={"ghost"}
                            size={"sm"}
                            onClick={() => onDeletePlan(plan)}
                          >
                            <KeenIcon icon="trash" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Inbox className="w-8 h-8 mb-2 opacity-50" />
                    No record to view
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row w-full justify-end gap-2 mt-2">
          <Button onClick={handleConfirm}>OK</Button>
          <Button variant={"outline"} onClick={() => handleOpen(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </DialogWrapper>
  );
};

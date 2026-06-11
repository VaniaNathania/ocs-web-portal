import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaFolderOpen } from "react-icons/fa";
import { useEventListContext } from "../hooks/useEventContext";
import { FaFile } from "react-icons/fa";
import { DefaultTooltip, KeenIcon } from "@/components";
import EventNode from "./EventNode";
import { IoTimeOutline } from "react-icons/io5";
import { ReUsageList } from "../hooks/EventContext";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const ratableType = 0;
const usageType = 1;
const recurringType = 2;
const subscriptionType = 3;

const EventSideBar = () => {
  const {
    setSelectedReType,
    reRecurringList,
    reSubsEventList,
    reUsageList,
    handleSelectedItem,
    setSelectedItem,
    setAddTrigger,
    setMode,
    selectedReType,
    selectedItem,
    menuPrivAccess,
  } = useEventListContext();
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowSuggestions]);

  const handleToggleExpand = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const ratableExpand = expandedRows.includes(ratableType);
  const usageExpand = expandedRows.includes(usageType);
  const recurringExpand = expandedRows.includes(recurringType);
  const subscriptionExpand = expandedRows.includes(subscriptionType);

  useEffect(() => {
    setExpandedRows([ratableType, usageType, recurringType, subscriptionType]);
  }, []);

  const handleRatableEvent = () => {
    setSelectedReType(null);
  };

  const handleUsageEvent = () => {
    setSelectedReType("1");
  };

  const handleRecurringEvent = () => {
    setSelectedReType("2");
  };

  const handleSubscriptionEvent = () => {
    setSelectedReType("3");
  };

  const triggerNewUsage = () => {
    setAddTrigger((prev: any) => ({ type: "usage", count: prev.count + 1 }));
  };

  const triggerNewSubscription = () => {
    setAddTrigger((prev: any) => ({
      type: "subscription",
      count: prev.count + 1,
    }));
  };

  const triggerNewRecurring = () => {
    setAddTrigger((prev: any) => ({
      type: "recurring",
      count: prev.count + 1,
    }));
  };

  const flattenTree = (nodes: ReUsageList[]) => {
    let result: ReUsageList[] = [];

    nodes.forEach((node) => {
      result.push(node);

      if (node.children?.length) {
        result = result.concat(flattenTree(node.children));
      }
    });

    return result;
  };

  const flatUsageList = flattenTree(reUsageList);

  const combinedList = [
    ...flatUsageList,
    ...reRecurringList,
    ...reSubsEventList,
  ];

  const searchResult = combinedList.filter((item) =>
    item.reName.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const clearSearch = () => {
    setSearchValue("");
    setShowSuggestions(false);
  };

  const findParents = (
    nodes: ReUsageList[],
    targetId: number,
    path: number[] = [],
  ): number[] | null => {
    for (let node of nodes) {
      if (node.reId === targetId) {
        return path;
      }
      if (node.children?.length) {
        const result = findParents(node.children, targetId, [
          ...path,
          node.reId,
        ]);
        if (result) return result;
      }
    }
    return null;
  };

  const scrollToSelected = useCallback(() => {
    setTimeout(() => {
      selectedRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  }, []);

  // auto scroll selectedItem
  useEffect(() => {
    scrollToSelected();
  }, [expandedRows, subscriptionExpand, recurringExpand]);

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-semibold text-gray-800">Event</span>
        </div>

        <div className="relative" ref={wrapperRef}>
          <div className="flex gap-x-1">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search Keywords"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setShowSuggestions(true);
              }}
            />
            {searchValue && (
              <Button
                variant="ghost"
                type="button"
                onClick={clearSearch}
                className="flex flex-row text-gray-400 hover:text-gray-600 hover:bg-white transition-colors gap-"
              >
                <KeenIcon icon="cross" />
              </Button>
            )}
          </div>

          {showSuggestions && (
            <ul className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-md z-50 max-h-40 overflow-auto">
              {searchResult.length > 0 ? (
                searchResult.map((item, index) => (
                  <li
                    key={`${item.reId}-${index}`}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSelectedItem(item);
                      setSelectedReType("999");
                      setShowSuggestions(false);
                      scrollToSelected();

                      // auto expand
                      if (item.reType === "1") {
                        // usage
                        const parentIds = findParents(reUsageList, item.reId);
                        if (parentIds) {
                          setExpandedRows((prev) => [
                            ...new Set([
                              ...prev,
                              ...parentIds,
                              item.reId,
                              usageType,
                            ]),
                          ]);
                        } else {
                          setExpandedRows((prev) => [
                            ...new Set([...prev, usageType]),
                          ]);
                        }
                      }

                      if (item.reType === "2") {
                        // recurring
                        setExpandedRows((prev) => [
                          ...new Set([...prev, recurringType]),
                        ]);
                      }

                      if (item.reType === "3") {
                        // subscription
                        setExpandedRows((prev) => [
                          ...new Set([...prev, subscriptionType]),
                        ]);
                      }
                    }}
                  >
                    <DefaultTooltip title={item.reName} placement="top">
                      <div className="w-full truncate">{item.reName}</div>
                    </DefaultTooltip>
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-center">No record found..</li>
              )}
            </ul>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul>
          <li>
            {/* Ratable event */}
            <div
              className={`flex w-full p-1 items-center rounded ${!selectedReType || selectedReType === null ? "bg-red-500 text-white" : ""}`}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation(); // biar ga ikut trigger parent
                  handleToggleExpand(ratableType);
                }}
                className="p-1 cursor-pointer"
              >
                {ratableExpand ? (
                  <ChevronDown className="size-5" />
                ) : (
                  <ChevronRight className="size-5" />
                )}
              </div>
              <div
                className="flex flex-row items-center justify-start cursor-pointer"
                onClick={() => {
                  setSelectedItem(null);
                  handleRatableEvent();
                  setMode("view");
                }}
              >
                <div className="flex flex-row items-center">
                  <FaFolderOpen className="text-yellow-400 mr-2" />
                  <span
                    className={`text-sm ${!selectedReType || selectedReType === null ? "" : "hover:text-gray-900"}`}
                  >
                    Ratable Event
                  </span>
                </div>
              </div>
            </div>

            {ratableExpand && (
              <div>
                {/* usage event */}
                <ul className="ml-4">
                  <div
                    className={`flex group w-full items-center justify-between rounded ${selectedReType === "1" ? "bg-red-500 text-white" : ""}`}
                  >
                    <div
                      className="flex flex-row items-center min-w-0 cursor-pointer"
                      onClick={() => {
                        setSelectedItem(null);
                        handleUsageEvent();
                        setMode("view");
                      }}
                    >
                      <div
                        onClick={(e) => {
                          e.stopPropagation(); // biar ga ikut trigger parent
                          handleToggleExpand(usageType);
                        }}
                        className="p-1 cursor-pointer"
                      >
                        {usageExpand ? (
                          <ChevronDown className="size-5" />
                        ) : (
                          <ChevronRight className="size-5" />
                        )}
                      </div>
                      <div className="flex items-center truncate">
                        {reUsageList.length > 0 ? (
                          <FaFolderOpen className="text-yellow-400" />
                        ) : (
                          <FaFile />
                        )}
                        <span
                          className={`ml-2 text-sm ${selectedReType === "1" ? "" : "hover:text-gray-900"}`}
                        >
                          Usage Event
                        </span>
                      </div>
                    </div>
                    <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
                      <Button
                        variant="ghost"
                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 ml-2 ${selectedReType === "1" ? "hover:bg-red-500 hover:text-white" : "hover:bg-white"}`}
                        onClick={(e) => {
                          e.stopPropagation(); // biar ga ikut trigger event parent
                          setSelectedItem({ reId: null, reType: "1" });
                          setSelectedReType("999");
                          triggerNewUsage();
                        }}
                      >
                        <KeenIcon icon="plus" />
                      </Button>
                    </AccessWrapper>
                  </div>

                  {usageExpand &&
                    reUsageList.map((item) => (
                      <EventNode
                        key={item.reId}
                        item={item}
                        expandedIds={expandedRows}
                        toggleExpand={handleToggleExpand}
                        selectedRef={selectedRef}
                      />
                    ))}
                </ul>

                {/* recurring event */}
                <ul className="ml-4">
                  <div
                    ref={selectedReType === "2" ? selectedRef : null}
                    className={`flex group w-full items-center rounded ${selectedReType === "2" ? "bg-red-500 text-white" : ""}`}
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation(); // biar ga ikut trigger parent
                        handleToggleExpand(recurringType);
                      }}
                      className="p-1 cursor-pointer"
                    >
                      {reRecurringList.length > 0 ? (
                        recurringExpand ? (
                          <ChevronDown className="size-5" />
                        ) : (
                          <ChevronRight className="size-5" />
                        )
                      ) : null}
                    </div>
                    <div
                      className="flex w-full justify-start "
                      onClick={() => {
                        setSelectedItem(null);
                        handleRecurringEvent();
                        setMode("view");
                      }}
                    >
                      <div className="flex flex-row items-center cursor-pointer">
                        {reRecurringList.length > 0 ? (
                          <FaFolderOpen className="text-yellow-400" />
                        ) : (
                          <FaFile />
                        )}
                        <span
                          className={`ml-2 text-sm ${selectedReType === "2" ? "" : "hover:text-gray-900"}`}
                        >
                          Recurring Event
                        </span>
                      </div>
                    </div>
                    <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
                      <Button
                        variant="ghost"
                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 ml-2 ${selectedReType === "2" ? "hover:bg-red-500 hover:text-white" : "hover:bg-white"}`}
                        onClick={(e) => {
                          e.stopPropagation(); // biar ga ikut trigger event parent
                          setSelectedItem({ reType: "2" });
                          setSelectedReType("999");
                          triggerNewRecurring();
                        }}
                      >
                        <KeenIcon icon="plus" />
                      </Button>
                    </AccessWrapper>
                  </div>

                  {recurringExpand &&
                    reRecurringList.map((item) => (
                      <div
                        ref={
                          selectedItem?.reId === item?.reId ? selectedRef : null
                        }
                      >
                        <li key={item.reId}>
                          <Button
                            variant="ghost"
                            className={`flex group items-center gap-2 pl-6 ${selectedItem?.reName === item.reName ? "bg-red-500 text-white hover:bg-red-500 hover:text-white" : "hover:bg-white"}`}
                            onClick={() => {
                              setSelectedReType("999");
                              handleSelectedItem(item);
                              setMode("view");
                            }}
                          >
                            <IoTimeOutline />
                            <div className="w-[200px] text-left truncate">
                              {item.reName}
                            </div>
                          </Button>
                        </li>
                      </div>
                    ))}
                </ul>

                {/* subscription event */}
                <ul className="ml-4">
                  <div
                    ref={selectedReType === "3" ? selectedRef : null}
                    className={`flex w-full group items-center rounded ${selectedReType === "3" ? "bg-red-500 text-white" : ""}`}
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation(); // biar ga ikut trigger parent
                        handleToggleExpand(subscriptionType);
                      }}
                      className="p-1 cursor-pointer"
                    >
                      {reSubsEventList.length > 0 ? (
                        subscriptionExpand ? (
                          <ChevronDown className="size-5" />
                        ) : (
                          <ChevronRight className="size-5" />
                        )
                      ) : null}
                    </div>
                    <div
                      className="flex w-full justify-start"
                      onClick={() => {
                        setSelectedItem(null);
                        handleSubscriptionEvent();
                        setMode("view");
                      }}
                    >
                      <div className="flex flex-row items-center cursor-pointer">
                        {reSubsEventList.length > 0 ? (
                          <FaFolderOpen className="text-yellow-400" />
                        ) : (
                          <FaFile />
                        )}
                        <span
                          className={`ml-2 text-sm ${selectedReType === "3" ? "" : "hover:text-gray-900"}`}
                        >
                          Subscription Event
                        </span>
                      </div>
                    </div>
                    <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
                      <Button
                        variant="ghost"
                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 ml-2 ${selectedReType === "3" ? "hover:bg-red-500 hover:text-white" : "hover:bg-white"}`}
                        onClick={(e) => {
                          e.stopPropagation(); // biar ga ikut trigger event parent
                          setSelectedItem({ reType: "3" });
                          setSelectedReType("999");
                          triggerNewSubscription();
                        }}
                      >
                        <KeenIcon icon="plus" />
                      </Button>
                    </AccessWrapper>
                  </div>

                  {subscriptionExpand &&
                    reSubsEventList.map((item) => (
                      <div
                        ref={
                          selectedItem?.reId === item?.reId ? selectedRef : null
                        }
                      >
                        <li key={item.reId}>
                          <Button
                            variant="ghost"
                            className={`flex group items-center gap-2 pl-6 ${selectedItem?.reName === item.reName ? "bg-red-500 text-white hover:bg-red-500 hover:text-white" : "hover:bg-white"}`}
                            onClick={() => {
                              handleSelectedItem(item);
                              setSelectedReType("999");
                              setMode("view");
                            }}
                          >
                            <IoTimeOutline />
                            <div className="w-[200px] text-left truncate">
                              {item.reName}
                            </div>
                          </Button>
                        </li>
                      </div>
                    ))}
                </ul>
              </div>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default EventSideBar;

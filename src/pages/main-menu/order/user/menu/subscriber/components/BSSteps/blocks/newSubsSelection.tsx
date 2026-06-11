import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import { useBrandShift } from "../hooks/context";
import { useCallApi } from "@/hooks";
import { SubsPlanByCatgList, SubsPlanIDList } from "../model/interface";
import { apiConfigOrder } from "@/config/api.config";
import { useSubscriberListContext } from "../../../hooks";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";

const API_ORDER = apiConfigOrder.order;

const NewSubsSelect = () => {
  const { selectedSubs } = useSubscriberListContext();
  const {
    subsSelect,
    setSubsSelect,
    allData,
    selectedNewSubs,
    setSelectedNewSubs,
    setSelectedNewCatg,
  } = useBrandShift();
  const { GetData, PostData } = useCallApi();
  const [recordCatg, setRecordCatg] = useState<
    Record<string, SubsPlanByCatgList>
  >({});
  const [recordSubs, setRecordSubs] = useState<
    Record<string, SubsPlanByCatgList[]>
  >({});
  const [selectedRow, setSelectedRow] = useState<SubsPlanByCatgList>();
  const [activeList, setActiveList] = useState<SubsPlanIDList[]>([]);
  const [attrShow, setAttrShow] = useState<{ [id: string]: boolean }>({});
  const [search, setSearch] = useState("");

  const [suggestions, setSuggestions] = useState<SubsPlanByCatgList[]>([]);

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleSearch = (value: string) => {
    setSearch(value);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const keyword = value.toLowerCase();

    const matched: SubsPlanByCatgList[] = [];

    Object.values(recordSubs).forEach((subs) => {
      subs.forEach((item) => {
        if (item.offerName?.toLowerCase().includes(keyword)) {
          matched.push(item);
        }
      });
    });

    setSuggestions(matched.slice(0, 8));
  };

  const scrollToItem = (item: SubsPlanByCatgList) => {
    if (!item.parentCatgId || !item.nodeId) return;

    // expand category
    setAttrShow((prev) => ({
      ...prev,
      [item.parentCatgId!]: true,
    }));

    setSelectedRow(item);

    setTimeout(() => {
      const rowEl = rowRefs.current[item.nodeId ?? ""];

      const containerEl = containerRef.current;

      if (!rowEl || !containerEl) return;

      const containerTop = containerEl.getBoundingClientRect().top;

      const rowTop = rowEl.getBoundingClientRect().top;

      const scrollOffset = rowTop - containerTop + containerEl.scrollTop - 120;

      containerEl.scrollTo({
        top: scrollOffset,
        behavior: "smooth",
      });
    }, 350);

    setSuggestions([]);
  };

  const fetchInitialDataUseQuery = async (): Promise<boolean> => {
    try {
      const catg = await GetData(
        `${API_ORDER}/api/order-entry/go-shop/qry-offer-catalog`,
        {},
      );
      if (!catg.status) {
        toast.error(catg.message);
        return false;
      }

      const resp1 = await GetData(
        `${API_ORDER}/api/order-entry/go-shop/qry-subs-plan-and-catg-by-offer-catg`,
        {
          servType: selectedSubs?.servType,
        },
      );

      if (!resp1.status) {
        toast.error(resp1.message);
        return false;
      }

      const tempTypeC: Record<string, SubsPlanByCatgList> = {};
      const tempTypeS: Record<string, SubsPlanByCatgList[]> = {};
      const tempPayload: SubsPlanIDList[] = [];

      const tempSubsByCatg: SubsPlanByCatgList[] = [
        ...(resp1.data ?? []),
        ...(catg.data ?? []),
      ];

      tempSubsByCatg.forEach((item) => {
        if (item.type === "S") {
          tempTypeS[item.parentCatgId] = [
            ...(tempTypeS[item.parentCatgId] ?? []),
            item,
          ];
          tempPayload.push({
            flag: true,
            indepProdSpecId: item.indepProdSpecId ?? 0,
            spId: item.spId,
            subsPlanId: item.offerId ?? 0,
          });
        } else if (item.type === "C") {
          tempTypeC[item.nodeId] = item;
        }
      });

      //  console.log(tempPayload);

      const resp2 = await PostData(
        `${API_ORDER}/api/order-entry/subs-plan/filter-subs-plan-by-terminal`,
        {
          subsId: allData?.orderItemList[0].subsId,
          upgradeType: allData?.orderItemList[0].subsBaseOrder?.upgradeType,
          oldSubsPlanId:
            allData?.orderItemList[0].subsBaseOrder?.oldSubsPlanId ??
            allData?.orderItemList[0].subsBaseOrder?.subsPlanId,
          subsPlanIdList: tempPayload,
        },
      );
      if (!resp2?.status) {
        toast.error(resp2?.message);
        return false;
      }

      //  console.log("ini data C-S", tempTypeC, tempTypeS);

      setRecordCatg(tempTypeC);
      setRecordSubs(tempTypeS);

      return true;
    } catch (error) {
      //  console.log(error);

      return false;
    }
  };

  useEffect(() => {
    if (allData) fetchInitialDataUseQuery();
  }, [allData]);

  return (
    <DialogWrapper
      isOpen={subsSelect}
      handleDialog={setSubsSelect}
      title="New Subscription Plan"
      size={{ width: "4xl" }}
    >
      <div className="flex flex-col pb-5">
        <div className="p-2 border-b relative">
          <div className="relative">
            <KeenIcon
              icon="magnifier"
              className="
        absolute
        left-3
        top-1/2
        -translate-y-1/2
        text-gray-500
        z-10
      "
            />

            <input
              type="text"
              placeholder="Search subscription..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="
        w-full
        border
        rounded-md
        pl-10
        pr-3
        py-2
        text-sm
        focus:outline-none
        focus:ring-2
        focus:ring-primary
      "
            />
          </div>

          {suggestions.length > 0 && (
            <div
              className="
        absolute
        left-2
        right-2
        mt-1
        bg-white
        border
        rounded-md
        shadow-lg
        z-50
        max-h-[300px]
        overflow-y-auto
      "
            >
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  className={clsx(
                    "px-3 py-2 cursor-pointer text-sm",
                    "hover:bg-slate-100",
                    selectedRow?.nodeId === item.nodeId && "bg-primary-light",
                  )}
                  onClick={() => {
                    setSearch(item.offerName ?? "");

                    scrollToItem(item);
                  }}
                >
                  <div className="font-medium">{item.offerName}</div>

                  <div className="text-xs text-gray-500">
                    {recordCatg[item.parentCatgId ?? ""]?.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          className="flex flex-col flex-1 overflow-y-auto max-h-[400px]"
          ref={containerRef}
        >
          {Object.values(recordCatg).map((catg, index) => {
            if (!recordSubs[catg.nodeId]) return;
            return (
              <div
                key={index}
                className={clsx(
                  `flex flex-col overflow-hidden`,
                  "transition-[max-height] duration-500 ease-in-out",
                  "",
                  `${attrShow[catg.nodeId ?? ""] ? `max-h-[10000px] min-h-fit` : "max-h-[44px] min-h-[44px]"}`,
                )}
              >
                <div
                  onClick={() =>
                    setAttrShow((prev) => ({
                      ...prev,
                      [catg.nodeId]: !prev[catg.nodeId],
                    }))
                  }
                  className="p-2 hover:bg-slate-100 gap-2 flex items-center"
                >
                  <KeenIcon
                    icon="right"
                    className={`transition-all duration-500 ${attrShow[catg.nodeId ?? ""] ? `rotate-90` : "rotate-0"}`}
                  />
                  <span>{catg.name}</span>
                </div>
                <div>
                  {recordSubs[catg.nodeId]?.map((sub, ids) => {
                    return (
                      <div
                        className={clsx(
                          `p-2 pl-10`,
                          // "transition-all duration-300 ease-in-out",
                          "hover:bg-slate-100",
                          `${selectedRow?.nodeId === sub.nodeId ? "bg-primary-light" : "bg-none"}`,
                        )}
                        ref={(el) => {
                          rowRefs.current[sub.nodeId ?? ""] = el;
                        }}
                        onClick={() => {
                          setSelectedRow(sub);
                        }}
                        key={ids}
                      >
                        {sub.offerName}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-row justify-end absolute bottom-0 p-2 right-5 w-full bg-white gap-2">
          <Button
            size={"sm"}
            onClick={() => {
              setSelectedNewCatg(recordCatg[selectedRow?.parentCatgId ?? ""]);
              setSelectedNewSubs(selectedRow);
              setSubsSelect(false);
            }}
          >
            OK
          </Button>
          <Button
            size={"sm"}
            variant={"outline"}
            onClick={() => {
              setSubsSelect(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </DialogWrapper>
  );
};
export default NewSubsSelect;

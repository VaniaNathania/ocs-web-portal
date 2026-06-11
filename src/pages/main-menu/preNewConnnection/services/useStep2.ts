import { useCallApi } from "@/hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePreNew } from "../hooks/context";
import { apiConfigOrder, apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import {
  effectiveDurationValue,
  fetchQrySubsPlanAttrFijiParams,
  ModSubsGridRow,
  searchResultProps,
  SubsPlanAttrFiji,
} from "../interface";
import { useDebounce } from "@/layouts/main-menu/price-plan/blocks/ListToolBar";
const API_URL = apiConfigOrder.order;
const API_URL_REF = apiConfigRef.ref;

const useStep2 = () => {
  const { form, setForm } = usePreNew();
  const {
    vasPnFijiDatas,
    expandedRows,
    subsPlanId,
    subsPlanAttrFijiRow,
    timeUnitDatas,
    selectItems,
  } = form;
  const { GetData } = useCallApi();
  const [expandedFeature, setExpandedFeature] = useState<string[]>([]);
  const prevSubsPlanId = useRef<number | undefined>();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  // const [debounceSearch, setDebounceSearch] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string>();
  const rowRefs = useRef<Record<string, HTMLElement | null>>({});
  const debounceValRef = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );

  const [search, setSearch] = useState<string>("");

  const [pendingScrollKey, setPendingScrollKey] = useState<string | null>(null);

  const dupCounter = useRef(0);
  const isDefaultsInitializedRef = useRef(false);

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

  const generateDuplicateId = (baseId: number) => {
    dupCounter.current++;
    return `C-${baseId}-DUPL-${dupCounter.current}`;
  };

  const fetchTimeUnit = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/ratable-event-action/qry-time-unit-billing-cycle`,
        {
          tag: "Y",
        },
      );

      const datas = response.data ?? [];

      if (response?.status) {
        setForm((prev) => ({
          ...prev,
          timeUnitDatas: datas,
        }));
        return response.data;
      }
    } catch (error) {
      //  console.log(error);
    }
  };

  const fetchQrySubsPlanAttrFiji = async ({
    subsPlanId,
    offerId,
    mode,
  }: fetchQrySubsPlanAttrFijiParams) => {
    try {
      const response = await GetData(
        `${API_URL}/api/order-entry/subs-plan/qry-subs-plan-attr-fiji`,
        {
          offerId,
          subsPlanId,
          fish: true,
        },
      );

      if (response?.status) {
        const data = response.data;

        if (mode === "fromDialog") {
          setForm((prev) => ({
            ...prev,
            subsPlanAttrFijiDialog: data,
          }));
        }

        if (mode === "fromRow") {
          setForm((prev) => ({
            ...prev,
            subsPlanAttrFijiRow: {
              ...prev.subsPlanAttrFijiRow,
              [offerId]: data,
            },
          }));
        }
      }
    } catch (err) {
      toast.error("Failed");
    }
  };

  const fetchQryVasPnFiji = async (subsPlanId: number) => {
    try {
      setForm((prev) => ({
        ...prev,
        isVasPnFijiLoading: true,
      }));
      const response = await GetData(
        `${API_URL}/api/order-entry/common-service/qry-vas-pn-fiji`,
        {
          subsPlanId,
          offerType: "3,4,6",
        },
      );

      const datas = response.data ?? [];

      if (response?.status) {
        // Reset flag dan set data
        isDefaultsInitializedRef.current = false;

        // Collect all default items upfront
        const allDefaultItems: ModSubsGridRow[] = [];
        datas.forEach((parent: any) => {
          if (parent.id && parent.defaultFlag === "Y") {
            allDefaultItems.push({
              ...parent,
              __rowType: "PARENT",
              __level: 0,
              __hasChildren: !!parent.children?.length,
              __clientKey: `P-${parent.id}`,
            });
          }
          if (parent.children) {
            parent.children.forEach((child: any) => {
              if (child.id && child.defaultFlag === "Y") {
                allDefaultItems.push({
                  ...child,
                  __rowType: "CHILD",
                  __level: 1,
                  __parentId: child.parentId,
                  __clientKey: child.__clientKey ?? `C-${child.id}`,
                });
              }
            });
          }
        });

        setForm((prev) => ({
          ...prev,
          vasPnFijiDatas: datas,
          selectItems: allDefaultItems, // Set defaults directly on fetch success
        }));

        // Fetch attrs for each default selected
        allDefaultItems.forEach((item) => {
          fetchQrySubsPlanAttrFiji({
            mode: "fromRow",
            subsPlanId: subsPlanId,
            offerId: item.id,
          });
        });
      }
    } catch (err) {
      toast.error("Failed GetData!");
    } finally {
      setForm((prev) => ({
        ...prev,
        isVasPnFijiLoading: false,
      }));
    }
  };

  const data = useMemo(() => {
    if (!vasPnFijiDatas) return;
    const rows: ModSubsGridRow[] = [];

    vasPnFijiDatas.forEach((parent) => {
      if (!parent.id || parent.defaultPricePlan === true) return;
      rows.push({
        ...parent,
        __rowType: "PARENT",
        __level: 0,
        __hasChildren: !!parent.children?.length,
        __clientKey: `P-${parent.id}`,
      });

      if (expandedRows.includes(parent.id)) {
        parent.children
          ?.filter((child) => child.defaultPricePlan !== true)
          .forEach((child) => {
            if (!child.parentId) return;
            rows.push({
              ...child,
              __rowType: "CHILD",
              __level: 1,
              __parentId: child.parentId,
              __clientKey: child.__clientKey ?? `C-${child.id}`,
            });
          });
      }
    });

    return rows;
  }, [vasPnFijiDatas, expandedRows]);

  useEffect(() => {
    if (!vasPnFijiDatas) return;
    setForm((prev) => ({
      ...prev,
      expandedRows: vasPnFijiDatas.map((p) => p.id).filter(Boolean),
    }));
  }, [vasPnFijiDatas, subsPlanId]);

  useEffect(() => {
    if (!data) return;

    setForm((prev) => {
      const nextEffectiveType = { ...prev.effectiveType };
      const nextEffectiveDuration = { ...prev.effectiveDuration };
      const nextTimeUnit = { ...prev.timeUnit };

      data.forEach((row) => {
        if (!row.__clientKey || row.__rowType !== "CHILD") return;
        if (row.offerDto?.effType && !nextEffectiveType[row.__clientKey]) {
          nextEffectiveType[row.__clientKey] = row.offerDto.effType;
        }
        if (!nextEffectiveDuration[row.__clientKey]) {
          nextEffectiveDuration[row.__clientKey] = row.expOff ?? "";
        }
        if (!nextTimeUnit[row.__clientKey]) {
          nextTimeUnit[row.__clientKey] = row.expTimeUnit ?? "";
        }
      });

      // Handle duplicated children (preserve existing selectItems + add new duplicates)
      const duplicatedChildren = data.filter(
        (row) => row.__rowType === "CHILD" && row.duplicateFlag === "Y",
      );
      const map = new Map(prev.selectItems.map((v) => [v.__clientKey, v]));
      duplicatedChildren?.forEach((item) => {
        map.set(item.__clientKey, item);
      });

      const nextClientKeyToOfferId = { ...prev.clientKeyToOfferId };
      data.forEach((row) => {
        if (row.__rowType === "CHILD" && row.__clientKey && row.id) {
          nextClientKeyToOfferId[row.__clientKey] = row.id;
        }
      });

      return {
        ...prev,
        effectiveType: nextEffectiveType,
        effectiveDuration: nextEffectiveDuration,
        timeUnit: nextTimeUnit,
        selectItems: Array.from(map.values()),
        clientKeyToOfferId: nextClientKeyToOfferId,
      };
    });
  }, [data]);

  const handleDetail = (clientKey: string, value: SubsPlanAttrFiji) => {
    setForm((prev) => ({
      ...prev,
      detailValue: {
        ...prev.detailValue,
        [clientKey]: value,
      },
      selectItems: prev.selectItems.map((item) =>
        item.__clientKey === clientKey ? { ...item, attrsVal: value } : item,
      ),
    }));
  };

  const handleProductAlias = (clientKey: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      productAlias: {
        ...prev.productAlias,
        [clientKey]: value,
      },
      selectItems: prev.selectItems.map((item) =>
        item.__clientKey === clientKey ? { ...item, prodAlias: value } : item,
      ),
    }));
  };

  const handleEffectiveDuration = (
    clientKey: string,
    value: effectiveDurationValue,
  ) => {
    setForm((prev) => ({
      ...prev,
      effectiveDuration: {
        ...prev.effectiveDuration,
        [clientKey]: value.duration,
      },
      timeUnit: {
        ...prev.timeUnit,
        [clientKey]: value.timeUnit,
      },
    }));
  };

  const handleEffectiveType = (clientKey: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      effectiveType: {
        ...prev.effectiveType,
        [clientKey]: value,
      },
    }));
  };

  const handleCheckboxChange = (item: ModSubsGridRow) => {
    setForm((prev) => {
      const isExist = prev.selectItems.some(
        (v) => v.__clientKey === item.__clientKey,
      );

      if (isExist) {
        // search duplicate item
        const duplicatedKeys = prev.vasPnFijiDatas.flatMap(
          (parent) =>
            parent.children
              ?.filter((child) => child.__oriClientKey === item.__clientKey)
              .map((child) => child.__clientKey) ?? [],
        );

        // grouping original and duplicated keys to remove from selectItems and table
        const removeKeys = new Set([item.__clientKey, ...duplicatedKeys]);

        const nextSelectItems = prev.selectItems.filter(
          (v) => !removeKeys.has(v.__clientKey),
        );

        // remove copy from table
        const nextDatas = prev.vasPnFijiDatas.map((parent) => ({
          ...parent,
          children: parent.children
            ? parent.children.filter(
                (child) => !removeKeys.has(child.__clientKey),
              )
            : null,
        }));

        return {
          ...prev,
          selectItems: nextSelectItems,
          vasPnFijiDatas: nextDatas, // remove duplicated from
        };
      }

      return {
        ...prev,
        selectItems: [...prev.selectItems, item],
        clientKeyToOfferId: {
          ...prev.clientKeyToOfferId,
          [item.__clientKey]: item.id,
        },
      };
    });

    if (!subsPlanAttrFijiRow[item.id]) {
      fetchQrySubsPlanAttrFiji({
        offerId: item.id,
        mode: "fromRow",
        subsPlanId: subsPlanId!,
      });
    }

    setExpandedFeature((prev) => [...prev, item.__clientKey]); // auto expand feature when select
  };

  const handleToggleExpand = (id: number) => {
    setForm((prev) => ({
      ...prev,
      expandedRows: prev.expandedRows.includes(id)
        ? prev.expandedRows.filter((x) => x !== id)
        : [...prev.expandedRows, id],
    }));
  };

  const handleExpandFeature = (clientKey: string) => {
    setExpandedFeature((prev) =>
      prev.includes(clientKey)
        ? prev.filter((key) => key !== clientKey)
        : [...prev, clientKey],
    );
  };

  const handleDuplicateOffer = (id: number) => {
    setForm((prev) => ({
      ...prev,
      vasPnFijiDatas: prev.vasPnFijiDatas.map((parent) => {
        if (!parent.children) return parent;

        const index = parent.children?.findIndex((c) => c.id === id);

        if (index === -1) return parent;

        const target = parent.children[index];

        const duplicatedKey = generateDuplicateId(target.id);

        const oriClientKey = target.__clientKey ?? `C-${target.id}`;

        const duplicated = {
          ...target,
          duplicateFlag: "Y",
          __clientKey: duplicatedKey,
          __oriClientKey: oriClientKey,
        };

        setExpandedFeature((prev) => [...prev, duplicatedKey]); // auto expand feature when duplicate

        return {
          ...parent,
          children: [
            ...parent.children.slice(0, index + 1),
            duplicated,
            ...parent.children.slice(index + 1),
          ],
        };
      }),
    }));

    fetchQrySubsPlanAttrFiji({
      offerId: id,
      mode: "fromRow",
      subsPlanId: subsPlanId!,
    });
  };

  const getTimeUnitName = (id: string) => {
    const found = timeUnitDatas.find((item) => item.id === id);

    return found ? `${found.timeUnitName}(s)` : "";
  };

  useEffect(() => {
    if (!subsPlanId) return;

    if (prevSubsPlanId.current && prevSubsPlanId.current !== subsPlanId) {
      setForm((prev) => ({
        ...prev,
        vasPnFijiDatas: [],
        selectItems: [],
        clientKeyToOfferId: {},
        productAlias: {},
        detailValue: {},
        search: "",
      }));
    }

    prevSubsPlanId.current = subsPlanId;
  }, [subsPlanId]);

  const copyAndAlias =
    selectItems.length > 0 &&
    selectItems.some(
      (item) => item.__rowType === "CHILD" && item.duplicateFlag === "C",
    );

  const gridColsTemplate = copyAndAlias
    ? "grid-cols-[minmax(250px,2fr)_120px_100px_100px_160px_140px_120px]"
    : "grid-cols-[minmax(250px,2fr)_100px_100px_160px_140px_120px]";

  const flatChildSearchSource = useMemo(() => {
    if (!vasPnFijiDatas) return [];

    const list: searchResultProps[] = [];

    vasPnFijiDatas.forEach((rows) => {
      if (!rows.id || rows.defaultPricePlan === true) return;

      rows.children
        ?.filter((item) => item.defaultPricePlan !== true)
        .forEach((child) => {
          if (!child.parentId) return;

          list.push({
            id: child.id,
            name: child.name,
            nameLower: child.name.toLowerCase(),
            __clientKey: child.__clientKey ?? `C-${child.id}`,
            parentId: child.parentId,
          });
        });
    });

    return list;
  }, [vasPnFijiDatas]);

  const debounceSearch = useDebounce(search, 300);

  const searchResult = useMemo(() => {
    if (!debounceSearch) return flatChildSearchSource;

    const lowerSearch = search.toLowerCase();
    const result = flatChildSearchSource.filter((item) =>
      item.nameLower.includes(lowerSearch),
    );

    return result;
  }, [debounceSearch, flatChildSearchSource]);

  const handleSelectedItem = (clientKey: string) => {
    setSelectedItem(clientKey);
  };

  const handleResetSearch = () => {
    if (!search) return;

    setSearch("");
  };

  useEffect(() => {
    if (!pendingScrollKey) return;

    requestAnimationFrame(() => {
      const el = rowRefs.current[pendingScrollKey];
      if (!el) return;

      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      setPendingScrollKey(null);
    });
  }, [pendingScrollKey, data]);

  return {
    fetchTimeUnit,
    fetchQryVasPnFiji,
    fetchQrySubsPlanAttrFiji,
    handleCheckboxChange,
    handleToggleExpand,
    handleDetail,
    handleDuplicateOffer,
    handleEffectiveDuration,
    handleProductAlias,
    handleEffectiveType,
    getTimeUnitName,
    copyAndAlias,
    data,
    showSuggestions,
    setShowSuggestions,
    searchResult,
    wrapperRef,
    selectedItem,
    handleSelectedItem,
    rowRefs,
    pendingScrollKey,
    setPendingScrollKey,
    search,
    setSearch,
    handleResetSearch,
    gridColsTemplate,
    handleExpandFeature,
    expandedFeature,
    setExpandedFeature,
    debounceValRef,
  };
};

export default useStep2;

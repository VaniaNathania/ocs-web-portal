import { KeenIcon } from "@/components";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback, useEffect, useRef, useState } from "react";
import { useZoneMainListContext } from "../hooks/useZoneContext";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import DeleteDialog from "../blocks/DeleteDialog";
import { toast } from "sonner";
import { AccessWrapper, menuAccess, useRoleCheck } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const API_URL_REF = apiConfigRef.ref;

const ZoneSideBar = () => {
  const { GetData } = useCallApi();
  const {
    handleSelectParent,
    handleSelectChild,
    refreshTrigger,
    selectedChildrenSide,
    selectedParent,
    searchZoneValueResults,
    setSearchZoneValueResults,
    showZoneValueDropdown,
    setShowZoneValueDropdown,
    handleSelectedItem,
    handleDeleteZoneDetail,
    handleDeleteBatchZoneDetail,
    setSelectedZonesToDelete,
    menuPrivAccess
  } = useZoneMainListContext();

  const [filterBy, setFilterBy] = useState<string>("1");
  const [loadingParent, setLoadingParent] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(false);
  

  const [parentSide, setParentSide] = useState<any[]>([]);
  const [childrenSide, setChildrenSide] = useState<Record<number, any[]>>({});

  // ✅ type fix: ids are numbers
  const [selectedParentSide, setSelectedParentSide] = useState<number | null>(null);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);

  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [debounceTimerZoneValue, setDebounceTimerZoneValue] = useState<ReturnType<typeof setTimeout> | null>(null);

  const [searchZoneNameResults, setSearchZoneNameResults] = useState<any[]>([]);
  const [showZoneNameDropdown, setShowZoneNameDropdown] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);

  const filterOption = [
    { value: "1", label: "Zone Map Name" },
    { value: "2", label: "Zone Name" },
    { value: "3", label: "Zone Value" },
  ];
  const selectLabel = filterOption.find((opt) => opt.value === filterBy)?.label ?? "";

  const [checkedParents, setCheckedParents] = useState<Set<number>>(new Set());
  const [checkedChildren, setCheckedChildren] = useState<Record<number, Set<number>>>({});

  const isParentChecked = (parent: any) => checkedParents.has(parent.zoneMapId);
  const isChildChecked = (parent: any, child: any) =>
    checkedChildren[parent.zoneMapId]?.has(child.zoneId) || false;

  const handleParentCheckbox = (parent: any, checked: boolean) => {
    if (checked) {
      setCheckedParents((prev) => new Set(prev).add(parent.zoneMapId));

      const children = childrenSide[parent.zoneMapId] || [];
      setCheckedChildren((prev) => {
        const newChecked = { ...prev };
        newChecked[parent.zoneMapId] = new Set(children.map((c: any) => c.zoneId));
        return newChecked;
      });
    } else {
      setCheckedParents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(parent.zoneMapId);
        return newSet;
      });

      setCheckedChildren((prev) => {
        const newChecked = { ...prev };
        newChecked[parent.zoneMapId] = new Set();
        return newChecked;
      });
    }
  };

  const handleChildCheckbox = (parent: any, child: any, checked: boolean) => {
    setCheckedChildren((prev) => {
      const newChecked = { ...prev };
      if (!newChecked[parent.zoneMapId]) newChecked[parent.zoneMapId] = new Set();

      if (checked) newChecked[parent.zoneMapId].add(child.zoneId);
      else newChecked[parent.zoneMapId].delete(child.zoneId);

      if (!checked) {
        setCheckedParents((prevParents) => {
          const newSet = new Set(prevParents);
          newSet.delete(parent.zoneMapId);
          return newSet;
        });
      }

      return newChecked;
    });
  };

  const childrenSideBar = useCallback(
    async (zoneMapId: number) => {
      setLoadingChildren(true);
      try {
        const response = await GetData(`${API_URL_REF}/api/zone/qry-zone-by-map-id`, {
          zoneMapId,
          spId: 0,
        });

        const responseData = response.data || [];

        setChildrenSide((prev) => ({
          ...prev,
          [zoneMapId]: responseData,
        }));

        return responseData;
      } catch (error: any) {
        // console.error("Error fetching children side", error);
        return [];
      } finally {
        setLoadingChildren(false);
      }
    },
    [GetData]
  );

  const handleToggleExpand = (parent: any) => {
    setParentSide((prev) =>
      prev.map((p) =>
        p.zoneMapId === parent.zoneMapId ? { ...p, isExpand: !p.isExpand } : p
      )
    );

    setSelectedParentSide(parent.zoneMapId);

    if (!childrenSide[parent.zoneMapId]) {
      childrenSideBar(parent.zoneMapId);
    }
  };

  // ✅ Parent fetch: preserves expand state; auto-expands ONLY first time; no side effects inside setState
  const parentSideBar = useCallback(
    async (searchName: string = "") => {
      setLoadingParent(true);

      try {
        const response = await GetData(`${API_URL_REF}/api/zone/qry-active-zone-map`, {
          spId: 0,
          zoneMapName: searchName,
        });

        const responseData = response.data || [];

        // Search mode
        if (searchName.trim()) {
          setSearchResult(responseData);
          setShowSearchDropdown(responseData.length > 0);
          return responseData;
        }

        // Normal mode
        let firstIdToExpand: number | null = null;

        setParentSide((prev) => {
          const isFirstLoad = prev.length === 0;

          const merged = responseData.map((p: any) => {
            const old = prev.find((x: any) => x.zoneMapId === p.zoneMapId);
            return { ...p, isExpand: old?.isExpand ?? false };
          });

          if (isFirstLoad && merged.length > 0) {
            merged[0].isExpand = true;
            firstIdToExpand = merged[0].zoneMapId;
          }

          return merged;
        });


        if (firstIdToExpand != null) {
          const firstParent = responseData.find((p: any) => p.zoneMapId === firstIdToExpand);
          if (firstParent) {
            handleSelectParent(firstParent);
          }
          setSelectedParentSide(firstIdToExpand);
          await childrenSideBar(firstIdToExpand);
        }

        return responseData;
      } catch (error: any) {
        // console.error("Error fetching parent side", error);
        return [];
      } finally {
        setLoadingParent(false);
      }
    },
    [GetData, childrenSideBar]
  );

  const handleDeleteSuccess = () => {
    handleSelectParent(null);
    setSelectedParentSide(null);
    setSelectedChild(null);

    if (selectedParent?.zoneMapId) {
      // clear cached children for deleted parent
      setChildrenSide((prev) => {
        const next = { ...prev };
        delete next[selectedParent.zoneMapId];
        return next;
      });
      setCheckedParents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedParent.zoneMapId);
        return newSet;
      });
      setCheckedChildren((prev) => {
        const newChecked = { ...prev };
        delete newChecked[selectedParent.zoneMapId];
        return newChecked;
      });
    }

    parentSideBar("");
  };

  const handleBatchDeleteZones = useCallback(() => {
    const zonesList: Array<{ zoneId: number; zoneName: string }> = [];

    for (const [zoneMapId, checkedZoneIds] of Object.entries(checkedChildren)) {
      if (checkedZoneIds && checkedZoneIds.size > 0) {
        const zones = childrenSide[Number(zoneMapId)] || [];
        checkedZoneIds.forEach((zoneId) => {
          const zone = zones.find((z: any) => z.zoneId === zoneId);
          if (zone) {
            zonesList.push({
              zoneId: zone.zoneId,
              zoneName: zone.zoneName || `Zone ${zoneId}`,
            });
          }
        });
      }
    }

    if (zonesList.length === 0) {
      toast.error("Please select at least one zone to delete");
      return;
    }

    setSelectedZonesToDelete(zonesList);
    handleDeleteBatchZoneDetail(true);
  }, [checkedChildren, childrenSide, setSelectedZonesToDelete, handleDeleteBatchZoneDetail]);

  const handleSelectSuggestion = async (suggestion: any) => {
    isSelectingRef.current = true;

    setSearchValue(suggestion.zoneMapName);
    setShowSearchDropdown(false);

    await parentSideBar("");

    setParentSide((prev) =>
      prev.map((p) =>
        p.zoneMapId === suggestion.zoneMapId
          ? { ...p, isExpand: true }
          : { ...p, isExpand: false }
      )
    );

    setSelectedParentSide(suggestion.zoneMapId);

    if (!childrenSide[suggestion.zoneMapId]) {
      await childrenSideBar(suggestion.zoneMapId);
    }

    // select parent in context
    handleSelectParent(suggestion);

    setTimeout(() => {
      isSelectingRef.current = false;
    }, 100);
  };

  const fetchingSearchZoneValue = async (searchText: string) => {
    if (!searchText.trim()) {
      setSearchZoneValueResults([]);
      setShowZoneValueDropdown(false);
      return;
    }

    setLoadingChildren(true);

    try {
      const response = await GetData(`${API_URL_REF}/api/zone/qry-zone-value`, {
        value: searchText,
        spId: 0,
        page: 1,
        size: 50,
        sortBy: "ZONE_ID",
        sortDirection: "asc",
      });

      const results = response.data?.slice(0, 50) || [];
      setSearchZoneValueResults(results);
      setShowZoneValueDropdown(results.length > 0);
    } catch (error) {
      // console.error("Error searching zone values:", error);
      setSearchZoneValueResults([]);
      setShowZoneValueDropdown(false);
    } finally {
      setLoadingChildren(false);
    }
  };

  // ✅ FIX: set selectedParent in context + avoid stale childrenSide closure
  const handleSelectZoneValueFromSearch = async (item: any) => {
    isSelectingRef.current = true;

    try {
      // Ensure parent exists in list (optional safety)
      if (!parentSide.some((p) => p.zoneMapId === item.zoneMapId)) {
        await parentSideBar("");
      }

      const parentObj =
        parentSide.find((p) => p.zoneMapId === item.zoneMapId) ?? {
          zoneMapId: item.zoneMapId,
          zoneMapName: item.zoneMapName,
        };

      // ✅ critical: update context parent
      handleSelectParent(parentObj);

      // Expand UI parent
      setParentSide((prev) =>
        prev.map((p) => ({
          ...p,
          isExpand: p.zoneMapId === item.zoneMapId,
        }))
      );
      setSelectedParentSide(item.zoneMapId);

      // Load children (use returned list)
      const loadedChildren =
        childrenSide[item.zoneMapId] ?? (await childrenSideBar(item.zoneMapId));

      const targetChild = loadedChildren.find((c: any) => c.zoneId === item.zoneId);

      if (targetChild) {
        handleSelectChild(targetChild);
        setSelectedChild(targetChild.zoneId);

        handleSelectedItem(item);

        setSearchValue(item.value);
        setShowZoneValueDropdown(false);
      } else {
        // console.error("Target child not found:", item.zoneId);
      }
    } catch (error: any) {
      // console.error("Error selecting zone value: ", error);
    } finally {
      setTimeout(() => {
        isSelectingRef.current = false;
      }, 200);
    }
  };

  const fetchingSearchZoneName = async (searchText: string) => {
    if (!searchText.trim()) {
      setSearchZoneNameResults([]);
      setShowZoneNameDropdown(false);
      return;
    }

    try {
      const response = await GetData(`${API_URL_REF}/api/zone/qry-zone-by-name`, {
        zoneName: searchText,
        spId: 0,
      });

      const results = response.data || [];
      setSearchZoneNameResults(results);
      setShowZoneNameDropdown(results.length > 0);
    } catch (error) {
      // console.error("Error searching zone names:", error);
      setSearchZoneNameResults([]);
      setShowZoneNameDropdown(false);
    }
  };

  // ✅ FIX: set selectedParent in context + avoid stale childrenSide closure
  const handleSelectZoneNameFromSearch = async (item: any) => {
    isSelectingRef.current = true;

    try {
      if (!parentSide.some((p) => p.zoneMapId === item.zoneMapId)) {
        await parentSideBar("");
      }

      const parentObj =
        parentSide.find((p) => p.zoneMapId === item.zoneMapId) ?? {
          zoneMapId: item.zoneMapId,
          zoneMapName: item.zoneMapName,
        };

      // ✅ critical: update context parent
      handleSelectParent(parentObj);

      setParentSide((prev) =>
        prev.map((p) => ({
          ...p,
          isExpand: p.zoneMapId === item.zoneMapId,
        }))
      );
      setSelectedParentSide(item.zoneMapId);

      const loadedChildren =
        childrenSide[item.zoneMapId] ?? (await childrenSideBar(item.zoneMapId));

      const targetChild = loadedChildren.find((c: any) => c.zoneId === item.zoneId) ?? item;

      handleSelectChild(targetChild);
      setSelectedChild(targetChild.zoneId);

      setSearchValue(item.zoneName);
      setShowZoneNameDropdown(false);
    } catch (error: any) {
      // console.error("Error selecting zone name: ", error);
    } finally {
      setTimeout(() => {
        isSelectingRef.current = false;
      }, 100);
    }
  };

  // Fetch parents only on refreshTrigger
  useEffect(() => {
    parentSideBar("");
  }, [refreshTrigger, parentSideBar]);

  // Fetch children when selection changes (context-driven)
  useEffect(() => {
    const id = selectedParent?.zoneMapId ?? selectedChildrenSide?.zoneMapId;
    if (id) childrenSideBar(id);
  }, [selectedParent?.zoneMapId, selectedChildrenSide?.zoneMapId, refreshTrigger, childrenSideBar]);

  // debounce cleanup
  useEffect(() => {
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [debounceTimer]);

  useEffect(() => {
    return () => {
      if (debounceTimerZoneValue) clearTimeout(debounceTimerZoneValue);
    };
  }, [debounceTimerZoneValue]);

  // checkbox cleanup when children data changes
  useEffect(() => {
    setCheckedChildren((prev) => {
      const newChecked = { ...prev };
      let hasChanges = false;

      for (const [zoneMapId, checkedZoneIds] of Object.entries(newChecked)) {
        const zones = childrenSide[Number(zoneMapId)] || [];
        const validZoneIds = new Set(zones.map((z: any) => z.zoneId));

        const filteredIds = Array.from(checkedZoneIds).filter((zoneId) => validZoneIds.has(zoneId));

        if (filteredIds.length !== checkedZoneIds.size) {
          newChecked[Number(zoneMapId)] = new Set(filteredIds);
          hasChanges = true;
        }

        if (newChecked[Number(zoneMapId)].size === 0) {
          delete newChecked[Number(zoneMapId)];
          hasChanges = true;
        }
      }

      return hasChanges ? newChecked : prev;
    });
  }, [childrenSide]);

  const clearSearch = () => {
    setSearchValue("");
    setShowSearchDropdown(false);
    setShowZoneValueDropdown(false);
    setShowZoneNameDropdown(false);
    setSearchResult([]);
    setSearchZoneValueResults([]);
    setSearchZoneNameResults([]);
  };

  return (
    <div className="relative transition-all duration-300 flex flex-col shadow-md overflow-y-auto h-full border-[1px] w-64 opacity-100">
      {/* header */}
      <div className="flex items-center justify-between px-2">
        <div className="text-xl font-semibold mb-5 mt-5 ml-3">Zone</div>

        <div className="flex items-center gap-2">
          <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
          <Button
            variant="outline"
            size="icon"
            className="w-[30px] h-[30px] flex items-center justify-center rounded-full border border-gray-300 hover:bg-red-100 transition cursor-pointer"
            onClick={() => {
              if (checkedParents.size > 0) {
                const firstCheckedZoneMapId = Array.from(checkedParents)[0];
                const checkedZoneMap = parentSide.find((p) => p.zoneMapId === firstCheckedZoneMapId);

                if (checkedZoneMap) {
                  handleSelectParent(checkedZoneMap);
                  setShowDeleteConfirmDialog(true);
                } else {
                  toast.error("Selected Zone Map not found");
                }
              } else {
                let totalCheckedZones = 0;
                for (const checkedZoneIds of Object.values(checkedChildren)) {
                  if (checkedZoneIds && checkedZoneIds.size > 0) {
                    totalCheckedZones += checkedZoneIds.size;
                  }
                }

                if (totalCheckedZones > 0) {
                  if (totalCheckedZones > 1) {
                    handleBatchDeleteZones();
                  } else {
                    let checkedZone: any = null;

                    for (const [zoneMapId, checkedZoneIds] of Object.entries(checkedChildren)) {
                      if (checkedZoneIds && checkedZoneIds.size > 0) {
                        const firstCheckedZoneId = Array.from(checkedZoneIds)[0];
                        const zones = childrenSide[Number(zoneMapId)] || [];
                        checkedZone = zones.find((z) => z.zoneId === firstCheckedZoneId);
                        if (checkedZone) break;
                      }
                    }

                    if (checkedZone) {
                      handleSelectChild(checkedZone);
                      handleDeleteZoneDetail(true);
                    } else {
                      toast.error("Selected zone not found");
                    }
                  }
                } else {
                  toast.error("Please select a zone map or zone to delete");
                }
              }
            }}
          >
            <Trash className="w-4 h-4 text-red-500" />
          </Button>
          </AccessWrapper>
        </div>
      </div>

      {/* search */}
      <div className="flex flex-col px-3 py-2 w-full gap-2">
        <div className="flex w-full">
          <Select value={filterBy} onValueChange={(val) => setFilterBy(val)}>
            <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
              <SelectValue placeholder="Role Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Zone Map Name</SelectItem>
              <SelectItem value="2">Zone Name</SelectItem>
              <SelectItem value="3">Zone Value</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <label className="input input-sm w-full flex items-center gap-2">
            <KeenIcon icon="magnifier" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={`Search ${selectLabel}`}
              value={searchValue}
              onChange={(e) => {
                const value = e.target.value;
                setSearchValue(value);

                if (filterBy === "1") {
                  if (debounceTimer) clearTimeout(debounceTimer);

                  const timer = setTimeout(() => {
                    if (value.trim()) parentSideBar(value);
                    else {
                      setSearchResult([]);
                      setShowSearchDropdown(false);
                    }
                  }, 300);

                  setDebounceTimer(timer);
                } else if (filterBy === "2") {
                  if (debounceTimer) clearTimeout(debounceTimer);

                  const timer = setTimeout(() => {
                    if (value.trim()) fetchingSearchZoneName(value);
                    else {
                      setSearchZoneNameResults([]);
                      setShowZoneNameDropdown(false);
                    }
                  }, 300);

                  setDebounceTimer(timer);
                } else if (filterBy === "3") {
                  if (debounceTimerZoneValue) clearTimeout(debounceTimerZoneValue);

                  const timer = setTimeout(() => {
                    if (value.trim()) fetchingSearchZoneValue(value);
                    else {
                      setSearchZoneValueResults([]);
                      setShowZoneValueDropdown(false);
                    }
                  }, 300);

                  setDebounceTimerZoneValue(timer);
                }
              }}
            />
            {searchValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            )}
          </label>

          {showSearchDropdown && filterBy === "1" && (
            <div
              ref={searchDropdownRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {searchResult.length > 0 ? (
                searchResult.map((item) => (
                  <div
                    key={item.zoneMapId}
                    onClick={() => handleSelectSuggestion(item)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {item.zoneMapName}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 italic">No results found</div>
              )}
            </div>
          )}

          {showZoneNameDropdown && filterBy === "2" && searchZoneNameResults.length > 0 && (
            <div
              ref={searchDropdownRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {searchZoneNameResults.map((item) => (
                <div
                  key={`${item.zoneId}-${item.zoneMapId}`}
                  onClick={() => handleSelectZoneNameFromSearch(item)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  <div>{item.zoneName}</div>
                </div>
              ))}
            </div>
          )}

          {showZoneValueDropdown && filterBy === "3" && searchZoneValueResults.length > 0 && (
            <div
              ref={searchDropdownRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {searchZoneValueResults.map((item) => (
                <div
                  key={`${item.zoneId}-${item.value}-${item.seq}`}
                  onClick={() => handleSelectZoneValueFromSearch(item)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{item.value}</div>
                  <div className="text-xs text-gray-500 mt-1">Zone Name: {item.zoneName || "N/A"}</div>
                  <div className="text-xs text-gray-400">Zone Map Name: {item.zoneMapName || "N/A"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* list */}
      <div className="flex-1 overflow-y-auto px-1">
        <ul className="mt-2 text-sm px-2 h-full">
          {parentSide?.length === 0 ? (
            <li className="flex justify-center h-full items-center px-2 py-1.5 text-xl text-gray-500 italic">
              No data available
            </li>
          ) : (
            parentSide.map((parent) => {
              const isExpanded = !!parent.isExpand;

              return (
                <li key={`${parent.zoneId}-${parent.zoneMapId}`}>
                  <div className="flex flex-row w-full">
                    <div
                      className={`flex items-center flex-1 w-40 px-2 py-1 hover:bg-gray-200 rounded transition-colors duration-200 ${
                        selectedParentSide === parent.zoneMapId ? "bg-red-100 text-red-600" : ""
                      }`}
                    >
                      {/* expand button */}
                      <button type="button" onClick={() => handleToggleExpand(parent)} className="mr-2">
                        <KeenIcon
                          icon="right"
                          className={`transition-transform text-gray-600 ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </button>

                      <div className="flex flex-row items-center py-1">
                        {/* parent checkbox */}
                        <Input
                          type="checkbox"
                          className="w-4 h-4 cursor-pointer"
                          checked={isParentChecked(parent)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleParentCheckbox(parent, e.target.checked);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />

                        {/* parent text */}
                        <div
                          onClick={() => {
                            handleSelectParent(parent);
                            handleToggleExpand(parent);
                            setSelectedChild(null);
                          }}
                          className="flex-1 min-w-0 text-left pl-2 cursor-pointer rounded"
                          title={parent.zoneMapName}
                        >
                          <span className="block font-medium text-xs whitespace-normal break-words max-w-[300px] truncate">
                            {parent.zoneMapName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* children */}
                  {isExpanded && (
                    <ul className="ml-6 mt-1">
                      {childrenSide[parent.zoneMapId]?.length === 0 ? (
                        <li className="px-2 py-1.5 text-xs text-gray-500 italic">No data available</li>
                      ) : (
                        childrenSide[parent.zoneMapId]?.map((child) => (
                          <li key={`child-${child.zoneId}-${child.zoneMapId}`}>
                            <div
                              className={`flex items-center pl-5 hover:bg-gray-200 ${
                                selectedChild === child.zoneId ? "bg-blue-100 text-blue-600" : ""
                              }`}
                            >
                              <Input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={isChildChecked(parent, child)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleChildCheckbox(parent, child, e.target.checked);
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />

                              <button
                                onClick={() => {
                                  handleSelectChild(child);
                                  setSelectedChild(child.zoneId);
                                  setSelectedParentSide(null);
                                }}
                                className="flex items-center w-full text-left px-2 py-1.5 rounded"
                                title={child.zoneName}
                                type="button"
                              >
                                <span className="text-xs">{child.zoneName}</span>
                              </button>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>

      <DeleteDialog
        isOpen={showDeleteConfirmDialog}
        onClose={() => setShowDeleteConfirmDialog(false)}
        zoneMapName={selectedParent?.zoneMapName || ""}
        zoneMapId={selectedParent?.zoneMapId}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default ZoneSideBar;

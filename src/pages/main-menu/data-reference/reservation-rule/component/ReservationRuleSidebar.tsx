import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { DefaultTooltip, KeenIcon } from "@/components";
import { useReservationListContext } from "../hooks/useReservationRuleContext";
import { ReUsageList } from "../hooks/ReservationRuleContext";
import { Loading } from "@/components/common/Loading";

const ReservationSideBar = () => {
  const { reUsageList, selectedItem, setSelectedItem, setMode, isLoadingList } = useReservationListContext();

  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /* ---------------- effects ---------------- */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (reUsageList.length > 0) {
      setSelectedItem(reUsageList[0]);
    }
  }, [reUsageList]);

  /* ---------------- helpers ---------------- */

  const handleToggleExpand = (reId: number) => {
    setExpandedRows((prev) => (prev.includes(reId) ? prev.filter((x) => x !== reId) : [...prev, reId]));
  };

  const findAllParentIds = (itemId: number, nodes: ReUsageList[], parentIds: number[] = []): number[] | null => {
    for (const node of nodes) {
      if (node.reId === itemId) return parentIds;
      if (node.children?.length) {
        const found = findAllParentIds(itemId, node.children, [...parentIds, node.reId]);
        if (found) return found;
      }
    }
    return null;
  };

  const flattenTree = (nodes: ReUsageList[], parentId = 0): ReUsageList[] => {
    let result: ReUsageList[] = [];
    nodes.forEach((node) => {
      node.parentReId = parentId;
      result.push(node);
      if (node.children?.length) {
        result = result.concat(flattenTree(node.children, node.reId ?? 0));
      }
    });
    return result;
  };

  const flatUsageList = flattenTree(reUsageList);
  const searchResult = flatUsageList.filter((item) => item.reName.toLowerCase().includes(searchValue.toLowerCase()));

  const handleItemClick = (item: ReUsageList) => {
    setSelectedItem(item);
    setMode("view");
  };

  const expandParentsForItem = (item: ReUsageList) => {
    const parentIds = findAllParentIds(item.reId ?? 0, reUsageList);
    if (parentIds?.length) {
      setExpandedRows((prev) => [...new Set([...prev, ...parentIds])]);
    }
  };

  /* ---------------- render leaf nodes ---------------- */

  const renderLeafNodes = (nodes: ReUsageList[]) =>
    nodes.map((node) => {
      const hasChildren = node.children?.length;
      const isExpanded = expandedRows.includes(node.reId);

      if (hasChildren) {
        return (
          <li key={node.reId}>
            <button
              onClick={() => {
                handleToggleExpand(node.reId);
                handleItemClick(node);
              }}
              className={`flex items-center gap-3 py-1.5 px-3 w-full rounded-md transition-colors group
                ${selectedItem?.reId === node.reId ? "bg-blue-50" : "hover:bg-gray-50"}`}
            >
              <KeenIcon icon="right" className={`text-xs transition-transform ${isExpanded ? "rotate-90 text-gray-600" : "text-gray-400"}`} />

              <i
                className={`ki-duotone ki-folder text-sm transition-colors
                  ${selectedItem?.reId === node.reId ? "text-yellow-600" : "text-yellow-400 group-hover:text-yellow-600"}`}
              />

              <span
                className={`text-sm font-medium truncate
                  ${selectedItem?.reId === node.reId ? "text-blue-600" : "text-gray-700"}`}
              >
                {node.reName}
              </span>
            </button>

            {isExpanded && <ul className="pl-6 mt-1 space-y-1">{renderLeafNodes(node.children!)}</ul>}
          </li>
        );
      }

      return (
        <li key={node.reId}>
          <button
            onClick={() => handleItemClick(node)}
            className={`flex items-center gap-3 py-1.5 px-3 w-full rounded-md transition-colors group
              ${selectedItem?.reId === node.reId ? "bg-blue-50" : "hover:bg-gray-50"}`}
          >
            <i
              className={`ki-filled ki-files text-sm transition-colors
                ${selectedItem?.reId === node.reId ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}
            />

            <DefaultTooltip title={node.reName} placement="right">
              <span
                className={`truncate text-sm
                  ${selectedItem?.reId === node.reId ? "text-blue-600 font-medium" : "text-gray-700"}`}
              >
                {node.reName}
              </span>
            </DefaultTooltip>
          </button>
        </li>
      );
    });

  /* ---------------- JSX ---------------- */

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="font-semibold text-gray-800 mb-4">Reservation Rule</div>

        <div className="relative" ref={wrapperRef}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="Search keywords"
            className="w-full pl-9 pr-8 py-2 text-sm border rounded-md
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {showSuggestions && searchValue && (
            <ul className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-sm z-50 max-h-40 overflow-auto">
              {searchResult.length ? (
                searchResult.map((item) => (
                  <li
                    key={item.reId}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      expandParentsForItem(item);
                      handleItemClick(item);
                      setSearchValue(item.reName);
                      setShowSuggestions(false);
                    }}
                  >
                    <DefaultTooltip title={item.reName}>
                      <span className="truncate block">{item.reName}</span>
                    </DefaultTooltip>
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-sm text-gray-400 text-center">No record found</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoadingList ? (
          <div className="flex justify-center py-8">
            <Loading />
          </div>
        ) : reUsageList.length === 0 ? (
          <div className="text-center text-gray-400 italic">No data available</div>
        ) : (
          <ul className="space-y-1">
            {reUsageList.map((parent) => {
              const isExpanded = expandedRows.includes(parent.reId);

              return (
                <li key={parent.reId}>
                  <button
                    onClick={() => {
                      handleToggleExpand(parent.reId);
                      handleItemClick(parent);
                    }}
                    className={`flex items-center gap-3 py-2 px-3 w-full rounded-md transition-colors group
                      ${selectedItem?.reId === parent.reId ? "bg-blue-50" : "hover:bg-gray-50"}`}
                  >
                    <KeenIcon icon="right" className={`text-xs transition-transform ${isExpanded ? "rotate-90 text-gray-600" : "text-gray-400"}`} />

                    <i
                      className={`ki-duotone ki-folder text-base transition-colors
                        ${selectedItem?.reId === parent.reId ? "text-yellow-600" : "text-yellow-400 group-hover:text-yellow-600"}`}
                    />

                    <span
                      className={`text-sm font-semibold truncate
                        ${selectedItem?.reId === parent.reId ? "text-blue-600" : "text-gray-800"}`}
                    >
                      {parent.reName}
                    </span>
                  </button>

                  {isExpanded && parent.children && <ul className="pl-4 mt-1 space-y-1">{renderLeafNodes(parent.children)}</ul>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ReservationSideBar;

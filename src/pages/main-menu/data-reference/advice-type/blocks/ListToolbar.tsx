import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdviceTypeContext } from "../hooks/useAdviceTypeContext";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { initialPropsAdviceTypeContent } from "../hooks/AdviceTypeContext";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const ListToolbar = () => {
  const {
    setShowAddView,
    setFormData,
    setContentDetail,
    fetchingListContent,
    selectedChildrenSide,
    selectedSubChildrenSide,
    dataTableContext,
    selectedContent,
    setSelectedContent,
    searchContent,
    setSearchContent,
    appliedSearch,
    setAppliedSearch,
    menuPrivAccess,
  } = useAdviceTypeContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleReload = async () => {
    await fetchingListContent();
  };

  const handleClearSearch = () => {
    setSearchContent("");
    setAppliedSearch("");
    setShowDropdown(false);

    if (dataTableContext.length > 0) {
      setSelectedContent(dataTableContext[0]);
    } else {
      setSelectedContent(null);
    }
  };

  const isMatch = (item: any) => {
    const keyword = searchContent.toLowerCase();
    return (
      item.adviceTypeName.toLowerCase().includes(keyword) ||
      item.stdCode.toLowerCase().includes(keyword)
    );
  };

  const handleAddClick = () => {
    if (!selectedChildrenSide && !selectedSubChildrenSide) {
      toast.error("First select the advice type directory on the left");
      return;
    }

    setShowAddView(true);
  };

  //keluar dropdown klo di klik di luar input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-row justify-between p-3 md:gap-2">
      <div className="flex gap-3">
        <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
          <Button
            variant="default"
            className="text-sm h-8"
            onClick={() => {
              handleAddClick();
              setContentDetail("add");
              setFormData(initialPropsAdviceTypeContent);
            }}
          >
            New
          </Button>
        </AccessWrapper>
        {/* 
        <Button variant="outline" className="text-sm h-8">
          Refresh Advice
        </Button> */}
      </div>

      <div className="flex items-center gap-2">
        <DefaultTooltip title="Refresh" placement="top">
          <Button
            variant="outline"
            className="text-sm h-8"
            onClick={() => {
              handleReload();
            }}
          >
            <KeenIcon icon="arrows-circle" />
          </Button>
        </DefaultTooltip>
        <div
          className="input flex items-center md:w-96 gap-2 h-8 relative"
          ref={dropdownRef}
        >
          <Input
            type="text"
            value={searchContent}
            onChange={(e) => {
              setSearchContent(e.target.value);
              setShowDropdown(e.target.value.length > 0);
            }}
            onFocus={() => setShowDropdown(searchContent.length > 0)}
            className="flex-1 h-8 px-2 border-none"
            placeholder="Template Name / Standard Code"
          />
          {searchContent && (
            <button
              onClick={handleClearSearch}
              className="text-gray-400 hover:text-gray-600"
            >
              <KeenIcon icon="cross" />
            </button>
          )}
          <KeenIcon icon="magnifier" />

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-auto border rounded p-2 bg-white shadow-lg z-10">
              {dataTableContext.filter(isMatch).length > 0 ? (
                dataTableContext.filter(isMatch).map((item) => (
                  <div
                    key={item.adviceType}
                    onMouseDown={(e) => e.preventDefault()} // hanya cegah blur
                    onClick={() => {
                      setSelectedContent(item);
                      setSearchContent(item.adviceTypeName || "");
                      setAppliedSearch(item.adviceTypeName || "");
                      setShowDropdown(false);
                    }}
                    className="p-2 cursor-pointer rounded bg-gray-200 font-semibold hover:bg-gray-300"
                  >
                    {item.adviceTypeName}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500">No results found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListToolbar;

import { DefaultTooltip, KeenIcon } from "@/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useRef, useState } from "react";
import { OrgData } from "./Organization";
import { Item } from "@radix-ui/react-select";

interface ListToolbarOrganizationProps {
  orgList: OrgData[];
  handleItemClick: (item: OrgData) => void;
}

const ListToolbarOrganization: React.FC<ListToolbarOrganizationProps> = ({
  orgList,
  handleItemClick,
}) => {
  const [filterBy, setFilterBy] = useState<string>("1");
  const [searchValue, setSearchValue] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const filterOption = [
    { value: "1", label: "Organization Name" },
    { value: "2", label: "Organization Code" },
  ];
  const selectLabel =
    filterOption.find((opt) => opt.value === filterBy)?.label ?? "";
  const [searchResult, setSearchResult] = useState<OrgData[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const handleSearch = (value: string, filterBy: string) => {
    if (!value.trim) {
      setSearchResult(orgList);
      return;
    }

    const keyword = value.toLowerCase();

    const filtered = orgList.filter((item) =>
      filterBy === "1"
        ? item.orgName.toLowerCase().startsWith(keyword)
        : item.orgCode.toLowerCase().startsWith(keyword),
    );

    setSearchResult(filtered);
  };

  //  console.log(showSuggestions);

  return (
    <>
      <div className="grid grid-cols-[auto_1fr] items-center gap-3 mb-2 mt-5">
        <Select value={filterBy} onValueChange={(val) => setFilterBy(val)}>
          <SelectTrigger
            className="w-32 px-2 py-1 text-xs h-8"
            title={`${selectLabel}`}
          >
            <SelectValue placeholder={`Search ${selectLabel}..`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Organization Name</SelectItem>
            <SelectItem value="2">Organization Code</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative" ref={wrapperRef}>
          <label className="input input-sm flex items-center gap-2">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => {
                const value = e.target.value;
                setSearchValue(value);
                setShowSuggestions(true);
                handleSearch(value, filterBy);
              }}
              className="w-full"
              placeholder={`Search ${selectLabel}..`}
            />
            <KeenIcon icon="magnifier" />
            {searchValue && (
              <button
                type="button"
                onClick={() => {
                  setSearchValue("");
                }}
                className="flex flex-row text-gray-400 hover:text-gray-600 transition-colors"
              >
                <KeenIcon icon="cross" />
              </button>
            )}
          </label>

          {showSuggestions && (
            <ul className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-md z-50 max-h-40 overflow-auto">
              {searchResult.length > 0 ? (
                searchResult.map((item, index) => (
                  <li
                    key={`${item.orgId}-${index}`}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSearchValue(item.orgName);
                      handleItemClick(item);
                      setShowSuggestions(false);
                    }}
                  >
                    <DefaultTooltip title={item.orgName} placement="top">
                      <div>{item.orgName}</div>
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
      <h1 className="text-gray-500 p-2">Root</h1>
    </>
  );
};

export default ListToolbarOrganization;

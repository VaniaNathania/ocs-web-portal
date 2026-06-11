import { DefaultTooltip, KeenIcon } from "@/components";
import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContactChannelList } from "../components/all-feature-content/AllFeatureTabContent";
import { OfferTypeMeta } from "./utils/MapDisplayData";

interface ListToolBarAllFeatureProps {
  contactChannelList: ContactChannelList[];
  searchResult: any[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  showSuggestions: boolean;
  onSuggestionsChange: (show: boolean) => void;
  clearSearch: () => void;
  handleSelectedSearch: any;
  onProjectVisibleChange: (value: string) => void;
  onInstantiatableChange: (value: string) => void;
  renderAttrCatg: () => OfferTypeMeta
}

const ListToolBarAllFeature: React.FC<ListToolBarAllFeatureProps> = ({
  contactChannelList,
  searchResult,
  searchValue,
  onSearchChange,
  showSuggestions,
  onSuggestionsChange,
  clearSearch,
  handleSelectedSearch,
  onProjectVisibleChange,
  onInstantiatableChange,
  renderAttrCatg,
}) => {
  const [selectedContactChannelFilter, setSelectedContactChannelFilter] = useState<number | null>(null);
  const [selectedInstantiation, setSelectedInstantiation] = useState<string>("");
  const [selectedProjectVisible, setSelectedProjectVisible] = useState<string>("");
  const meta = renderAttrCatg()
  // const [attrCatg, setAttrCatg] = useState<string>("1");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        onSuggestionsChange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onSuggestionsChange]);

  return (
    <div className="p-3 border-b">
      {/* Search Bar */}
      <div className="relative" ref={wrapperRef}>
        <label className="input input-sm flex items-center gap-2">
          <KeenIcon icon="magnifier" />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => {
              onSearchChange(event.target.value);
              onSuggestionsChange(true);
            }}
            className="w-full"
            placeholder="Search Feature Name/Code..."
          />
          {searchValue && (
            <button type="button" onClick={clearSearch} className="flex flex-row text-gray-400 hover:text-gray-600 transition-colors">
              <KeenIcon icon="cross" />
            </button>
          )}
        </label>
        {showSuggestions && (
          <ul className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-md z-50 max-h-40 overflow-auto">
            {searchResult.length > 0 ? (
              searchResult.map((item, index) => (
                <li
                  key={`${item.attrId}-${index}`}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    onSearchChange(item.attrName);
                    handleSelectedSearch(item);
                    onSuggestionsChange(false);
                  }}
                >
                  <DefaultTooltip title={item.attrName} placement="top">
                    <div>{item.attrName}</div>
                  </DefaultTooltip>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-center">No record found..</li>
            )}
          </ul>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2 py-3">
        <div className="flex">
          <Select value={selectedContactChannelFilter?.toString() || ""} onValueChange={(val: string) => setSelectedContactChannelFilter(Number(val))}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Contact Channel" />
            </SelectTrigger>
            <SelectContent>
              {contactChannelList.map((cd) => (
                <SelectItem key={cd.contactChannelId} value={cd.contactChannelId.toString()}>
                  {cd.contactChannelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedContactChannelFilter && (
            <div className="flex flex-row p-1">
              <button className="" onClick={() => setSelectedContactChannelFilter(null)}>
                <KeenIcon icon="cross" />
              </button>
            </div>
          )}
        </div>

        <div className="flex">
          <Select
            value={selectedProjectVisible}
            onValueChange={(val) => {
              setSelectedProjectVisible(val);
              onProjectVisibleChange(val);
            }}
          >
            <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
              <SelectValue placeholder="Project Visible" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Y">Yes</SelectItem>
              <SelectItem value="N">No</SelectItem>
            </SelectContent>
          </Select>

          {selectedProjectVisible && (
            <div className="flex flex-row p-1">
              <button onClick={() => setSelectedProjectVisible("")}>
                <KeenIcon icon="cross" />
              </button>
            </div>
          )}
        </div>

        <div className="flex">
          <Select
            value={selectedInstantiation}
            onValueChange={(val) => {
              setSelectedInstantiation(val);
              onInstantiatableChange(val);
            }}
          >
            <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
              <SelectValue placeholder="Instantiation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Y">Yes</SelectItem>
              <SelectItem value="N">No</SelectItem>
            </SelectContent>
          </Select>

          {selectedInstantiation && (
            <div className="flex flex-row p-1">
              <button onClick={() => setSelectedInstantiation("")}>
                <KeenIcon icon="cross" />
              </button>
            </div>
          )}
        </div>

        <div>
          <input type="text" value={meta.offerName} readOnly disabled className="w-full px-2 py-1 text-xs h-8 border border-gray-300 rounded bg-gray-100 text-gray-600" />
        </div>
      </div>
    </div>
  );
};

export { ListToolBarAllFeature };

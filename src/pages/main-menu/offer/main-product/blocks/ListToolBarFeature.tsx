import { KeenIcon } from "@/components";
import { toast } from "sonner";
import { useCallback, useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiConfig, apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";

interface ListToolBarFeatureProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  clearSearch: () => void;
}

interface ContactChannelList {
  contactChannelId: number;
  contactChannelName: string;
}

const API_URL_OFFER = apiConfigOffer.offer;

const ListToolBarFeature: React.FC<ListToolBarFeatureProps> = ({ searchValue, onSearchChange, clearSearch }) => {
  const { GetData } = useCallApi();

  const [filters, setFilters] = useState<string>("");
  const [contactChannelList, setContactChannelList] = useState<ContactChannelList[]>([]);
  const [selectedContactChannel, setSelectContactChannel] = useState<string | null>(null);
  const [filterBy, setFilterBy] = useState<string>("1");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const filterOption = [
    { value: "1", label: "Feature Name" },
    { value: "2", label: "Feature Code" },
  ];
  const selectLabel = filterOption.find((val) => val.value === filterBy)?.label ?? "";

  const fetchContactChannelList = async () => {
    try {
      const response = await GetData(`${API_URL_OFFER}/offer/common/qry-contact-channel-list`, {});

      if (response.status) {
        setContactChannelList(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error get contact channel data");
    }
  };

  useEffect(() => {
    fetchContactChannelList();
  }, []);

  return (
    <div className="card-header flex flex-col gap-4 px-2" ref={wrapperRef}>
      {/* 🔍 Baris Search */}
      <div className="flex w-full gap-3 items-center">
        <div className="flex my-auto w-1/4">
          <Select value={filterBy} onValueChange={(val) => setFilterBy(val)}>
            <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
              <SelectValue placeholder="Feature Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Feature Name</SelectItem>
              <SelectItem value="2">Feature Code</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label className="input input-sm w-full flex items-center gap-2">
          <KeenIcon icon="magnifier" />
          <input
            type="text"
            placeholder={`Search ${selectLabel}...`}
            value={searchValue}
            onChange={(event) => {
              onSearchChange(event.target.value);
            }}
            className="w-full"
          />
          {searchValue && (
            <button type="button" onClick={clearSearch} className="flex flex-row text-gray-400 hover:text-gray-600 transition-colors">
              <KeenIcon icon="cross" />
            </button>
          )}
        </label>
      </div>

      {/* Dropdown Contact Channel + Category */}
      <div className="grid grid-cols-2 gap-5 w-full">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Contact Channel</label>
          <Select
            value={selectedContactChannel || ""}
            onValueChange={(value: any) => {
              setSelectContactChannel(value);
              setFilters(value);
            }}
          >
            <SelectTrigger size="sm">
              <SelectValue placeholder="Contact Channel" />
            </SelectTrigger>
            <SelectContent>
              {contactChannelList.map((cd) => (
                <SelectItem key={cd.contactChannelId} value={String(cd.contactChannelId)}>
                  {cd.contactChannelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Category</label>
          <input type="text" value="Main Product" readOnly disabled className="w-full px-2 py-1 text-xs h-8 border border-gray-300 rounded bg-gray-100 text-gray-600" />
        </div>
      </div>
    </div>
  );
};

export { ListToolBarFeature };

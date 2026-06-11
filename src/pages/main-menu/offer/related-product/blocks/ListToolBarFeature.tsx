import { ContentLoader, DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { setData, toAbsoluteUrl } from "@/utils";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import moment from "moment";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiConfig, apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";

type LoadingButton = "filter" | "reset" | "export" | "refresh" | null;


interface ContactChannelList {
  contactChannelId: number;
  contactChannelName: string;
}

const API_URL_OFFER = apiConfigOffer.offer;

const ListToolBarFeature = () => {
  const { table, reload } = useDataGrid();
  const { GetData } = useCallApi();

  const [filters, setFilters] = useState<string>("");
  const [contactChannelList, setContactChannelList] = useState<ContactChannelList[]>([]);
  const [selectedContactChannel, setSelectContactChannel] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [filterBy, setFilterBy] = useState<string>("2");
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
    fetchContactChannelList()
  }, []);

  return (
    <div className="card-header flex flex-col gap-4 px-2">
      {/* 🔍 Baris Search */}
      <div className="flex w-full gap-3 items-center">
        <div className="flex my-auto w-1/4">
          <Select value={filterBy} onValueChange={(val) => setFilterBy(val)}>
            <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
              <SelectValue placeholder="Feature Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">Feature Name</SelectItem>
              <SelectItem value="7">Code</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label className="input input-sm w-full flex items-center gap-2">
          <KeenIcon icon="magnifier" />
          <input type="text" placeholder="Search Feature Name..." value={searchValue} onChange={(event) => setSearchValue(event.target.value)} className="w-full" />
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
          <Select disabled>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Main Product" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Main Product">
                  Main Product
                </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export { ListToolBarFeature };

import { ContentLoader, DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
// import { usePricePlanListContext } from "../hooks";
import { setData, toAbsoluteUrl } from "@/utils";
import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import moment from "moment";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiConfig, apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronDown } from "lucide-react";

interface RelationshipType {
  relaType: string;
  relaTypeName: string;
}

interface offerGroupName {
  offerId: number;
  offerName: string;
  offerCode: string;
  offerType: string;
  isGroup: string;
  effDate: number;
}

interface ListToolbarAllRelationshipProps {
  onSearchChange?: (searchTerm: string) => void;
}

const API_URL_OFFER = apiConfigOffer.offer;

const ListToolbarAllRelationship: React.FC<ListToolbarAllRelationshipProps> = ({ onSearchChange }) => {
  const { table, reload } = useDataGrid();
  const { GetData } = useCallApi();
  const [loadingSource, setLoadingSource] = useState(false);
  const [loadingTarget, setLoadingTarget] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filteredRelationTypes, setFilteredRelationTypes] = useState<RelationshipType[]>([]);
  const [relationTypeOpen, setRelationTypeOpen] = useState(false);
  const [selectedRelationType, setSelectedRelationType] = useState<RelationshipType | null>(null);
  const [offerGroupName, setOfferGroupName] = useState<offerGroupName[]>([]);
  const [sourceOfferGroupNameOpen, setSourceOfferGroupNameOpen] = useState(false);
  const [targetOfferGroupNameOpen, setTargetOfferGroupNameOpen] = useState(false);
  const [selectedSourceOfferGroupName, setSelectedSourceOfferGroupName] = useState<offerGroupName | null>(null);
  const [selectedTargetOfferGroupName, setSelectedTargetOfferGroupName] = useState<offerGroupName | null>(null);
  const [selectedSourceOfferType, setSelectedSourceOfferType] = useState<string | null>(null);
  const [selectedTargetOfferType, setSelectedTargetOfferType] = useState<string | null>(null);

  const fetchRelationType = useCallback(async () => {
    setLoading(true);

    try {
      const response = await GetData(`${API_URL_OFFER}/offer/common/qry-rela-type`, {});

      if (!response?.status && response?.status !== undefined) {
        throw new Error(response?.message || "Failed to fetch relation type data");
      }

      let list = [];
      if (response?.data) {
        list = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        list = response;
      } else {
        list = [];
      }

      const uniqueList = list.reduce((acc: any[], current) => {
        const exists = acc.find((item) => item.relaTypeName === current.relaTypeName);
        if (!exists) {
          acc.push({
            relaType: current.relaType,
            relaTypeName: current.relaTypeName,
          });
        }
        return acc;
      }, []);

      setFilteredRelationTypes(uniqueList);
    } catch (error: any) {
      console.error("❌ Error fetching relation types:", error);
      toast.error(`Error loading relation types: ${error.message}`);
      setFilteredRelationTypes([]);
    } finally {
      setLoading(false);
    }
  }, [GetData]);

  const fetchOfferGroupName = useCallback(async () => {
    setLoading(true);

    try {
      const response = await GetData(`${API_URL_OFFER}/offer/qry-offer-and-group-by-name-or-code`, {
        spId: 0,
      });

      // console.log("ini responnya:", response);

      if (!response?.status && response?.status !== undefined) {
        throw new Error(response?.message || "Failed to fetch offer name data");
      }

      let list = [];
      if (response?.data) {
        list = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        list = response;
      } else {
        list = [];
      }

      const uniqueList = list.reduce((acc: any[], current) => {
        const exists = acc.find((item) => item.offerName === current.offerName);
        if (!exists) {
          acc.push({
            offerName: current.offerName,
            offerCode: current.offerCode,
            offerId: current.offerId,
            offerType: current.offerType,
          });
        }
        return acc;
      }, []);

      setOfferGroupName(uniqueList);
    } catch (error: any) {
      console.error("❌ error fetching offer group name:", error);
      toast.error(`error loading offer group name: ${error.message}`);
      setOfferGroupName([]);
    } finally {
      setLoading(false);
    }
  }, [GetData]);

  // === FILTERED DROPDOWN DATA ===
  const filteredSourceOfferGroupName = useMemo(() => {
    if (!selectedSourceOfferType) return offerGroupName;
    return offerGroupName.filter((offer) => String(offer.offerType) === selectedSourceOfferType);
  }, [offerGroupName, selectedSourceOfferType]);

  const filteredTargetOfferGroupName = useMemo(() => {
    if (!selectedTargetOfferType) return offerGroupName;
    return offerGroupName.filter((offer) => String(offer.offerType) === selectedTargetOfferType);
  }, [offerGroupName, selectedTargetOfferType]);

  // === HANDLE SELECT ===
  const handleSelectSourceOfferType = (value: string) => {
    setSelectedSourceOfferType(value);
    setSelectedSourceOfferGroupName(null);
  };

  const handleSelectTargetOfferType = (value: string) => {
    setSelectedTargetOfferType(value);
    setSelectedTargetOfferGroupName(null);
  };

  const handleSelectSourceOfferName = (selectedItem: offerGroupName) => {
    setSelectedSourceOfferGroupName(selectedItem);
    setSourceOfferGroupNameOpen(false);
  };

  const handleSelectTargetOfferName = (selectedItem: offerGroupName) => {
    setSelectedTargetOfferGroupName(selectedItem);
    setTargetOfferGroupNameOpen(false);
  };

  // === APPLY FILTER KE TABLE ===
  const applyFilters = () => {
    const newFilters: any = {};

    if (selectedRelationType) {
      newFilters.relaType = selectedRelationType.relaType;
    }
    if (selectedSourceOfferType) {
      newFilters.oriOfferType = selectedSourceOfferType;
    }
    if (selectedTargetOfferType) {
      newFilters.destOfferType = selectedTargetOfferType;
    }
    if (selectedSourceOfferGroupName) {
      newFilters.oriOfferId = selectedSourceOfferGroupName.offerId;
    }
    if (selectedTargetOfferGroupName) {
      newFilters.destOfferId = selectedTargetOfferGroupName.offerId;
    }

    setFilters(newFilters);

    table.setColumnFilters([
      {
        id: "applied-filters",
        value: newFilters,
      },
    ]);
  };

  const handleClearFilters = () => {
    setSelectedSourceOfferType(null);
    setSelectedTargetOfferType(null);
    setSelectedSourceOfferGroupName(null);
    setSelectedTargetOfferGroupName(null);
    setSelectedRelationType(null);
    setFilters({});
    setSearchTerm("");
    onSearchChange?.("");

    table.setColumnFilters([]);
  };

  return (
    <div className="card-header flex-wrap gap-1000 border-b-0 px-5">
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-between items-center">
        {/* Search */}
        <div className="w-full">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">Source Offer Type</label>
              {/* ✅ Added value prop and clear option */}
              <Select
                key={selectedSourceOfferType ?? "empty"} // ✅ force re-render ketika kosong
                value={selectedSourceOfferType ?? undefined}
                onValueChange={handleSelectSourceOfferType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Source Offer Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Bundle</SelectItem>
                  <SelectItem value="2">Main Product</SelectItem>
                  <SelectItem value="3">Relation Product</SelectItem>
                  <SelectItem value="4">Price Plan</SelectItem>
                  <SelectItem value="5">Goods Product</SelectItem>
                  <SelectItem value="6">Default Price Plan Group</SelectItem>
                  <SelectItem value="7">Subscription Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Target Offer Type</label>
              {/* ✅ Added value prop and clear option */}
              <Select key={selectedTargetOfferType ?? "empty"} value={selectedTargetOfferType ?? undefined} onValueChange={handleSelectTargetOfferType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Target Offer Type" />
                </SelectTrigger>
                <SelectContent className="cursor-pointer">
                  <SelectItem value="1">Bundle</SelectItem>
                  <SelectItem value="2">Main Product</SelectItem>
                  <SelectItem value="3">Related Product</SelectItem>
                  <SelectItem value="4">Price Plan</SelectItem>
                  <SelectItem value="5">Goods Product</SelectItem>
                  <SelectItem value="6">Default Price Plan Group</SelectItem>
                  <SelectItem value="7">Subscription Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Source Offer Name</label>
              <Popover
                open={sourceOfferGroupNameOpen}
                onOpenChange={(open) => {
                  setSourceOfferGroupNameOpen(open);
                  if (open && offerGroupName.length === 0) {
                    setLoadingSource(true);
                    fetchOfferGroupName().finally(() => setLoadingSource(false));
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors ${errors.offerId ? "border-red-500" : "border-gray-300"} text-[13px] font-medium`}
                    disabled={loadingSource}
                  >
                    <span className="truncate">{loadingSource ? "Loading Relation Types..." : selectedSourceOfferGroupName ? `${selectedSourceOfferGroupName.offerName || "unknown"}` : "Select Source Offer Name"}</span>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" onWheel={(e) => e.stopPropagation()}>
                  <Command>
                    <CommandInput placeholder="Search Offer..." />
                    <CommandList className="max-h-[250px] overflow-y-auto">
                      <CommandEmpty>No offers found.</CommandEmpty>
                      <CommandGroup>
                        {filteredSourceOfferGroupName.map((offer, index) => (
                          <CommandItem key={`${offer.offerId}-${index}`} value={offer.offerName} onSelect={() => handleSelectSourceOfferName(offer)} className="cursor-pointer text-sm">
                            <div className="flex w-full">
                              <span className="truncate max-w-[250px]">{offer.offerName}</span>
                              <span className="ml-auto text-gray-500 whitespace-nowrap">[{offer.offerCode}]</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium">Target Offer Name</label>
              <Popover
                open={targetOfferGroupNameOpen}
                onOpenChange={(open) => {
                  setTargetOfferGroupNameOpen(open);
                  if (open && offerGroupName.length === 0) {
                    setLoadingTarget(true);
                    fetchOfferGroupName().finally(() => setLoadingTarget(false));
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors ${errors.offerId ? "border-red-500" : "border-gray-300"} text-[13px] font-medium`}
                    disabled={loadingTarget}
                  >
                    <span className="truncate">{loadingTarget ? "Loading Relation Types..." : selectedTargetOfferGroupName ? `${selectedTargetOfferGroupName.offerName || "unknown"}` : "Select Target Offer Name"}</span>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                  </button>
                </PopoverTrigger>

                <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" onWheel={(e) => e.stopPropagation()}>
                  <Command>
                    <CommandInput placeholder="Search Offer..." />
                    <CommandList className="max-h-[250px] overflow-y-auto">
                      <CommandEmpty>No offers found.</CommandEmpty>
                      <CommandGroup>
                        {filteredTargetOfferGroupName.map((offer, index) => (
                          <CommandItem key={`${offer.offerId}-${index}`} value={offer.offerName} onSelect={() => handleSelectTargetOfferName(offer)} className="cursor-pointer text-sm">
                            <div className="flex w-full">
                              <span className="truncate max-w-[250px]">{offer.offerName}</span>
                              <span className="ml-auto text-gray-500 whitespace-nowrap">[{offer.offerCode}]</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium">Relation Type</label>
              <Popover
                open={relationTypeOpen}
                onOpenChange={(open) => {
                  setRelationTypeOpen(open);
                  if (open && filteredRelationTypes.length === 0) {
                    fetchRelationType();
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors ${errors.relaType ? "border-red-500" : "border-gray-300"} text-[13px] font-medium`}
                    disabled={loading}
                  >
                    <span className="truncate">{loading ? "Loading Relation Types..." : selectedRelationType ? selectedRelationType.relaTypeName || "unknown" : "Select Relation Type"}</span>
                    <ChevronDown className={`h-4 w-4 opacity-50 shrink-0 ml-2 transition-transform duration-200 ${relationTypeOpen ? "rotate-180" : ""}`} />
                  </button>
                </PopoverTrigger>

                <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" onWheel={(e) => e.stopPropagation()}>
                  {filteredRelationTypes.length === 0 ? (
                    <p className="text-sm text-gray-500 px-2">No relation types found</p>
                  ) : (
                    <ul className="space-y-1 max-h-48 overflow-y-auto">
                      {filteredRelationTypes.map((item) => (
                        <li key={item.relaType}>
                          <button
                            type="button"
                            className={`flex w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${selectedRelationType?.relaType === item.relaType ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"}`}
                            onClick={() => {
                              setSelectedRelationType(item);
                              setRelationTypeOpen(false);
                            }}
                          >
                            <span className="truncate">{item.relaTypeName}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex justify-end items-center pt-5">
              <button type="button" onClick={applyFilters} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed">
                Filter
              </button>
              <button type="button" onClick={handleClearFilters} className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ListToolbarAllRelationship };

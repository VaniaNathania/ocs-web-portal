import React, { useState, useMemo, useContext, useEffect } from "react";
import { ChevronDown, ChevronRight, Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils/cn";
import { useZoneMapList } from "@/pages/main-menu/data-reference/billing-workflow/hooks/useQuery";

interface ZoneMap {
  zoneMapId: number;
  zoneMapName: string;
  zoneId: number;
  zoneName: string;
  zoneCode: string;
  parentZoneId: number;
}

interface ZoneSelectorProps {
  value?: number;
  onValueChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

type SearchFilter = "all" | "zoneName" | "zoneMapName";

const ZoneSelector: React.FC<ZoneSelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Select Zone",
  disabled = false,
  className,
}) => {
  const { data: zoneMap } = useZoneMapList();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [searchFilter, setSearchFilter] = useState<SearchFilter>("all");

  // Find selected zone
  const selectedZone = useMemo(() => {
    return zoneMap?.find((zone) => zone.zoneId === value);
  }, [value, zoneMap]);

  // Filter and group zones based on search
  const filteredAndGroupedZones = useMemo(() => {
    let filteredZones = zoneMap;

    // Apply search filter with null checks
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredZones = zoneMap?.filter((zone) => {
        switch (searchFilter) {
          case "zoneName":
            return (
              (zone.zoneName?.toLowerCase() || "").includes(searchLower) ||
              (zone.zoneCode?.toLowerCase() || "").includes(searchLower)
            );
          case "zoneMapName":
            return (zone.zoneMapName?.toLowerCase() || "").includes(
              searchLower
            );
          case "all":
          default:
            return (
              (zone.zoneMapName?.toLowerCase() || "").includes(searchLower) ||
              (zone.zoneName?.toLowerCase() || "").includes(searchLower) ||
              (zone.zoneCode?.toLowerCase() || "").includes(searchLower)
            );
        }
      });
    }

    // Group filtered zones by zoneMapId
    const groups: Record<number, { parent: ZoneMap; children: ZoneMap[] }> = {};

    filteredZones?.forEach((zone) => {
      if (!groups[zone.zoneMapId]) {
        groups[zone.zoneMapId] = {
          parent: {
            zoneMapId: zone.zoneMapId,
            zoneMapName: zone.zoneMapName || "Unknown Zone Map",
            zoneId: 0,
            zoneName: zone.zoneMapName || "Unknown Zone Map",
            zoneCode: "",
            parentZoneId: 0,
          },
          children: [],
        };
      }
      groups[zone.zoneMapId].children.push(zone);
    });

    return groups;
  }, [zoneMap, searchTerm, searchFilter]);

  // Auto-expand groups when searching
  useEffect(() => {
    if (searchTerm.trim()) {
      const allGroups = new Set(
        Object.keys(filteredAndGroupedZones).map(Number)
      );
      setExpandedGroups(allGroups);
    }
  }, [searchTerm, filteredAndGroupedZones]);

  const toggleGroup = (groupId: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleSelectZone = (zone: ZoneMap) => {
    onValueChange(zone.zoneId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClearSelection = () => {
    onValueChange(0);
  };

  const openDialog = () => {
    if (!disabled) {
      setIsOpen(true);
      // Reset search when opening
      setSearchTerm("");
      // Collapse all groups initially
      setExpandedGroups(new Set());
    }
  };

  const getFilterLabel = (filter: SearchFilter) => {
    switch (filter) {
      case "zoneName":
        return "Zone Name";
      case "zoneMapName":
        return "Zone Map";
      case "all":
      default:
        return "All Fields";
    }
  };

  const getSearchPlaceholder = () => {
    switch (searchFilter) {
      case "zoneName":
        return "Search by zone name...";
      case "zoneMapName":
        return "Search by zone map name...";
      case "all":
      default:
        return "Search by zone map or zone name...";
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <div className={cn("relative", className)}>
        <Button
          type="button"
          variant="outline"
          onClick={openDialog}
          disabled={disabled}
          className="w-full justify-between h-8 text-left  text-sm" // Tambahkan text-sm
        >
          <span className="truncate">
            {selectedZone ? `${selectedZone.zoneName} ` : placeholder}
          </span>
          <div className="flex items-center gap-1">
            {selectedZone && (
              <X
                className="h-3 w-3 text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearSelection();
                }}
              />
            )}
            <Search className="h-3 w-3 text-gray-500" />
          </div>
        </Button>
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[600px] flex flex-col">
          <DialogHeader className="">
            <DialogTitle>Select Zone</DialogTitle>
          </DialogHeader>

          {/* Search Input with Filter */}
          <div className="relative m-4 mb-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={getSearchPlaceholder()}
                  className="pl-9"
                  autoFocus
                />
                {searchTerm && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Search Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="px-3">
                    <Filter className="h-4 w-4 mr-1" />
                    {getFilterLabel(searchFilter)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuCheckboxItem
                    checked={searchFilter === "all"}
                    onCheckedChange={() => setSearchFilter("all")}
                  >
                    All Fields
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={searchFilter === "zoneName"}
                    onCheckedChange={() => setSearchFilter("zoneName")}
                  >
                    Zone Name Only
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={searchFilter === "zoneMapName"}
                    onCheckedChange={() => setSearchFilter("zoneMapName")}
                  >
                    Zone Map Only
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Zone List */}
          <div className="flex-1 overflow-y-auto border rounded-md">
            {Object.keys(filteredAndGroupedZones).length > 0 ? (
              <div className="p-2">
                {Object.entries(filteredAndGroupedZones).map(
                  ([groupId, group]) => (
                    <div key={groupId} className="mb-2 last:mb-0">
                      {/* Parent Group Header */}
                      <div
                        className="flex items-center px-2 py-2 hover:bg-gray-50 cursor-pointer font-medium text-gray-700 rounded border-b"
                        onClick={() => toggleGroup(Number(groupId))}
                      >
                        {expandedGroups.has(Number(groupId)) ? (
                          <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
                        )}
                        <span className="text-sm font-medium flex-1">
                          {group.parent.zoneMapName}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {group.children.length}
                        </span>
                      </div>

                      {/* Child Zones */}
                      {expandedGroups.has(Number(groupId)) && (
                        <div className="ml-6 mt-1 space-y-1">
                          {group.children.map((zone) => (
                            <div
                              key={zone.zoneId}
                              onClick={() => handleSelectZone(zone)}
                              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                selectedZone?.zoneId === zone.zoneId
                                  ? "bg-blue-50 border-blue-200 border"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {zone.zoneName}
                                </div>
                              </div>
                              {selectedZone?.zoneId === zone.zoneId && (
                                <div className="ml-2">
                                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                {searchTerm ? (
                  <div>
                    <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No zones found for "{searchTerm}"</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchFilter === "all"
                        ? "Try searching by zone map name or zone name"
                        : `Try searching in ${getFilterLabel(searchFilter).toLowerCase()}`}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="h-8 w-8 mx-auto mb-2 bg-gray-200 rounded"></div>
                    <p className="text-sm">No zones available</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t m-2">
            <div className="text-xs text-gray-500">
              {Object.values(filteredAndGroupedZones).reduce(
                (total, group) => total + group.children.length,
                0
              )}{" "}
              zones
              {searchTerm && " (filtered)"}
              {searchFilter !== "all" && ` • ${getFilterLabel(searchFilter)}`}
            </div>
            <div className="flex gap-2">
              {selectedZone && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearSelection}
                >
                  Clear
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ZoneSelector;

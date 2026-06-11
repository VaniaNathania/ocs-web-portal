import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { serviceOfferDummy } from "../data";
import { HighlightText } from "@/components/common/HighlightText";

interface OfferItem {
  id: string;
  name: string;
  otc: string;
  mrc: string;
  checked?: boolean;
}

interface OfferGroup {
  id: string;
  name: string;
  icon: string;
  items: OfferItem[];
  expanded?: boolean;
}

const OfferServiceDialog = () => {
  const [showOfferService, setShowOfferService] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [offerGroups, setOfferGroups] =
    useState<OfferGroup[]>(serviceOfferDummy);

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) {
      return offerGroups;
    }

    const searchLower = searchTerm.toLowerCase();

    return offerGroups
      .map((group) => {
        const groupNameMatch = group.name.toLowerCase().includes(searchLower);
        const matchingItems = group.items.filter((item) =>
          item.name.toLowerCase().includes(searchLower),
        );

        // Jika group name atau ada items yang match, tampilkan group dan auto-expand
        if (groupNameMatch || matchingItems.length > 0) {
          return {
            ...group,
            expanded: true, // Auto expand ketika ada match
            items: groupNameMatch ? group.items : matchingItems,
          };
        }

        return null;
      })
      .filter(Boolean) as OfferGroup[];
  }, [offerGroups, searchTerm]);

  const toggleGroup = (groupId: string) => {
    setOfferGroups((groups) =>
      groups.map((group) =>
        group.id === groupId ? { ...group, expanded: !group.expanded } : group,
      ),
    );
  };

  const toggleItem = (groupId: string, itemId: string) => {
    setOfferGroups((groups) =>
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              items: group.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item,
              ),
            }
          : group,
      ),
    );
  };

  const handleClose = () => {
    setShowOfferService(false);
  };

  const handleSubmit = () => {
    //  console.log("Submitted");
    handleClose();
  };

  return (
    <Dialog open={showOfferService} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Offer</DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Service Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        <div
          className="px-6 overflow-y-auto flex-1"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          <div className="border rounded-lg">
            {/* Header */}
            <div className="grid grid-cols-[1fr,120px,120px] gap-4 px-4 py-3 bg-gray-50 border-b font-medium text-sm">
              <div>Offer Group Name</div>
              <div className="text-right">OTC</div>
              <div className="text-right">MRC</div>
            </div>

            {/* Content */}
            <div className="divide-y">
              {filteredGroups.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No results found for "{searchTerm}"
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.id}>
                    {/* Group Header */}
                    <div
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleGroup(group.id)}
                    >
                      {group.expanded ? (
                        <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
                      )}
                      <span className="text-sm mr-2">{group.icon}</span>
                      <span className="text-sm text-blue-600">
                        <HighlightText
                          text={group.name}
                          highlight={searchTerm}
                        />
                      </span>
                    </div>

                    {/* Group Items */}
                    {group.expanded && (
                      <div className="bg-gray-50/50">
                        {group.items.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-[1fr,120px,120px] gap-4 px-4 py-2 hover:bg-gray-100/50"
                          >
                            <div className="flex items-center pl-8">
                              <Checkbox
                                checked={item.checked}
                                onCheckedChange={() =>
                                  toggleItem(group.id, item.id)
                                }
                                className="mr-3"
                              />
                              <span className="text-sm">
                                <HighlightText
                                  text={item.name}
                                  highlight={searchTerm}
                                />
                              </span>
                            </div>
                            <div className="text-right text-sm">{item.otc}</div>
                            <div className="text-right text-sm">{item.mrc}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OfferServiceDialog;

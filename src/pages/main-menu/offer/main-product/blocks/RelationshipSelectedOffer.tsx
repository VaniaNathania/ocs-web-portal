import React, { useState, useMemo, useCallback, useEffect } from "react";
import { X, Search, Plus } from "lucide-react";
import { DataGridColumnHeader, DataGridProvider, DefaultTooltip, KeenIcon } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";

export interface offerRelaProps {
  offerId: number;
  offerName: string;
  networkType: string;
  networkTypeName: string;
}

interface RelationshipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (selectedRelations: offerRelaProps[]) => void;
  selectedOfferType?: string;
  selectedRelationType?: any;
  existingSelectedOffers?: offerRelaProps[];
}

const OFFER_TYPE_MAPPING: Record<string, { methodName: string; offerType: string }> = {
  "2": {
    methodName: "QryIndepOfferForRela",
    offerType: "2",
  },
  "3": {
    // Related Product
    methodName: "QryDependOfferForRela",
    offerType: "3",
  },
  "4": {
    // Price Plan
    methodName: "QryPricePlanForRela",
    offerType: "4",
  },
  "7": {
    // Price Plan
    methodName: "QrySubsPlanOfferForRela",
    offerType: "7",
  },
};

const API_URL_OFFER = apiConfigOffer.offer;

const RelationshipSelectedOffer: React.FC<RelationshipDialogProps> = ({
  isOpen,
  onClose,
  onAdd,
  selectedOfferType,
  selectedRelationType,
  existingSelectedOffers = [],
}) => {
  const { GetData } = useCallApi();
  const [offerRela, setOfferRela] = useState<offerRelaProps[]>([]);
  const [selectedRelations, setSelectedRelations] = useState<offerRelaProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen && selectedOfferType) {
      const fetchAllData = async () => {
        setLoading(true);
        try {
          const mapping = OFFER_TYPE_MAPPING[selectedOfferType];
          if (!mapping) throw new Error("Invalid offer type selected");

          const response = await GetData(`${API_URL_OFFER}/offer/common/qry-offer-for-rela`, {
            methodName: mapping.methodName,
            offerType: mapping.offerType,
            page: 1,
            size: 9999, // ✅ Fetch semua data
            sortBy: "RELA_TYPE",
            sortDirection: "asc",
          });

          if (!response?.status) {
            throw new Error(response?.message || "Failed to fetch offer rela data");
          }

          const list = response?.data?.list ?? response?.data ?? [];
          setOfferRela(Array.isArray(list) ? list : []);
          setOfferRela(Array.isArray(list) ? list : []);
        } catch (err: any) {
          console.error("❌ Error fetching offer rela:", err);
          setError(err.message || "Unknown error");
        } finally {
          setLoading(false);
        }
      };

      fetchAllData();
    }
  }, [isOpen, selectedOfferType, GetData]);

  const filteredFeatures = useMemo(() => {
    if (!offerRela || offerRela.length === 0) return [];

    if (!searchTerm.trim()) return offerRela;

    const searchLower = searchTerm.toLowerCase();
    return offerRela.filter(
      (relation) =>
        relation.offerName?.toLowerCase().includes(searchLower) ||
        relation.networkTypeName?.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, offerRela]);

  const allFilteredSelected = useMemo(() => {
    return (
      filteredFeatures.length > 0 &&
      filteredFeatures.every((f) => selectedRelations.some((sf) => sf.offerId.toString() === f.offerId.toString()))
    );
  }, [filteredFeatures, selectedRelations]);

  const handleRelationshipToggle = useCallback(
    (relaId: string) => {
      const relation = offerRela.find((f) => f.offerId.toString() === relaId);

      if (!relation) return;

      setSelectedRelations((prev) => {
        const isSelected = prev.some((f) => f.offerId.toString() === relaId);

        if (isSelected) {
          const updated = prev.filter((f) => f.offerId.toString() !== relaId);
          return updated;
        } else {
          const updated = [...prev, relation];
          return updated;
        }
      });
    },
    [offerRela]
  );

  const handleSelectAll = useCallback(() => {
    const allIds = filteredFeatures.map((f) => f.offerId.toString());
    const allSelected = allIds.every((id) => selectedRelations.some((f) => f.offerId.toString() === id));

    if (allSelected) {
      // Remove all filtered features from selection
      setSelectedRelations((prev) => prev.filter((f) => !allIds.includes(f.offerId.toString())));
    } else {
      // Add all filtered features that aren't already selected
      const newSelections = filteredFeatures.filter(
        (f) => !selectedRelations.some((sf) => sf.offerId.toString() === f.offerId.toString())
      );
      setSelectedRelations((prev) => [...prev, ...newSelections]);
    }
  }, [filteredFeatures, selectedRelations]);

  const handleAddRelations = useCallback(() => {
    if (selectedRelations.length === 0) {
      toast.error("Please select at least one offer");
      return;
    }

    // console.log('Submitting selected relations: ', selectedRelations);

    onAdd(selectedRelations);
    // toast.success(`${selectedRelations.length} offer(s) added successfully`);
    setSelectedRelations([]);
    setSearchTerm("");
    onClose();
  }, [selectedRelations, onAdd, onClose]);

  const handleCancel = useCallback(() => {
    setSelectedRelations([]);
    setSearchTerm("");
    setOfferRela([]);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      // Set existing selections ketika dialog dibuka
      setSelectedRelations(existingSelectedOffers);
      setSearchTerm("");
      setError(null);
    } else {
      // Hanya reset search term dan error ketika close, biarkan selections tetap
      setSearchTerm("");
      setError(null);
      setOfferRela([]);
    }
  }, [isOpen, existingSelectedOffers]);

  // DataGrid Columns
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        ),
        cell: ({ row }) => {
          const relation = row.original;
          const isSelected = selectedRelations.some((f) => f.offerId.toString() === relation.offerId.toString());

          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleRelationshipToggle(relation.offerId.toString())}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-[50px] text-center",
          cellClassName: "text-center",
        },
      },
      {
        accessorKey: "offerName",
        id: "offerName",
        header: ({ column }) => <DataGridColumnHeader title="Offer Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: "networkTypeName",
        id: "networkTypeName",
        header: ({ column }) => <DataGridColumnHeader title="Network Type" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
    ],
    [allFilteredSelected, handleSelectAll, selectedRelations, handleRelationshipToggle]
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between border-b px-4 py-3 bg-gray-50">
          <DialogTitle className="text-lg font-medium text-gray-800">Add Relationship</DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Offer Name / Product Code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-3">
          <DataGridProvider
            key="relationships-grid"
            columns={columns}
            data={filteredFeatures}
            pagination={{ size: 1000 }}
            toolbar={<div className="p-2"></div>}
            layout={{ card: false }}
            sorting={[{ id: "offerName", desc: false }]}
            serverSide={false}
            // onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            //   return fetchOfferRela(pageIndex + 1, pageSize, sorting, columnFilters);
            // }}
          >
            {/* DataGrid content */}
          </DataGridProvider>
        </div>

        {/* Footer */}
        <DialogFooter className="mt-auto border-t bg-gray-50 px-4 py-3 flex justify-between items-center">
          <div className="text-sm text-gray-600">{selectedRelations.length} relationship(s) selected</div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRelations}
              disabled={selectedRelations.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Submit ({selectedRelations.length})
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RelationshipSelectedOffer;

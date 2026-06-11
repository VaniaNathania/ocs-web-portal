import React, { useState, useMemo, useCallback, useEffect } from "react";
import { X, Search, Plus, Trash2 } from "lucide-react";
import { DataGridColumnHeader, DataGridProvider, DefaultTooltip, KeenIcon, Alert } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
// import { ListToolBarFeature } from './ListToolBarFeature';
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import { ListToolbarAllRelationship } from "../blocks/ListToolbarAllRelationship";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export interface AllRelationshipData {
  offerRelaId: number;
  relaType: string;
  relaTypeName: string;
  oriLowerLimit: string;
  oriUpperLimit: string;
  oriOfferType: string;
  oriOfferGroupOfferType: string;
  destOfferType: string;
  destOfferGroupOfferType: string;
  oriOfferName: string;
  oriOfferGroupName: string;
  destOfferName: string;
  destOfferGroupName: string;
  oriIndOfferName: string;
  oriSubsPlanName: string;
  oriEffDate: string;
  oriExpDate: string;
  destIndOfferName: string;
  destSubsPlanName: string;
  destEffDate: string;
  destExpDate: string;
}

interface AllRelationshipTabContentProps {
  isOpen: boolean;
  onClose: () => void;
  // onAdd: (selectedRelationships: Relationship[]) => void;
  onDataRefresh?: () => void;
}

const API_URL_OFFER = apiConfigOffer.offer;

const AllRelationshipTabContent: React.FC<AllRelationshipTabContentProps> = ({ isOpen, onClose, onDataRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allRelationshipDatas, setAllRelationshipDatas] = useState<AllRelationshipData[]>([]);
  const [selectedRelationship, setSelectedRelationship] = useState<AllRelationshipData[]>([]);
  const [sourceOfferTypeFilter, setSourceOfferTypeFilter] = useState("");
  const [targetOfferTypeFilter, setTargetOfferTypeFilter] = useState("");
  const [relationTypeFilter, setRelationTypeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteAlert, setDeleteAlert] = useState({
    show: false,
    message: "",
  });
  const { GetData, DeleteData } = useCallApi();

  // Function untuk handle data dengan server-side pagination
  const doGetAvailableData = useCallback(
    async (page: number = 1, limit: number = 10, sorting: any = [], filter: any = []) => {
      try {
        setIsLoading(true);

        // Fix: Map column ID to API field name
        const getSortField = (columnId: string) => {
          const mapping: Record<string, string> = {
            oriOfferName: "ORI_OFFER_NAME",
            relaType: "RELA_TYPE",
            destOfferName: "DEST_OFFER_NAME",
            oriLowerLimit: "ORI_LOWER_LIMIT",
            oriUpperLimit: "ORI_UPPER_LIMIT",
          };
          return mapping[columnId] || "RELA_TYPE"; // Default fallback
        };

        const sortField = sorting?.[0]?.id ? getSortField(sorting[0].id) : "RELA_TYPE";
        const sortDirection = sorting?.[0]?.desc ? "desc" : "asc";

        const filterData = filter?.[0]?.value || {};

        const response = await GetData(`${API_URL_OFFER}/offer/qry-offer-rela`, {
          search: searchTerm,
          page,
          size: limit,
          sortBy: sortField,
          sortDirection: sortDirection,
          relaType: filterData.relaType || "",
          oriOfferType: filterData.oriOfferType || "",
          destOfferType: filterData.destOfferType || "",
          oriOfferId: filterData.oriOfferId || "",
          destOfferId: filterData.destOfferId || "",
        });

        if (response?.data) {
          setAllRelationshipDatas(response?.data);
          return {
            data: response.data || [],
            totalCount: response.totalRows || 0,
          };
        } else if (Array.isArray(response)) {
          setAllRelationshipDatas(response);
          return {
            data: response,
            totalCount: response.length,
          };
        } else {
          setAllRelationshipDatas([]);
          console.warn("⚠️ Unexpected API response structure:", response);
          return {
            data: [],
            totalCount: 0,
          };
        }
      } catch (error) {
        console.error("❌ Error fetching relationships:", error);
        toast.error("Error loading relationships");
        return {
          data: [],
          totalCount: 0,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [GetData, searchTerm, selectedRelationship],
  );

  const filteredRelationship = useMemo(() => {
    let filtered = allRelationshipDatas;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (relationship) => relationship.oriOfferName?.toLowerCase().includes(searchLower) || relationship.destOfferName?.toLowerCase().includes(searchLower) || relationship.relaType?.toLowerCase().includes(searchLower),
      );
    }

    // Apply dropdown filters
    if (sourceOfferTypeFilter) {
      filtered = filtered.filter((r) => r.oriOfferName?.includes(sourceOfferTypeFilter));
    }

    if (targetOfferTypeFilter) {
      filtered = filtered.filter((r) => r.destOfferName?.includes(targetOfferTypeFilter));
    }

    if (relationTypeFilter) {
      filtered = filtered.filter((r) => r.relaType === relationTypeFilter);
    }

    return filtered;
  }, [searchTerm, sourceOfferTypeFilter, targetOfferTypeFilter, relationTypeFilter, selectedRelationship, allRelationshipDatas]);

  const handleRelationshipToggle = useCallback(
    (relaId: number, relationData: AllRelationshipData) => {
      setSelectedRelationship((prev) => {
        const isSelected = prev.some((r) => r.offerRelaId === relaId);

        if (isSelected) {
          // remove
          return prev.filter((r) => r.offerRelaId !== relaId);
        } else {
          // add
          return [...prev, relationData];
        }
      });
    },
    [selectedRelationship],
  );

  // toggle select all
  const handleSelectAll = useCallback(() => {
    const allIds = filteredRelationship.map((r) => r.offerRelaId);
    const allSelected = allIds.every((id) => selectedRelationship.some((r) => r.offerRelaId === id));

    if (allSelected) {
      // unselect semua yg ada di filtered
      setSelectedRelationship((prev) => prev.filter((r) => !allIds.includes(r.offerRelaId)));
    } else {
      // tambah semua yg belum masuk
      const newSelections = filteredRelationship.filter((r) => !selectedRelationship.some((sr) => sr.offerRelaId === r.offerRelaId));
      setSelectedRelationship((prev) => [...prev, ...newSelections]);
    }
  }, [filteredRelationship, selectedRelationship]);

  // Handle multiple delete
  const handleDeleteClick = () => {
    if (selectedRelationship.length === 0) {
      toast.warning("Please select relationships to delete");
      return;
    }
    setShowDeleteDialog(true);
    setDeleteAlert({ show: false, message: "" });
  };

  const handleMultipleDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteAlert({ show: false, message: "" });

      const idsToDelete = selectedRelationship.map((rel) => rel.offerRelaId);
      const response = await DeleteData(`${API_URL_OFFER}/offer/rela/del-offer-rela-batch`, idsToDelete);

      if (response?.status) {
        toast.success(`${selectedRelationship.length} relationship(s) deleted successfully`);
        setShowDeleteDialog(false);
        setSelectedRelationship([]);

        // ✅ SOLUSI: Trigger refresh DataGrid
        setRefreshTrigger((prev) => prev + 1);

        if (onDataRefresh && typeof onDataRefresh === "function") {
          onDataRefresh();
        }
      } else {
        throw new Error(response?.message || "Failed to delete relationships");
      }
    } catch (error: any) {
      console.error("❌ Error deleting relationships:", error);
      const errorMessage = error?.message || "Unknown error occurred while deleting relationships";
      setDeleteAlert({ show: true, message: errorMessage });
      toast.error(`Failed to delete relationships: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if all filtered relationships are selected
  const allFilteredSelected = useMemo(() => {
    return filteredRelationship.length > 0 && filteredRelationship.every((r) => selectedRelationship.some((sr) => sr.offerRelaId === r.offerRelaId));
  }, [filteredRelationship, selectedRelationship]);

  const handleClose = useCallback(() => {
    // Reset semua state selection dan filter
    setSelectedRelationship([]);
    setSearchTerm("");
    setSourceOfferTypeFilter("");
    setTargetOfferTypeFilter("");
    setRelationTypeFilter("");
    setDeleteAlert({ show: false, message: "" });
    onClose();
  }, [onClose]);

  // Available Relationships DataGrid Columns
  const column = useMemo<ColumnDef<AllRelationshipData>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <div className="flex items-center justify-center">
            <input type="checkbox" checked={allFilteredSelected} onChange={handleSelectAll} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          </div>
        ),
        cell: ({ row }) => {
          const relation = row.original;
          const isSelected = selectedRelationship.some((r) => r.offerRelaId === relation.offerRelaId);

          return (
            <div className="flex items-center justify-center">
              <input type="checkbox" checked={isSelected} onChange={() => handleRelationshipToggle(relation.offerRelaId, relation)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
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
        accessorFn: (row) => row.oriOfferName,
        id: "oriOfferName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Source Offer Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.relaTypeName,
        id: "relaTypeName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Relation Type" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const relationType = row.original.relaTypeName;
          return <div className="text-gray-600">{relationType}</div>;
        },
      },
      {
        accessorFn: (row) => row.destOfferName,
        id: "destOfferName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Target Offer Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.oriLowerLimit,
        id: "oriLowerLimit",
        header: ({ column }) => <DataGridColumnHeader className="" title="Source Lower Limit" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const limit = row.original.oriLowerLimit;
          return <div className="text-gray-600 text-center">{limit !== null ? limit : "-"}</div>;
        },
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
      },
      {
        accessorFn: (row) => row.oriUpperLimit,
        id: "oriUpperLimit",
        header: ({ column }) => <DataGridColumnHeader className="" title="Source Upper Limit" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const limit = row.original.oriUpperLimit;
          return <div className="text-gray-600 text-center">{limit !== null ? limit : "-"}</div>;
        },
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [selectedRelationship, allFilteredSelected, handleRelationshipToggle, handleSelectAll],
  );

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-7xl h-[95vh] flex flex-col">
          <DialogHeader className="flex justify-between items-center border-b bg-gray-100 px-4 py-3">
            <DialogTitle className="text-lg font-semibold text-gray-800">All Relationships</DialogTitle>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1">
            <div className="flex min-h-full">
              {/* Left Panel - Available Relationships */}
              <div className="flex-1 border-r flex flex-col min-h-0">
                <div className="flex-1 overflow-auto min-h-0 p-3">
                  <DataGridProvider
                    key={`relationships-${refreshTrigger}`}
                    columns={column}
                    pagination={{ size: 10 }}
                    toolbar={<ListToolbarAllRelationship />}
                    layout={{ card: false }}
                    sorting={[{ id: "relaType", desc: false }]} // Fix: Changed to relaType to match RELA_TYPE default
                    serverSide={true}
                    onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => doGetAvailableData(pageIndex + 1, pageSize, sorting, columnFilters)}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
              {selectedRelationship.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleDeleteClick} className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedRelationship.length})
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => !isDeleting && setShowDeleteDialog(open)}>
        <DialogContent className="container-fixed max-w-2xl flex flex-col p-5 overflow-hidden [&>button]:hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <DialogHeader className="p-0 border-0 block">
            <Alert variant="warning">
              <h3 className="text-lg font-semibold mb-2">Are you sure?</h3>
              <p className="text-sm mb-3">You are about to delete {selectedRelationship.length} relationship(s):</p>
              <div className="max-h-40 overflow-y-auto bg-gray-50 rounded p-3 text-sm">
                {selectedRelationship.map((rel, index) => {
                  // Handle empty or null values
                  const sourceName = rel.oriOfferName || "(Unknown Source)";
                  const targetName = rel.destOfferName || "(Unknown Target)";

                  return (
                    <div key={rel.offerRelaId} className="mb-1 last:mb-0">
                      <span className="font-medium text-gray-700">{index + 1}.</span> <span className="text-blue-600">{sourceName}</span> <span className="text-gray-500">&</span> <span className="text-green-600">{targetName}</span>{" "}
                    </div>
                  );
                })}
              </div>
            </Alert>
            {deleteAlert.show && (
              <Alert variant="danger" className="mt-3">
                <h3>{deleteAlert.message}</h3>
              </Alert>
            )}
          </DialogHeader>
          <DialogFooter className="flex justify-end items-center gap-4 mt-3">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleMultipleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : `Delete ${selectedRelationship.length} Relationship(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AllRelationshipTabContent;

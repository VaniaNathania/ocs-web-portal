import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddSalesOrgProps {
  isOpen?: boolean;
  onClose?: () => void;
  offerId?: number;
  areaId?: number;
  onSuccess?: () => void;
  existingSelectedIds?: number[];
}

interface SalesOrgData {
  orgId: number;
  parentOrgId: number | null;
  areaId: number;
  orgCode: string;
  orgName: string;
  orgType: string;
  state: string;
  spId: number;
  isAlreadySelected?: boolean; // Tambahkan flag untuk tracking status
}

const API_URL_OFFER = apiConfigOffer.offer;

const AddSalesOrg: React.FC<AddSalesOrgProps> = ({
  isOpen,
  onClose = () => {},
  offerId,
  areaId = 1,
  onSuccess,
  existingSelectedIds = [],
}) => {
  const { GetData, PostData } = useCallApi();

  const [selectedSalesOrg, setSelectedSalesOrg] = useState<SalesOrgData[]>([]);
  const [salesOrgList, setSalesOrgList] = useState<SalesOrgData[]>([]);
  const [filteredSalesOrg, setFilteredSalesOrg] = useState<SalesOrgData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("orgName");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Helper function to create unique identifier
  const getUniqueKey = (org: SalesOrgData) => `${org.orgId}`;

  // PERBAIKAN: Gunakan orgId sebagai identifier utama
  const getOrgIdentifier = (org: SalesOrgData) => {
    return org.orgId;
  };

  // Fetch available sales organizations
  const fetchSalesOrganizations = useCallback(
    async (targetId: number) => {
      if (!offerId) return;

      try {
        setLoading(true);
        // console.log("🔄 Fetching sales organizations with:", {
        //   offerId,
        //   targetId,
        //   existingSelectedIds,
        // });

        const response = await GetData(`${API_URL_OFFER}/offer/common/qry-org-list`, {
          parentId: null,
          areaId: targetId,
          orgName: "",
          orgCode: "",
          orgType: "",
          state: "A",
          spId: 0,
        });

        if (!response?.status && response?.status !== undefined) {
          throw new Error(response?.message || "Failed to fetch sales organizations");
        }

        let responseData = [];
        if (response?.data) {
          responseData = Array.isArray(response.data) ? response.data : [response.data];
        } else if (Array.isArray(response)) {
          responseData = response;
        }

        // console.log("📊 Raw response data:", responseData.length, "organizations");

        // PERBAIKAN: Jangan filter data, tapi tandai yang sudah selected
        const availableOrgs = responseData.filter((org: SalesOrgData) => {
          return org && typeof org.orgName === "string";
        });

        // Tandai organisasi mana yang sudah dipilih sebelumnya
        const orgsWithStatus = availableOrgs.map((org: SalesOrgData) => {
          const isAlreadySelected = existingSelectedIds.includes(org.orgId);
          
          // console.log(
          //   `🔍 Checking org ${org.orgName} (orgId: ${org.orgId}): ${isAlreadySelected ? "ALREADY SELECTED" : "AVAILABLE"}`
          // );

          return {
            ...org,
            isAlreadySelected, // Tambahkan flag untuk tracking
          };
        });

        setSalesOrgList(orgsWithStatus);
        setFilteredSalesOrg(orgsWithStatus);

        // console.log(`✅ Successfully loaded ${availableOrgs.length} available sales organizations`);
        // console.log(`🚫 Excluded ${responseData.length - availableOrgs.length} already selected organizations`);
      } catch (error: any) {
        console.error("❌ Error fetching sales organizations:", error);
        toast.error(`Error loading sales organizations: ${error.message}`);
        setSalesOrgList([]);
        setFilteredSalesOrg([]);
      } finally {
        setLoading(false);
      }
    },
    [offerId, existingSelectedIds, GetData]
  );

  // PERBAIKAN: Load data yang sudah selected saat dialog dibuka
  useEffect(() => {
    if (isOpen && salesOrgList.length > 0) {
      // Auto-select data yang sudah ada sebelumnya
      const alreadySelectedOrgs = salesOrgList.filter(org => org.isAlreadySelected);
      if (alreadySelectedOrgs.length > 0) {
        setSelectedSalesOrg(alreadySelectedOrgs);
        // console.log("🔄 Auto-selected previously added organizations:", alreadySelectedOrgs.map(org => org.orgName));
      }
    }
  }, [isOpen, salesOrgList]);

  useEffect(() => {
    let targetId = areaId;

    if (!targetId || targetId <= 0) {
      targetId = 1;
    }

    if (isOpen) {
      // console.log("🔄 Dialog opened, fetching data...");
      // Reset state saat dialog dibuka
      setSelectedSalesOrg([]);
      setSearchTerm("");
      setFilterType("orgName");

      // Fetch data
      fetchSalesOrganizations(targetId);
    }
  }, [areaId, isOpen, offerId, existingSelectedIds, fetchSalesOrganizations]);

  // Filter organizations based on search term and filter type
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSalesOrg(salesOrgList);
    } else {
      const filtered = salesOrgList.filter((org) => {
        const searchValue = searchTerm.toLowerCase();
        switch (filterType) {
          case "orgCode":
            return org.orgCode && org.orgCode.toLowerCase().includes(searchValue);
          case "orgName":
          default:
            return org.orgName.toLowerCase().includes(searchValue);
        }
      });
      setFilteredSalesOrg(filtered);
    }
  }, [searchTerm, salesOrgList, filterType]);

  const handleSelect = useCallback((org: SalesOrgData, checked: boolean) => {
    // Jangan izinkan uncheck data yang sudah ada sebelumnya
    if (org.isAlreadySelected && !checked) {
      toast.info("This organization is already added and cannot be removed from this dialog");
      return;
    }

    const uniqueKey = getUniqueKey(org);

    // console.log("🔄 handleSelect called:", {
    //   org: org.orgName,
    //   checked,
    //   orgId: org.orgId,
    //   orgCode: org.orgCode,
    //   isAlreadySelected: org.isAlreadySelected,
    //   uniqueKey,
    // });

    setSelectedSalesOrg((prev) => {
      if (checked) {
        const exists = prev.some((item) => getUniqueKey(item) === uniqueKey);
        if (!exists) {
          // console.log("➕ Adding organization:", org.orgName);
          return [...prev, org];
        }
        return prev;
      } else {
        // console.log("➖ Removing organization:", org.orgName);
        return prev.filter((item) => getUniqueKey(item) !== uniqueKey);
      }
    });
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select semua data (termasuk yang sudah ada)
      setSelectedSalesOrg(filteredSalesOrg);
    } else {
      // Unselect hanya data baru, keep yang sudah ada
      const alreadySelectedOrgs = filteredSalesOrg.filter(org => org.isAlreadySelected);
      setSelectedSalesOrg(alreadySelectedOrgs);
    }
  };

  const handleSubmit = async () => {
    if (selectedSalesOrg.length === 0) {
      toast.warning("Please select at least one sales organization");
      return;
    }

    if (!offerId) {
      toast.error("Offer ID is required");
      return;
    }

    try {
      setSubmitting(true);

      // PERBAIKAN: Hanya submit data yang belum ada sebelumnya
      const newOrgsToSubmit = selectedSalesOrg.filter(org => !org.isAlreadySelected);
      
      if (newOrgsToSubmit.length === 0) {
        toast.warning("Please select at least one new sales organization");
        return;
      }

      // console.log(
      //   "📤 Submitting NEW organizations:",
      //   newOrgsToSubmit.map((org) => ({
      //     name: org.orgName,
      //     orgId: org.orgId,
      //     orgCode: org.orgCode,
      //   }))
      // );

      // PERBAIKAN: Gunakan orgId sebagai identifier
      const submitData = newOrgsToSubmit.map((selectedOrg) => ({
        offerId: offerId,
        orgId: selectedOrg.orgId, // Gunakan orgId yang benar
        spId: selectedOrg.spId || 0,
        excludeFlags: "",
      }));

      // console.log("📤 Submit payload:", submitData);

      const result = await PostData(`${API_URL_OFFER}/offer/apply/add-offer-apply-org-batch`, submitData);

      if (!result?.status && result?.status !== undefined) {
        throw new Error(result?.message || "Failed to add organizations");
      }

      toast.success(`Successfully added ${newOrgsToSubmit.length} sales organization(s)`);
      // console.log("✅ Organizations added successfully");

      // Reset state
      setSelectedSalesOrg([]);
      setSearchTerm("");

      // Call onSuccess to refresh parent data
      if (onSuccess) {
        onSuccess();
      }

      // Close dialog
      onClose();
    } catch (error: any) {
      console.error("❌ Error submitting sales organizations:", error);
      toast.error(`Error adding sales organizations: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const closePopUp = () => {
    // console.log("🔄 Closing dialog and resetting state");
    setSelectedSalesOrg([]);
    setSearchTerm("");
    setFilterType("orgName");
    onClose();
  };

  const isAllSelected =
    filteredSalesOrg.length > 0 &&
    selectedSalesOrg.length === filteredSalesOrg.length &&
    filteredSalesOrg.every((org) => selectedSalesOrg.some((selected) => getUniqueKey(selected) === getUniqueKey(org)));

  const handleRowClick = (org: SalesOrgData) => {
    const isCurrentlySelected = selectedSalesOrg.some((item) => getUniqueKey(item) === getUniqueKey(org));
    handleSelect(org, !isCurrentlySelected);
  };

  const columns = useMemo<ColumnDef<SalesOrgData>[]>(
    () => [
      {
        id: "select",
        enableHiding: false,
        enableSorting: false,
        header: ({ table }) => {
          const currentPageData = table.getRowModel().rows.map((row) => row.original);
          const availableForSelection = currentPageData.filter(org => !org.isAlreadySelected);
          const allAvailableSelected = availableForSelection.length > 0 && 
            availableForSelection.every((org) => {
              const uniqueKey = getUniqueKey(org);
              return selectedSalesOrg.some((selected) => getUniqueKey(selected) === uniqueKey);
            });

          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={allAvailableSelected && availableForSelection.length > 0}
                disabled={availableForSelection.length === 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    // Select semua yang available
                    const newSelections = availableForSelection.filter((org) => {
                      const uniqueKey = getUniqueKey(org);
                      return !selectedSalesOrg.some((selected) => getUniqueKey(selected) === uniqueKey);
                    });
                    setSelectedSalesOrg((prev) => [...prev, ...newSelections]);
                  } else {
                    // Unselect hanya yang available, keep yang sudah ada
                    const availableKeys = availableForSelection.map(getUniqueKey);
                    setSelectedSalesOrg((prev) =>
                      prev.filter((selected) => !availableKeys.includes(getUniqueKey(selected)))
                    );
                  }
                }}
                className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                  availableForSelection.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
          );
        },
        cell: ({ row }) => {
          const org = row.original;
          const uniqueKey = getUniqueKey(org);
          const isChecked = selectedSalesOrg.some((item) => getUniqueKey(item) === uniqueKey) || org.isAlreadySelected;

          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => {
                  e.stopPropagation();
                  handleSelect(org, e.target.checked);
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          );
        },
        meta: {
          headerClassName: "w-[50px] text-center",
          cellClassName: "text-center",
        },
      },
      {
          accessorFn: (row) => row.orgName,
          id: "orgName",
          header: ({ column }) => <DataGridColumnHeader title="Organization Name" column={column} />,
          enableSorting: true,
          enableHiding: false,
          cell: ({ row }) => (
              <div className="cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={() => handleRowClick(row.original)}>
            {row.original.orgName}
          </div>
        ),
    },
    {
      accessorFn: (row) => row.orgCode,
      id: "orgCode",
      header: ({ column }) => <DataGridColumnHeader title="Organization Code" column={column} />,
      enableSorting: true,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={() => handleRowClick(row.original)}>
          {row.original.orgCode}
        </div>
      ),
    },
    ],
    [selectedSalesOrg, handleSelect, handleRowClick]
  );

  const getPlaceholderText = () => {
    switch (filterType) {
      case "orgCode":
        return "Search Organization Code...";
      case "orgName":
      default:
        return "Search Organization Name...";
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closePopUp();
      }}
    >
      <DialogContent className="max-w-3xl flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-medium">Add Sales Organization</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-6">
          <div className="flex w-full gap-3 items-center">
            <div className="flex my-auto w-1/4 py-5">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="px-2 py-1 text-xs h-8">
                  <SelectValue placeholder="Select Filtering" />
                </SelectTrigger>
                <SelectContent className="cursor-pointer">
                  <SelectItem value="orgName">Organization Name</SelectItem>
                  <SelectItem value="orgCode">Organization Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="input input-sm w-1/2 flex items-center gap-2">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder={getPlaceholderText()}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full"
              />
            </label>
          </div>

          <div className="flex h-full gap-4">
            <div className="flex-1 flex flex-col min-h-0 pr-4">
              <div className="flex-1 overflow-auto min-h-0">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading sales organizations...</div>
                  </div>
                ) : filteredSalesOrg.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">
                      {salesOrgList.length === 0
                        ? "No sales organizations available"
                        : "No organizations match your search criteria"}
                    </div>
                  </div>
                ) : (
                  <DataGridProvider columns={columns} data={filteredSalesOrg} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={closePopUp}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedSalesOrg.filter(org => !org.isAlreadySelected).length === 0 || submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Adding..." : `Add (${selectedSalesOrg.filter(org => !org.isAlreadySelected).length})`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSalesOrg;
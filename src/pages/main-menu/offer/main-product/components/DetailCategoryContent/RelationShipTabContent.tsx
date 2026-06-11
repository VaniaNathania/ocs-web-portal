import React, { useState, useEffect, useCallback } from "react";
import { Plus, Network, ChevronDown, ChevronRight } from "lucide-react";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import AddRelationshipDialog from "../../blocks/AddRelationshipDialog";
import AllRelationshipTabContent from "../AllRelationshipTabContent";
import DeleteRelationship from "../../blocks/DeleteRelationship";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { Button } from "@/components/ui/button";

interface SourceOffer {
  id: string;
  name: string;
  relationType: string;
  targetOffers: TargetOffer[];
  offerRelaId: string;
}

interface TargetOffer {
  id: string;
  name: string;
  relationType: string;
  sourceOffers: SimpleOffer[];
  offerRelaId: string;
}

interface SimpleOffer {
  id: string;
  name: string;
  offerRelaId: string;
}

interface RelationshipData {
  D: Array<{
    offerRelaId: string;
    relaType: string;
    oriLowerLimit: string;
    oriUpperLimit: string;
    oriOfferType: string;
    oriOfferGroupOfferType: string;
    destOfferName: string;
    oriOfferName: string;
    oriOfferCode: string;
    oriOfferGroupName: string;
    oriIndOfferName: string;
    oriSubsPlanName: string;
    oriEffDate: string;
    oriExpDate: string;
    oriId: string;
  }>;
  O: Array<{
    offerRelaId: string;
    relaType: string;
    oriLowerLimit: string;
    oriUpperLimit: string;
    destOfferType: string;
    destOfferGroupOfferType: string;
    oriOfferName: string;
    destOfferName: string;
    destOfferCode: string;
    destOfferGroupName: string;
    destIndOfferName: string;
    destSubsPlanName: string;
    destEffDate: string;
    destExpDate: string;
  }>;
}

interface RelationshipType {
  relaType: string;
  relaTypeName: string;
}

interface FilteredRelationType {
  relaType: string;
  relaTypeName: string;
}

interface ProcessedMenuData {
  D: Array<{
    menu: string;
    relaType: string;
    items: any[];
  }>;
  O: Array<{
    menu: string;
    relaType: string;
    items: any[];
  }>;
}

interface RelationshipTabContentProps {
  // category: string;
  rowData: any;
  allowedRelationTypes: string[];
}

const API_URL_OFFER = apiConfigOffer.offer;

// Define the allowed relation types

const RelationshipTabContent: React.FC<RelationshipTabContentProps> = ({ rowData, allowedRelationTypes }) => {
  const ALLOWED_RELATION_TYPES = allowedRelationTypes;
  const [openSourceDropdowns, setOpenSourceDropdowns] = useState<Set<string>>(new Set());
  const [openTargetDropdowns, setOpenTargetDropdowns] = useState<Set<string>>(new Set());
  const [relationship, setRelationship] = useState<RelationshipData | null>(null);
  const [relationshipTypes, setRelationshipTypes] = useState<RelationshipType[]>([]);
  const [filteredRelationTypes, setFilteredRelationTypes] = useState<FilteredRelationType[]>([]);
  const [loading, setLoading] = useState(false);

  const { GetData } = useCallApi();
  const { menuPrivAccess } = useOfferLayout();

  // State untuk data yang sudah diproses dari API
  const [sourceOffers, setSourceOffers] = useState<SourceOffer[]>([]);
  const [targetOffers, setTargetOffers] = useState<TargetOffer[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAllRelationshipOpen, setIsAllRelationshipOpen] = useState(false);

  // NEW: Fungsi untuk fetch filtered relation types dari API qry-rela-type
  const fetchFilteredRelationTypes = useCallback(async () => {
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

      // Filter only the allowed relation types
      const filteredList = list.filter((item: RelationshipType) => ALLOWED_RELATION_TYPES.includes(item.relaTypeName));

      const uniqueList = filteredList.reduce((acc: FilteredRelationType[], current: RelationshipType) => {
        const exists = acc.find((item) => item.relaTypeName === current.relaTypeName);
        if (!exists) {
          acc.push({
            relaType: current.relaType,
            relaTypeName: current.relaTypeName,
          });
        }
        return acc;
      }, []);

      // Sort by the order in ALLOWED_RELATION_TYPES
      uniqueList.sort((a: any, b: any) => {
        const indexA = ALLOWED_RELATION_TYPES.indexOf(a.relaTypeName);
        const indexB = ALLOWED_RELATION_TYPES.indexOf(b.relaTypeName);
        return indexA - indexB;
      });

      setFilteredRelationTypes(uniqueList.length > 0 ? uniqueList : []);
    } catch (err: any) {
      console.error("❌ Error fetching filtered relation types:", err);
      toast.error(`Error loading relation types: ${err.message}`);
      setFilteredRelationTypes([]);
    } finally {
      setLoading(false);
    }
  }, [GetData]);

  // Do not load relation types on mount; will be loaded with initial data

  // Functions to open and close the popup
  const openSourcePopup = async () => {
    setPopupType("source");

    if (filteredRelationTypes.length === 0) {
      await fetchFilteredRelationTypes();
    }

    setShowPopup(true);
  };

  const openTargetPopup = async () => {
    setPopupType("target");

    if (filteredRelationTypes.length === 0) {
      await fetchFilteredRelationTypes();
    }

    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupType("");
  };

  const handleShowAllRelationship = useCallback((open: boolean) => {
    setIsAllRelationshipOpen(open);
  }, []);

  const refreshRelationshipData = useCallback(async (): Promise<void> => {
    // console.log("🔄 Refreshing relationship data...");

    try {
      setIsSaving(true);

      // Refresh relationship types jika belum ada
      if (relationshipTypes.length === 0) {
        await fetchRelationshipType();
      }

      // Refresh relationship data
      if (rowData?.offerId) {
        await fetchRelationshipData(rowData.offerId);
      } else if (rowData?.id) {
        await fetchRelationshipData(rowData.id);
      }

      // console.log("✅ Relationship data refreshed successfully");
    } catch (error) {
      console.error("❌ Error refreshing relationship data:", error);
      toast.error("Failed to refresh relationship data");
    } finally {
      setIsSaving(false);
    }
  }, [rowData?.offerId, rowData?.id, relationshipTypes.length]);

  // Fungsi untuk transformasi data berdasarkan master list
  const transformData = (detailList: any[], masterList: RelationshipType[]) => {
    return masterList.map((masterItem) => {
      const filteredItems = detailList.filter((d) => d.relaType === masterItem.relaType);
      return {
        menu: masterItem.relaTypeName,
        relaType: masterItem.relaType,
        items: filteredItems,
      };
    });
  };

  // Fungsi untuk memproses data API menjadi format menu yang diinginkan
  const processApiDataToMenu = (relationshipData: RelationshipData, relationshipTypes: RelationshipType[]): ProcessedMenuData => {
    const menuD = transformData(relationshipData.D || [], relationshipTypes);
    const menuO = transformData(relationshipData.O || [], relationshipTypes);

    return { D: menuD, O: menuO };
  };

  // Fungsi untuk mengkonversi data menu menjadi format yang diperlukan untuk UI
  const convertMenuToUIFormat = (menuData: ProcessedMenuData): { sourceOffers: SourceOffer[]; targetOffers: TargetOffer[] } => {
    const sourceOffers: SourceOffer[] = [];
    const targetOffers: TargetOffer[] = [];

    // Process menu O (As Source Offer)
    menuData.O.forEach((menu) => {
      if (menu.items.length > 0) {
        menu.items.forEach((item) => {
          // Cari apakah sudah ada source offer dengan nama yang sama
          let existingSourceOffer = sourceOffers.find((so) => so.name === `${menu.menu}`);

          if (!existingSourceOffer) {
            existingSourceOffer = {
              id: `${menu.relaType}_${item.oriOfferName}`,
              name: `${menu.menu}`,
              relationType: menu.relaType,
              targetOffers: [],
              offerRelaId: item.offerRelaId,
            };
            sourceOffers.push(existingSourceOffer);
          }

          // Tambahkan target offer ke source offer
          existingSourceOffer.targetOffers.push({
            id: `${item.offerRelaId}_dest_${item.destOfferName}`,
            name: item.destOfferName,
            relationType: menu.relaType,
            sourceOffers: [],
            offerRelaId: item.offerRelaId,
          });
        });
      }
    });

    // Process menu D (As Target Offer)
    menuData.D.forEach((menu) => {
      if (menu.items.length > 0) {
        menu.items.forEach((item) => {
          // Cari apakah sudah ada target offer dengan nama yang sama
          let existingTargetOffer = targetOffers.find((to) => to.name === `${menu.menu}`);

          if (!existingTargetOffer) {
            existingTargetOffer = {
              id: `${menu.relaType}_${item.destOfferName}`,
              name: `${menu.menu}`,
              relationType: menu.relaType,
              sourceOffers: [],
              offerRelaId: item.offerRelaId,
            };
            targetOffers.push(existingTargetOffer);
          }

          // Tambahkan source offer ke target offer
          existingTargetOffer.sourceOffers.push({
            id: `${item.offerRelaId}_ori_${item.oriOfferName}`,
            name: item.oriOfferName,
            offerRelaId: item.offerRelaId,
          });
        });
      }
    });

    return { sourceOffers, targetOffers };
  };

  const toggleSourceDropdown = (offerId: string) => {
    const newOpenDropdowns = new Set(openSourceDropdowns);
    if (newOpenDropdowns.has(offerId)) {
      newOpenDropdowns.delete(offerId);
    } else {
      newOpenDropdowns.add(offerId);
    }
    setOpenSourceDropdowns(newOpenDropdowns);
  };

  const toggleTargetDropdown = (offerId: string) => {
    const newOpenDropdowns = new Set(openTargetDropdowns);
    if (newOpenDropdowns.has(offerId)) {
      newOpenDropdowns.delete(offerId);
    } else {
      newOpenDropdowns.add(offerId);
    }
    setOpenTargetDropdowns(newOpenDropdowns);
  };

  const fetchRelationshipType = async () => {
    try {
      setLoading(true);
      const response = await GetData(`${API_URL_OFFER}/offer/common/qry-rela-type`, {});

      if (response?.data) {
        setRelationshipTypes(response.data);
      }
    } catch (error) {
      toast.error("Error GET Relationship Type data");
      console.error("Error fetching relationship type data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelationshipData = async (offerId: string) => {
    try {
      setLoading(true);

      const response = await GetData(`${API_URL_OFFER}/offer/qry-offer-rela-list`, {
        destOfferId: offerId,
        oriOfferId: offerId,
        spId: 0,
      });

      if (response?.data) {
        setRelationship(response.data);

        // Jika relationshipTypes sudah ada, langsung proses data
        if (relationshipTypes.length > 0) {
          const menuData = processApiDataToMenu(response.data, relationshipTypes);

          // Convert menu data ke UI format
          const { sourceOffers: apiSourceOffers, targetOffers: apiTargetOffers } = convertMenuToUIFormat(menuData);
          setSourceOffers(apiSourceOffers);
          setTargetOffers(apiTargetOffers);
        }
      }
    } catch (error) {
      toast.error("Error GET Relationship data");
      console.error("Error fetching relationship data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Effect untuk memproses data ketika kedua data (relationship dan relationshipTypes) sudah tersedia
  useEffect(() => {
    if (relationship && relationshipTypes.length > 0) {
      const menuData = processApiDataToMenu(relationship, relationshipTypes);

      // Convert menu data ke UI format
      const { sourceOffers: apiSourceOffers, targetOffers: apiTargetOffers } = convertMenuToUIFormat(menuData);
      setSourceOffers(apiSourceOffers);
      setTargetOffers(apiTargetOffers);
    }
  }, [relationship, relationshipTypes]);

  useEffect(() => {
    if (rowData?.offerId) {
      fetchRelationshipData(rowData.offerId);
      fetchRelationshipType();
    } else if (rowData?.id) {
      // Fallback to id if offerId is not available
      fetchRelationshipData(rowData.id);
      fetchRelationshipType();
    }
  }, [rowData?.offerId, rowData?.id]);

  return (
    <div className="w-full mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* All Relationships Button */}
      <div className="p-5 pb-0">
        <button onClick={() => handleShowAllRelationship(true)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors duration-200 text-sm font-medium">
          <Network className="w-4 h-4" />
          All Relationships
        </button>
      </div>
      {/* Content */}
      <div className="px-5 pb-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Relationship</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Source Offer Section */}
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">As Source Offer</span>
              <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
                <Button
                  onClick={openSourcePopup}
                  variant="ghost"
                  className="text-blue-600 m-0 py-0 rounded-md transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700"
                  // className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </Button>
              </AccessWrapper>
            </div>
            <div className="p-4 bg-white min-h-[120px]">
              {loading ? (
                <div className="text-center text-gray-500 text-sm py-8">Loading...</div>
              ) : sourceOffers.length > 0 ? (
                <div className="space-y-2">
                  {sourceOffers.map((offer) => (
                    <div key={offer.id} className="relative">
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 flex-1">
                          {/* <div className="w-3 h-3 bg-gray-400 rounded-sm flex-shrink-0"></div> */}
                          <button onClick={() => toggleSourceDropdown(offer.id)} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors duration-200 text-left flex-1">
                            <span>{offer.name}</span>
                            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${openSourceDropdowns.has(offer.id) ? "rotate-90" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {/* Dropdown Menu - Show current target offers only */}
                      {openSourceDropdowns.has(offer.id) && (
                        <div className="mt-2 ml-5 bg-white border border-gray-200 rounded-md shadow-lg">
                          <div className="py-1">
                            {offer.targetOffers.length > 0 ? (
                              offer.targetOffers.map((targetOffer) => (
                                <div key={targetOffer.id} className="flex items-center justify-between group/item px-3 py-2 hover:bg-gray-50 transition-colors duration-200">
                                  <div className="flex items-center gap-2">
                                    {/* <div className="w-2 h-2 bg-gray-300 rounded-sm flex-shrink-0"></div> */}
                                    <span className="text-sm text-gray-700">{targetOffer.name}</span>
                                  </div>
                                  <DeleteRelationship
                                    offerRelaId={targetOffer.offerRelaId}
                                    relationshipName={targetOffer.name}
                                    onDeleteSuccess={refreshRelationshipData}
                                    variant="minimal"
                                    className="opacity-0 group-hover/item:opacity-100"
                                  />
                                </div>
                              ))
                            ) : (
                              <div className="px-3 py-4 text-center text-gray-500 text-sm">No target offers linked</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm py-8">{loading ? "Loading..." : "No record to view"}</div>
              )}
            </div>
          </div>

          {/* Target Offer Section */}
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">As Target Offer</span>
              <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
                <Button onClick={openTargetPopup} variant="ghost" className="text-blue-600 m-0 py-0 rounded-md transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700">
                  <Plus className="w-3 h-3" />
                  Add
                </Button>
              </AccessWrapper>
            </div>
            <div className="p-4 bg-white min-h-[120px]">
              {loading ? (
                <div className="text-center text-gray-500 text-sm py-8">Loading...</div>
              ) : targetOffers.length > 0 ? (
                <div className="space-y-2">
                  {targetOffers.map((offer) => (
                    <div key={offer.id} className="relative">
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 flex-1">
                          {/* <div className="w-3 h-3 bg-gray-400 rounded-sm flex-shrink-0"></div> */}
                          <button onClick={() => toggleTargetDropdown(offer.id)} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors duration-200 text-left flex-1">
                            <span>{offer.name}</span>
                            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${openTargetDropdowns.has(offer.id) ? "rotate-90" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {/* Dropdown Menu - Show current source offers only */}
                      {openTargetDropdowns.has(offer.id) && (
                        <div className="mt-2 ml-5 bg-white border border-gray-200 rounded-md shadow-lg">
                          <div className="py-1">
                            {offer.sourceOffers.length > 0 ? (
                              offer.sourceOffers.map((sourceOffer) => (
                                <div key={sourceOffer.id} className="flex items-center justify-between group/item px-3 py-2 hover:bg-gray-50 transition-colors duration-200">
                                  <div className="flex items-center gap-2">
                                    {/* <div className="w-2 h-2 bg-gray-300 rounded-sm flex-shrink-0"></div> */}
                                    <span className="text-sm text-gray-700">{sourceOffer.name}</span>
                                  </div>
                                  <DeleteRelationship
                                    offerRelaId={sourceOffer.offerRelaId}
                                    relationshipName={sourceOffer.name}
                                    onDeleteSuccess={refreshRelationshipData}
                                    variant="minimal"
                                    className="opacity-0 group-hover/item:opacity-100"
                                  />
                                </div>
                              ))
                            ) : (
                              <div className="px-3 py-4 text-center text-gray-500 text-sm">No source offers linked</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm py-8">{loading ? "Loading..." : "No target offers found"}</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AllRelationshipTabContent
        isOpen={isAllRelationshipOpen}
        onClose={() => setIsAllRelationshipOpen(false)}
        // rowData={rowData}
        onDataRefresh={refreshRelationshipData}
      />
      {showPopup && <AddRelationshipDialog rowData={rowData} filteredRelationTypes={filteredRelationTypes} popupType={popupType} onClose={closePopup} onSaveSuccess={refreshRelationshipData} />}
    </div>
  );
};

export default RelationshipTabContent;

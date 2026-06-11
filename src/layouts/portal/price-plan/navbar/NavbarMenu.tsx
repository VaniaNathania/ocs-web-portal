import { KeenIcon } from "@/components/keenicons";
import { Menu, MenuArrow, TMenuConfig, MenuItem, MenuLink, MenuSub, MenuTitle } from "@/components/menu";
import { useMenus } from "@/providers";
import { useLocation, useParams } from "react-router-dom";
import { useLanguage } from "@/i18n";
import { doGetNavbarMenu } from "@/actions/NavbarMenuActions";
import { useCallback, useEffect, useState } from "react";
import { capitalizeWords, urlWords } from "@/utils";
import { usePortalLayout } from "../PortalLayoutProvider";
import { useAuthContext } from "@/auth";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { PricePlanDetail } from "@/pages/main-menu/types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useNavbarMenuContext } from "./useNavbarContext";
import { VersionDialog, VersionFormData } from "./blocks/VersionDialog";
import { DeleteDialog } from "./blocks/DeleteDialog";
import { Button } from "@/components/ui/button";
import { usePricePlanPortalStore } from "@/stores/pricePlanPortal.store";
import { DetailDialog } from "./blocks/DetailPricePlan";
// import { VersionDialog, VersionFormData } from "./VersionDialog";

const API_URL = apiConfig.service_price_plan;

const NavbarMenu = () => {
  const { pathname, state } = useLocation();
  const { auth } = useAuthContext();

  const navigate = useNavigate();
  const { getMenuConfig } = useMenus();
  const { GetData } = useCallApi();
  const primaryMenu = getMenuConfig("primary");
  const { isRTL } = useLanguage();
  const { dataPricePlan, dataPricePlanDetail } = state || {};
  const { setIsLoading } = usePortalLayout();
  const initialOfferVerId = state?.selectedOfferVerId ?? null;
  const { handleDetailDialog, showDetailDialog } = useNavbarMenuContext();
  const { clearLastPortal } = usePricePlanPortalStore();

  const [locationFrom, setLocationFrom] = useState<string | null>(null);
  const [pricePlanData, setPricePlanData] = useState<any>({});
  const [selectedOfferVerId, setSelectedOfferVerId] = useState<number | null>(initialOfferVerId);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [dialogLoading, setDialogLoading] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  let navbarMenu;

  const menu = [
    {
      title: "Usage Price",
      path: "/main/price-plan/portal/usage-price",
    },
    {
      title: "Recurring Price",
      path: "/main/price-plan/portal/recurring-price",
    },
    {
      title: "Subscription Price",
      path: "/main/price-plan/portal/subscription-price",
    },
    {
      title: "Discount",
      path: "/main/price-plan/portal/discount",
    },
    {
      title: "Trigger",
      path: "/main/price-plan/portal/trigger",
    },
  ];

  const fetchPricePlanDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await GetData(`${API_URL}/priceplan/detail`, {
        offerId: dataPricePlan?.pricePlanId,
        applyLevel: dataPricePlan?.applyLevel,
      });

      setPricePlanData(response?.data || []);

      if (response?.data?.offerVerList && response.data.offerVerList.length > 0) {
        // Hanya set default jika selectedOfferVerId belum ada
        if (initialOfferVerId === null) {
          const newest = response.data.offerVerList[0].offerVerId;
          setSelectedOfferVerId(newest);
        }
      }
    } catch (error) {
      console.error(`Error fetching price plan detail ${dataPricePlan?.offerId} - ${dataPricePlan?.applyLevel} (${error})`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // set state ketika render pertama kali untuk menghindari reset state.from
    setLocationFrom(state?.from);
  }, []);

  // useEffect dengan useCallback
  useEffect(() => {
    if (dataPricePlan) {
      // Hanya fetch kalau detail belum ada, biar nggak loop
      if (!dataPricePlanDetail || (typeof dataPricePlanDetail === "object" && Object.keys(dataPricePlanDetail).length === 0)) {
        fetchPricePlanDetail();
      }
    } else {
      // Navigasi hanya kalau belum di default route
      if ((pathname.includes("price-plan") || pathname.includes("offer")) && pathname !== "/main/price-plan/default") {
        navigate("/main/price-plan/default");
      }
    }
  }, [dataPricePlan, dataPricePlanDetail, pathname, navigate]);

  const mapMenuData = (data: RoleList[]): MappedMenu[] => {
    return data.map((item) => {
      const mappedItem: MappedMenu = {
        title: item.pricePlanTypeName,
        path: item.link !== "-" ? item.link : "/",
      };

      if (item.children && item.children.length > 0) {
        mappedItem.children = mapMenuData(item.children);
      }

      return mappedItem;
    });
  };

  navbarMenu = menu;

  const handleOfferVerIdSelect = (offerVerId: number) => {
    navigate(pathname, {
      state: {
        dataPricePlan,
        dataPricePlanDetail: pricePlanData,
        selectedOfferVerId: offerVerId,
      },
      replace: true,
    });

    setSelectedOfferVerId(offerVerId); // local state tetap update agar langsung terlihat aktif
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (selectedOfferVerId) {
      navigate(pathname, {
        state: {
          dataPricePlan,
          dataPricePlanDetail: pricePlanData,
          selectedOfferVerId: selectedOfferVerId,
        },
        // replace: true,
      });
    }
  }, [selectedOfferVerId]);

  // Handler functions for Edit and Create buttons
  const handleEditVersion = () => {
    if (!selectedOfferVerId) return;
    setShowEditDialog(true);
  };

  const handleDeleteVersion = () => {
    if (!selectedOfferVerId) return;
    setShowDeleteDialog(true);
  };

  const handleCreateVersion = () => {
    setShowCreateDialog(true);
  };

  const handleCreateSubmit = () => {
    // Refresh data setelah dialog selesai
    fetchPricePlanDetail();
    setShowCreateDialog(false);
  };

  const handleEditSubmit = () => {
    // Refresh data setelah dialog selesai
    fetchPricePlanDetail();
    setShowEditDialog(false);
  };

  const getEditInitialData = (): VersionFormData | undefined => {
    if (!selectedOfferVerId || !pricePlanData?.offerVerList) return undefined;

    const selectedOffer = pricePlanData.offerVerList.find((offer: any) => offer.offerVerId === selectedOfferVerId);

    return selectedOffer
      ? {
          offerVerId: selectedOffer.offerVerId,
          effDate: selectedOffer.effDate,
          expDate: selectedOffer.expDate,
          sourceFrom: "1", // ← TAMBAH field baru
          oldPricePlanId: null,
          prefix: null,
          postfix: null,
          isCopyOfferAttr: "N",
        }
      : undefined;
  };

  const buildMenu = (items: TMenuConfig) => {
    return items.map((item, index) => {
      if (item.children) {
        return (
          <MenuItem
            key={index}
            className="border-b-2 border-b-transparent menu-item-active:border-b-gray-900 menu-item-here:border-b-gray-900"
            trigger="hover"
            toggle="dropdown"
            dropdownProps={{
              placement: isRTL() ? "bottom-end" : "bottom-start",
            }}
          >
            <MenuLink className="gap-1.5 pb-2 lg:pb-4">
              <MenuTitle className="text-sm text-gray-800 text-nowrap menu-item-active:text-gray-900 menu-item-active:font-medium menu-item-here:text-gray-900 menu-item-here:font-medium menu-item-show:text-gray-900 menu-link-hover:text-gray-900">
                {item.title}
              </MenuTitle>
              <MenuArrow>
                <KeenIcon icon="down" className="text-gray-500 text-2xs" />
              </MenuArrow>
            </MenuLink>
            <MenuSub className="py-2 menu-default" rootClassName="min-w-[200px]">
              {buildMenuChildren(item.children)}
            </MenuSub>
          </MenuItem>
        );
      } else if (!item.disabled) {
        return (
          <MenuItem key={index} className="border-b-2 border-b-transparent menu-item-active:border-b-gray-900 menu-item-here:border-b-gray-900">
            <MenuLink
              linkState={{
                dataPricePlan: dataPricePlan,
                dataPricePlanDetail: pricePlanData,
                selectedOfferVerId: selectedOfferVerId, // Pass selected offerVerId to next page
              }}
              path={item.path}
              className="gap-2.5 pb-2 lg:pb-4"
            >
              <MenuTitle className="text-sm text-gray-800 text-nowrap menu-item-active:text-gray-900 menu-item-active:font-medium menu-item-here:text-gray-900 menu-item-here:font-medium menu-item-show:text-gray-900 menu-link-hover:text-gray-900">
                {item.title}
              </MenuTitle>
            </MenuLink>
          </MenuItem>
        );
      }
    });
  };

  // console.log("selectedOfferVerId:", selectedOfferVerId);

  const buildMenuChildren = (items: TMenuConfig) => {
    return items.map((item, index) => {
      if (item.children) {
        return (
          <MenuItem
            key={index}
            trigger="hover"
            toggle="dropdown"
            dropdownProps={{
              placement: isRTL() ? "left-start" : "right-start",
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [-10, 0],
                  },
                },
              ],
            }}
          >
            <MenuLink>
              <MenuTitle>{item.title}</MenuTitle>
              <MenuArrow>
                <KeenIcon icon="down" className="text-2xs [.menu-dropdown_&]:-rotate-90" />
              </MenuArrow>
            </MenuLink>
            <MenuSub className="menu-default" rootClassName="min-w-[200px]">
              {buildMenuChildren(item.children)}
            </MenuSub>
          </MenuItem>
        );
      } else if (!item.disabled) {
        return (
          <MenuItem key={index}>
            <MenuLink path={item.path}>
              <MenuTitle>{item.title}</MenuTitle>
            </MenuLink>
          </MenuItem>
        );
      }
    });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between w-full mt-1 mb-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => {
              /**
               * Tombol Back = user secara eksplisit meninggalkan Portal.
               * Clear portal bookmark agar tab Price Plan menampilkan
               * list (bukan Portal) saat diklik berikutnya.
               */
              clearLastPortal();
              if (locationFrom === "offer") {
                navigate("/main/offer/price-plan", {
                  state: state.offerPageState,
                });
              } else {
                navigate(-1);
              }
            }}
            title="Go back"
            className="flex h-9 w-12 items-center justify-center rounded-md bg-red-500 shadow-md transition-all duration-200 hover:bg-red-600"
          >
            <KeenIcon icon="arrow-left" className="text-lg text-white" />
          </Button>
          <h1 className="text-xl font-semibold">{dataPricePlan?.pricePlanName}</h1>

          {/* Version Controls Section */}
          {pricePlanData && pricePlanData.offerVerList && (
            <div className="flex items-center gap-2">
              {/* Dropdown for OfferVerId Selection */}
              <div className="relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 px-3 py-1 text-sm border border-red-200 rounded bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-500">
                  <span className="text-red-600">Version {selectedOfferVerId || pricePlanData.offerVerList[0]?.offerVerId}</span>
                  <KeenIcon icon="down" className={`text-xs text-red-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 z-50 w-64 mt-1 bg-white border border-gray-200 rounded-md shadow-lg top-full">
                    <div className="py-1">
                      {pricePlanData.offerVerList.map((offer: any, index: number) => {
                        const isActive = selectedOfferVerId === offer.offerVerId;

                        return (
                          <button
                            key={offer.offerVerId}
                            onClick={() => handleOfferVerIdSelect(offer.offerVerId)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex flex-col ${isActive ? "bg-red-50 text-red-600" : "text-gray-700"}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Version {offer.offerVerId}</span>
                              {index === 0 && <span className="text-xs font-medium text-green-600">(Newest)</span>}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {offer.effDate} {offer.expDate ? `- ${offer.expDate}` : ""}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {/* Create Button */}
              <button
                onClick={handleCreateVersion}
                className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 border border-green-200 rounded bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                title="Create new version"
              >
                <KeenIcon icon="plus" className="text-xs" />
                <span>Create</span>
              </button>

              {/* Edit Button */}
              <button
                onClick={handleEditVersion}
                disabled={!selectedOfferVerId}
                className="flex items-center gap-1 px-3 py-1 text-sm text-orange-600 border border-orange-200 rounded bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit selected version"
              >
                <KeenIcon icon="edit" className="text-xs" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDeleteVersion}
                disabled={!selectedOfferVerId}
                className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 border border-red-200 rounded bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete selected version"
              >
                <KeenIcon icon="trash" className="text-xs" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        <button
          className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
          onClick={() => {
            // console.log("Detail button clicked, opening dialog...");
            handleDetailDialog(true);
          }}
        >
          Price Plan Detail
        </button>
      </div>

      <div className="grid">
        <div className="scrollable-x-auto">
          <Menu highlight={true} className="gap-5 lg:gap-7.5">
            {navbarMenu && navbarMenu && buildMenu(navbarMenu)}
          </Menu>
        </div>
      </div>

      {/* Create Version Dialog */}
      <VersionDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateSubmit}
        mode="create"
        isLoading={dialogLoading}
        offerId={dataPricePlan?.pricePlanId} // ← TAMBAH INI
      />

      {/* Edit Version Dialog */}
      <VersionDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSubmit={handleEditSubmit}
        mode="edit"
        initialData={getEditInitialData()}
        isLoading={dialogLoading}
        offerId={dataPricePlan?.pricePlanId} // ← TAMBAH INI
      />
      <DeleteDialog
        show={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        offerId={dataPricePlan?.pricePlanId}
        selectedOfferVerId={selectedOfferVerId}
        setSelectedOfferVerId={setSelectedOfferVerId}
        onDeleteSuccess={() => {
          // Refresh the price plan data after successful deletion
          fetchPricePlanDetail();
          // Reset selected version if it was deleted
          setSelectedOfferVerId(null);
        }}
      />

      <DetailDialog />
    </div>
  );
};

export { NavbarMenu };

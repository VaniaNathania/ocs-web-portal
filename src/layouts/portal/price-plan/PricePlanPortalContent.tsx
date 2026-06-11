import { lazy, Suspense, useState, useCallback } from "react";
import { PortalDataProvider, PortalSubPage, usePortalData } from "./hooks/PortalDataContext";
import { KeenIcon } from "@/components/keenicons";
import { Button } from "@/components/ui/button";
import { ScreenLoader } from "@/components";
import { VersionDialog, VersionFormData } from "./navbar/blocks/VersionDialog";
import { DeleteDialog } from "./navbar/blocks/DeleteDialog";
import { useNavbarMenuContext } from "./navbar/useNavbarContext";
import { DetailDialog } from "./navbar/blocks/DetailPricePlan";
import { NavbarMenuContextProvider } from "./navbar/NavbarContext";

/**
 * PricePlanPortalContent
 *
 * Wrapper Portal yang berjalan sepenuhnya berbasis state — tanpa React Router.
 * Sub-page (Usage Price, Recurring Price, dll) dipilih via useState,
 * persis seperti pola PricePlanTabs.
 *
 * Tidak ada navigate(), tidak ada MenuLink, tidak ada URL yang berubah.
 */

// Lazy load sub-pages
// const UsagePriceCreatePage = lazy(() => import("@/pages/main-menu/price-plan/portal/usage-price/UsagePriceCreatePage"));
// const RecurringPriceCreatePage = lazy(() => import("@/pages/main-menu/price-plan/portal/recurring-price/RecurringPriceCreatePage"));
// const DiscountPriceCreatePage = lazy(() => import("@/pages/main-menu/price-plan/portal/discount/DiscountPriceCreatePage"));
// const TriggerCreatePage = lazy(() => import("@/pages/main-menu/price-plan/portal/trigger/TriggerCreatePage"));
const SubscriptionCreatePage = lazy(() => import("@/pages/main-menu/price-plan/portal/subscription-price/SubscriptionCreatePage"));

const SUB_PAGES: { id: PortalSubPage; title: string }[] = [
  // { id: "usage-price", title: "Usage Price" },
  // { id: "recurring-price", title: "Recurring Price" },
  { id: "subscription-price", title: "Subscription Price" },
  // { id: "discount", title: "Discount" },
  // { id: "trigger", title: "Trigger" },
];

/** Render sub-page yang aktif */
const ActiveSubPage = () => {
  const { activePage, dataPricePlan, selectedOfferVerId } = usePortalData();

  // key prop berisi offerVerId agar komponen re-mount saat version ganti
  const key = `${activePage}-${selectedOfferVerId ?? "none"}-${dataPricePlan?.pricePlanId}`;

  return (
    <Suspense fallback={<ScreenLoader />}>
      <div key={key} className="flex-1 p-6">
        {activePage === "subscription-price" && <SubscriptionCreatePage />}
      </div>
    </Suspense>
  );
};

/** Navbar internal Portal — tombol, bukan MenuLink */
const PortalNavbar = () => {
  const { dataPricePlan, dataPricePlanDetail, selectedOfferVerId, setSelectedOfferVerId, activePage, setActivePage, refreshDetail, isDetailLoading, onBack } = usePortalData();

  const { handleDetailDialog, setPricePlanData } = useNavbarMenuContext();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const offerVerList = dataPricePlanDetail?.offerVerList ?? [];

  const getEditInitialData = (): VersionFormData | undefined => {
    if (!selectedOfferVerId || !offerVerList.length) return undefined;
    const selected = offerVerList.find((o: any) => o.offerVerId === selectedOfferVerId);
    return selected
      ? {
          offerVerId: selected.offerVerId,
          effDate: selected.effDate,
          expDate: selected.expDate,
          sourceFrom: "1",
          oldPricePlanId: null,
          prefix: null,
          postfix: null,
          isCopyOfferAttr: "N",
        }
      : undefined;
  };

  return (
    <div className="w-full">
      {/* Top bar: Back + Name + Version Controls */}
      <div className="flex items-center justify-between w-full mt-1 mb-4">
        <div className="flex items-center gap-4">
          {/* Back button */}
          <Button onClick={onBack} title="Go back" className="flex h-9 w-12 items-center justify-center rounded-md bg-red-500 shadow-md transition-all duration-200 hover:bg-red-600">
            <KeenIcon icon="arrow-left" className="text-lg text-white" />
          </Button>

          <h1 className="text-xl font-semibold">{dataPricePlan?.pricePlanName}</h1>

          {/* Version controls */}
          {offerVerList.length > 0 && (
            <div className="flex items-center gap-2">
              {/* Version dropdown */}
              <div className="relative">
                <button onClick={() => setIsDropdownOpen((p) => !p)} className="flex items-center gap-2 px-3 py-1 text-sm border border-red-200 rounded bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-500">
                  <span className="text-red-600">Version {selectedOfferVerId ?? offerVerList[0]?.offerVerId}</span>
                  <KeenIcon icon="down" className={`text-xs text-red-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 z-50 w-64 mt-1 bg-white border border-gray-200 rounded-md shadow-lg top-full">
                    <div className="py-1">
                      {offerVerList.map((offer: any, idx: number) => {
                        const isActive = selectedOfferVerId === offer.offerVerId;
                        return (
                          <button
                            key={offer.offerVerId}
                            onClick={() => {
                              setSelectedOfferVerId(offer.offerVerId);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex flex-col ${isActive ? "bg-red-50 text-red-600" : "text-gray-700"}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Version {offer.offerVerId}</span>
                              {idx === 0 && <span className="text-xs font-medium text-green-600">(Newest)</span>}
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

              {/* Create version */}
              <button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 border border-green-200 rounded bg-green-50 hover:bg-green-100">
                <KeenIcon icon="plus" className="text-xs" />
                <span>Create</span>
              </button>

              {/* Edit version */}
              <button
                onClick={() => setShowEditDialog(true)}
                disabled={!selectedOfferVerId}
                className="flex items-center gap-1 px-3 py-1 text-sm text-orange-600 border border-orange-200 rounded bg-orange-50 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <KeenIcon icon="edit" className="text-xs" />
                <span>Edit</span>
              </button>

              {/* Delete version */}
              <button
                onClick={() => setShowDeleteDialog(true)}
                disabled={!selectedOfferVerId}
                className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 border border-red-200 rounded bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
            console.log("Detail button clicked, tai");
            // setPricePlanData(dataPricePlanDetail);
            handleDetailDialog(true);
          }}
        >
          Price Plan Detail
        </button>
      </div>

      {/* Sub-page tab navigation */}
      <div className="grid">
        <div className="scrollable-x-auto">
          <div className="flex items-center gap-5 lg:gap-7.5">
            {SUB_PAGES.map((page) => {
              const isActive = activePage === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => setActivePage(page.id)}
                  className={`pb-2 lg:pb-4 text-sm text-nowrap border-b-2 transition-colors ${isActive ? "border-gray-900 text-gray-900 font-medium" : "border-transparent text-gray-800 hover:text-gray-900"}`}
                >
                  {page.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <VersionDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={() => {
          refreshDetail();
          setShowCreateDialog(false);
        }}
        mode="create"
        isLoading={false}
        offerId={dataPricePlan?.pricePlanId}
      />
      <VersionDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSubmit={() => {
          refreshDetail();
          setShowEditDialog(false);
        }}
        mode="edit"
        initialData={getEditInitialData()}
        isLoading={false}
        offerId={dataPricePlan?.pricePlanId}
      />
      <DeleteDialog
        show={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        offerId={dataPricePlan?.pricePlanId}
        selectedOfferVerId={selectedOfferVerId}
        setSelectedOfferVerId={setSelectedOfferVerId as any}
        onDeleteSuccess={() => {
          refreshDetail();
          setSelectedOfferVerId(null);
        }}
      />

      <DetailDialog />
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Public export — ini yang dirender sebagai "tab" di MultiTab
// ─────────────────────────────────────────────────────────

interface PricePlanPortalContentProps {
  dataPricePlan: any;
  initialOfferVerId?: number | null;
  onBack: () => void;
}

const PricePlanPortalContent = ({ dataPricePlan, initialOfferVerId, onBack }: PricePlanPortalContentProps) => {
  return (
    
    <PortalDataProvider dataPricePlan={dataPricePlan} initialOfferVerId={initialOfferVerId} onBack={onBack}>
      <NavbarMenuContextProvider>
      <div className="flex flex-col w-full h-full">
        <div className="px-6 pt-4">
          <PortalNavbar />
        </div>
        <ActiveSubPage />
      </div>
    </NavbarMenuContextProvider>
    </PortalDataProvider>
  );
};

export default PricePlanPortalContent;

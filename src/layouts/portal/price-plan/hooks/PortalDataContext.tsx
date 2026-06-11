import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";

/**
 * PortalDataContext
 *
 * Menggantikan useLocation().state sebagai sumber data utama Portal.
 * Semua sub-page (Usage Price, Recurring Price, dll) membaca dari sini
 * alih-alih dari React Router location.state.
 *
 * Ini memungkinkan Portal berjalan sepenuhnya berbasis state (tanpa route),
 * persis seperti pola PricePlanTabs yang menggunakan useState + render langsung.
 */

const API_URL = apiConfig.service_price_plan;

export type PortalSubPage =
  | "usage-price"
  | "recurring-price"
  | "subscription-price"
  | "discount"
  | "trigger";

interface PortalDataContextType {
  /** Data baris price plan yang diklik dari list */
  dataPricePlan: any | null;

  /** Detail price plan dari API /priceplan/detail (berisi offerVerList) */
  dataPricePlanDetail: any | null;

  /** offerVerId yang sedang aktif/dipilih di version selector */
  selectedOfferVerId: number | null;

  /** Set version yang aktif */
  setSelectedOfferVerId: (id: number | null) => void;

  /** Sub-page yang aktif (Usage Price, Recurring Price, dll) */
  activePage: PortalSubPage;

  /** Ganti sub-page aktif */
  setActivePage: (page: PortalSubPage) => void;

  /** Trigger fetch ulang detail */
  refreshDetail: () => void;

  /** Loading state untuk detail fetch */
  isDetailLoading: boolean;

  /** Callback saat user tekan Back — untuk kembali ke Price Plan list */
  onBack: () => void;
}

const PortalDataContext = createContext<PortalDataContextType | undefined>(undefined);

interface PortalDataProviderProps {
  dataPricePlan: any;
  initialOfferVerId?: number | null;
  onBack: () => void;
  children: React.ReactNode;
}

export const PortalDataProvider = ({
  dataPricePlan,
  initialOfferVerId = null,
  onBack,
  children,
}: PortalDataProviderProps) => {
  const { GetData } = useCallApi();

  const [activePage, setActivePage] = useState<PortalSubPage>("subscription-price");
  const [dataPricePlanDetail, setDataPricePlanDetail] = useState<any | null>(null);
  const [selectedOfferVerId, setSelectedOfferVerId] = useState<number | null>(
    initialOfferVerId,
  );
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!dataPricePlan?.pricePlanId) return;
    setIsDetailLoading(true);
    try {
      const response = await GetData(`${API_URL}/priceplan/detail`, {
        offerId: dataPricePlan.pricePlanId,
        applyLevel: dataPricePlan.applyLevel,
      });

      const detail = response?.data || null;
      setDataPricePlanDetail(detail);

      // Set offerVerId default ke yang terbaru jika belum ada
      if (!selectedOfferVerId && detail?.offerVerList?.length > 0) {
        setSelectedOfferVerId(detail.offerVerList[0].offerVerId);
      }
    } catch (err) {
      console.error("Failed to fetch price plan detail:", err);
    } finally {
      setIsDetailLoading(false);
    }
  }, [dataPricePlan?.pricePlanId, dataPricePlan?.applyLevel]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return (
    <PortalDataContext.Provider
      value={{
        dataPricePlan,
        dataPricePlanDetail,
        selectedOfferVerId,
        setSelectedOfferVerId,
        activePage,
        setActivePage,
        refreshDetail: fetchDetail,
        isDetailLoading,
        onBack,
      }}
    >
      {children}
    </PortalDataContext.Provider>
  );
};

export const usePortalData = (): PortalDataContextType => {
  const ctx = useContext(PortalDataContext);
  if (!ctx) throw new Error("usePortalData must be used inside <PortalDataProvider>");
  return ctx;
};

import { create } from "zustand";

/**
 * Store untuk menyimpan state Portal Price Plan.
 *
 * Dua kegunaan utama:
 * 1. dataPricePlan — data baris yang diklik dari tabel Price Plan
 * 2. lastPortalPath + lastPortalState — "bookmark" terakhir di Portal,
 *    sehingga saat user balik ke tab Price Plan setelah pindah ke tab lain,
 *    mereka dikembalikan ke Portal yang sama (bukan ke Price Plan list).
 *    Ini di-clear saat user menekan tombol Back di dalam Portal.
 */
interface PricePlanPortalState {
  /** Data baris price plan yang sedang dilihat di Portal */
  dataPricePlan: any | null;

  /** Path Portal terakhir yang aktif (e.g. "/main/price-plan/portal/usage-price") */
  lastPortalPath: string | null;

  /** location.state Portal terakhir (dataPricePlan, dataPricePlanDetail, selectedOfferVerId) */
  lastPortalState: any | null;

  setDataPricePlan: (data: any) => void;
  clearDataPricePlan: () => void;

  setLastPortal: (path: string, state: any) => void;
  clearLastPortal: () => void;
}

export const usePricePlanPortalStore = create<PricePlanPortalState>((set) => ({
  dataPricePlan: null,
  lastPortalPath: null,
  lastPortalState: null,

  setDataPricePlan: (data) => set({ dataPricePlan: data }),
  clearDataPricePlan: () => set({ dataPricePlan: null }),

  setLastPortal: (path, state) =>
    set({ lastPortalPath: path, lastPortalState: state }),

  clearLastPortal: () => set({ lastPortalPath: null, lastPortalState: null }),
}));


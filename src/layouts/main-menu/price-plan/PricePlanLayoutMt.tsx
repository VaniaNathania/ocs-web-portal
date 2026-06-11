import useBodyClasses from "@/hooks/useBodyClasses";
import { PricePlanLayoutProvider } from ".";
import { MainMt } from "./main/MainMt";
import { lazy, Suspense } from "react";
import { usePricePlanPortalStore } from "@/stores/pricePlanPortal.store";
import { ScreenLoader } from "@/components";

const PricePlanPortalContent = lazy(
  () => import("@/layouts/portal/price-plan/PricePlanPortalContent"),
);

const PricePlanLayout = () => {
  useBodyClasses(`
    [--tw-page-bg:var(--tw-light)]
    [--tw-page-bg-dark:var(--tw-coal-500)]
    [--tw-header-height-default:100px]
    [[data-sticky-header=on]&]:[--tw-header-height:60px]
    [--tw-header-height:--tw-header-height-default]	
    bg-[--tw-page-bg]
    dark:bg-[--tw-page-bg-dark]
  `);

  const { dataPricePlan, clearDataPricePlan, clearLastPortal } =
    usePricePlanPortalStore();

  if (dataPricePlan) {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <PricePlanPortalContent
          dataPricePlan={dataPricePlan}
          onBack={() => {
            clearDataPricePlan();
            clearLastPortal();
          }}
        />
      </Suspense>
    );
  }

  return (
    <PricePlanLayoutProvider>
      <MainMt />
    </PricePlanLayoutProvider>
  );
};

export { PricePlanLayout };
export default PricePlanLayout;


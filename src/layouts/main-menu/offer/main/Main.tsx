import { lazy, Suspense } from "react";
import { Navbar, useOfferLayout } from "../";
import { ScreenLoader } from "@/components";

const MainProductOfferListPage = lazy(
  () => import("@/pages/main-menu/offer/main-product/MainProductOfferListPage"),
);
const RelatedProductOfferListPage = lazy(
  () =>
    import(
      "@/pages/main-menu/offer/related-product/RelatedProductOfferListPage"
    ),
);
const SubscriptionPlanOfferListPage = lazy(
  () =>
    import(
      "@/pages/main-menu/offer/subscription-plan/SubscriptionPlanOfferListPage"
    ),
);

const PricePlanListPage = lazy(
  () => import("@/pages/main-menu/offer/price-plan/PricePlanListPage"),
);

const Main = () => {
  const { activeTab, hideOfferNavbar } = useOfferLayout();

  return (
    <main className="grow" role="content">
      {!hideOfferNavbar && <Navbar />}
      {/* <Toolbar>
            <ToolbarHeading />
          </Toolbar> */}
      <Suspense fallback={<ScreenLoader />}>
        {activeTab === "main" && <MainProductOfferListPage />}
        {activeTab === "related" && <RelatedProductOfferListPage />}
        {activeTab === "priceplan" && <PricePlanListPage />}
        {activeTab === "subs" && <SubscriptionPlanOfferListPage />}
      </Suspense>
    </main>
  );
};

export { Main };

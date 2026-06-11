// import { Suspense, lazy, useMemo } from "react";
// import { createMemoryRouter, RouterProvider, Navigate } from "react-router-dom";
// import { ScreenLoader } from "@/components";
// import { usePricePlanPortalStore } from "@/stores/pricePlanPortal.store";

// /**
//  * PricePlanPortalTabWrapper
//  *
//  * Tujuan: Merender seluruh Portal Price Plan di dalam MultiTab
//  * tanpa bentrok dengan BrowserRouter utama aplikasi.
//  *
//  * Solusi: Gunakan createMemoryRouter + RouterProvider (bukan MemoryRouter).
//  * RouterProvider adalah isolated router instance yang TIDAK dianggap
//  * "nested Router" oleh React Router v6 — berbeda dengan MemoryRouter.
//  *
//  * Data Flow:
//  *  - dataPricePlan diambil dari usePricePlanPortalStore (Zustand)
//  *  - Data di-inject sebagai location.state ke initialEntries router
//  *  - Semua komponen Portal yang pakai useLocation().state tetap berjalan
//  *    tanpa perlu diubah sama sekali
//  */

// const PortalLayout = lazy(
//   () => import("@/layouts/portal/price-plan/PortalLayout"),
// );
// const UsagePriceCreatePage = lazy(
//   () =>
//     import(
//       "@/pages/main-menu/price-plan/portal/usage-price/UsagePriceCreatePage"
//     ),
// );
// const RecurringPriceCreatePage = lazy(
//   () =>
//     import(
//       "@/pages/main-menu/price-plan/portal/recurring-price/RecurringPriceCreatePage"
//     ),
// );
// const DiscountPriceCreatePage = lazy(
//   () =>
//     import(
//       "@/pages/main-menu/price-plan/portal/discount/DiscountPriceCreatePage"
//     ),
// );
// const TriggerCreatePage = lazy(
//   () =>
//     import("@/pages/main-menu/price-plan/portal/trigger/TriggerCreatePage"),
// );
// const SubscriptionCreatePage = lazy(
//   () =>
//     import(
//       "@/pages/main-menu/price-plan/portal/subscription-price/SubscriptionCreatePage"
//     ),
// );

// const PricePlanPortalTabWrapper = () => {
//   const { dataPricePlan } = usePricePlanPortalStore();

//   /**
//    * createMemoryRouter: membuat router instance baru yang berdiri sendiri
//    * di memori. Tidak bentrok dengan BrowserRouter karena tidak menggunakan
//    * komponen <Router> — melainkan RouterProvider yang merupakan API terpisah.
//    *
//    * dataPricePlan di-inject ke state entry pertama agar semua komponen
//    * yang memanggil useLocation().state mendapatkan data yang benar.
//    *
//    * useMemo agar router tidak di-recreate setiap render ulang komponen ini.
//    * Router hanya perlu dibuat ulang saat dataPricePlan berubah (dihandle
//    * oleh openPricePlanPortal yang unmount + remount komponen ini).
//    */
//   const router = useMemo(
//     () =>
//       createMemoryRouter(
//         [
//           {
//             element: <PortalLayout />,
//             children: [
//               {
//                 path: "/main/price-plan/portal/usage-price",
//                 element: <UsagePriceCreatePage />,
//               },
//               {
//                 path: "/main/price-plan/portal/recurring-price",
//                 element: <RecurringPriceCreatePage />,
//               },
//               {
//                 path: "/main/price-plan/portal/subscription-price",
//                 element: <SubscriptionCreatePage />,
//               },
//               {
//                 path: "/main/price-plan/portal/discount",
//                 element: <DiscountPriceCreatePage />,
//               },
//               {
//                 path: "/main/price-plan/portal/trigger",
//                 element: <TriggerCreatePage />,
//               },
//               {
//                 path: "*",
//                 element: (
//                   <Navigate to="/main/price-plan/portal/usage-price" replace />
//                 ),
//               },
//             ],
//           },
//         ],
//         {
//           initialEntries: [
//             {
//               pathname: "/main/price-plan/portal/usage-price",
//               state: { dataPricePlan },
//             },
//           ],
//           initialIndex: 0,
//         },
//       ),
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [], // Sengaja kosong — router dibuat sekali saat mount. Re-mount dihandle oleh openPricePlanPortal.
//   );

//   return (
//     <Suspense fallback={<ScreenLoader />}>
//       <RouterProvider router={router} />
//     </Suspense>
//   );
// };

// export default PricePlanPortalTabWrapper;


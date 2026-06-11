import { ReactElement, Suspense, lazy, ComponentType } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";

// layouts & utilities (tetap normal import, karena dipakai global)
import { RequireAuth } from "@/auth/RequireAuth";
import { useRoleCheck } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { ScreenLoader } from "@/components/loaders/ScreenLoader";
export const lazyMinLoadTime = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  minLoadTimeMs = 1000,
) =>
  lazy(() =>
    Promise.all([
      factory(),
      new Promise((resolve) => setTimeout(resolve, minLoadTimeMs)),
    ]).then(([moduleExports]) => moduleExports),
  );

// TCEL Balance
const TcelBalanceAdjustment = lazyMinLoadTime(
  () =>
    import("@/pages/main-menu/tcel-balance-management/TcelBalanceAdjustment"),
);

const MultiTab = lazyMinLoadTime(() => import("@/layouts/multiTab/MultiTab"));

// Data Reference
const ZonePageMain = lazyMinLoadTime(
  () => import("@/pages/main-menu/data-reference/zone/ZonePage"),
);

const Demo2Layout = lazyMinLoadTime(
  () => import("@/layouts/demo2/Demo2Layout"),
);

const TcelBalanceAdjustmentLayout = lazyMinLoadTime(
  () =>
    import(
      "@/layouts/main-menu/tcel-balance-adjustment/TcelBalanceAdjustmentLayout"
    ),
);

const PortalLayout = lazyMinLoadTime(
  () => import("@/layouts/portal/price-plan/PortalLayout"),
);


// lazy imports untuk semua pages
const AccountUserProfilePage = lazy(
  () => import("@/pages/account/home/user-profile/AccountUserProfilePage"),
);
const AuthPage = lazy(() => import("@/auth/AuthPage"));
const ErrorsRouting = lazy(() => import("@/errors/ErrorsRouting"));

const DashboardHomePage = lazy(
  () => import("@/pages/dashboards/home/DashboardHomePage"),
);
const ConfigUserPage = lazy(
  () => import("@/pages/configuration/user/user/ConfigUserPage"),
);
const LogActivityPage = lazy(
  () => import("@/pages/configuration/user/log-activity/LogActivityPage"),
);
const ManagePositionPage = lazy(
  () => import("@/pages/configuration/user/manage-position/ManagePositionPage"),
);

// portal
const UsagePriceCreatePage = lazy(
  () =>
    import(
      "@/pages/main-menu/price-plan/portal/usage-price/UsagePriceCreatePage"
    ),
);
const RecurringPriceCreatePage = lazy(
  () =>
    import(
      "@/pages/main-menu/price-plan/portal/recurring-price/RecurringPriceCreatePage"
    ),
);

function FadeLoader({ show }: { show: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center
        bg-white/80 backdrop-blur-sm transition-opacity duration-300
        ${show ? "animate-fadeIn" : "animate-fadeOut"}`}
    >
      <ScreenLoader />
    </div>
  );
}

const AppRoutingSetup = (): ReactElement => {
  const { checkMenusPriv } = useRoleCheck();

  return (
    <Suspense fallback={<FadeLoader show={true} />}>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route
            element={
              // <Suspense fallback={<FadeLoader show={true} />}>
              <Demo2Layout />
              // </Suspense>
            }
          >
            <Route path="/dashboard" element={<DashboardHomePage />} />
            {/* <Route
              path="/account/home/user-profile"
              element={<AccountUserProfilePage />}
            /> */}
            <Route
              path="/configuration/user-management/manage-user"
              element={<ConfigUserPage />}
            />
            <Route
              path="/configuration/user-management/log-activity"
              element={<LogActivityPage />}
            />
            <Route
              path="/configuration/user-management/manage-position"
              element={<ManagePositionPage />}
            />
          </Route>

          <Route index element={<MultiTab />} />

          {checkMenusPriv("TECL Balance Adjustment", "readStatus") ? (
            <Route
              element={
                // <Suspense fallback={<FadeLoader show={true} />}>
                <TcelBalanceAdjustmentLayout />
                // </Suspense>
              }
              path="/tcel-balance-adjustment"
            >
              {/* <Route path="user" element={<SubscriberListPage />} />
              <Route path="order" element={<OrderOrderListPage />} /> */}
              <Route index element={<TcelBalanceAdjustment />} />
            </Route>
          ) : (
            <Route
              element={<Navigate to="/error/401" />}
              path="/tcel-balance-adjusment/*"
            />
          )}

          {/* Portal routes — tidak diperlukan lagi karena Portal
              sekarang di-render inline di dalam PricePlanLayoutMt via Zustand state.
              Route di bawah ini dipertahankan hanya untuk akses langsung via URL
              (misal dari module Offer). */}
          {checkMenusPriv("Price Plan", "readStatus") ? (
            <Route element={<PortalLayout />}>
              <Route
                path="/portal/usage-price/:offerId/:applyLevel"
                element={<UsagePriceCreatePage />}
              >
                <Route
                  path="recurring-price"
                  element={<RecurringPriceCreatePage />}
                />
                <Route
                  index
                  element={<Navigate to="recurring-price" replace />}
                />
              </Route>
            </Route>
          ) : (
            <Route element={<Navigate to="/error/401" />} path="/portal/*" />
          )}

          <Route
            element={
              // <Suspense fallback={<FadeLoader show={true} />}>
              <TcelBalanceAdjustmentLayout />
              // </Suspense>
            }
          >
            <Route
              path="/data-reference/zone-time"
              element={<ZonePageMain />}
            ></Route>
          </Route>
        </Route>

        {/* ini disini app route */}
        <Route path="error/*" element={<ErrorsRouting />} />
        <Route
          path="auth/*"
          element={
            <Suspense fallback={<ScreenLoader />}>
              <AuthPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/error/404" />} />
      </Routes>
    </Suspense>
  );
};

export { AppRoutingSetup };

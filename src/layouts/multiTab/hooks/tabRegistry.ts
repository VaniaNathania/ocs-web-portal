import { ComponentType, lazy, useState } from "react";
import { tabItem } from "../models/interfaces";

const lazyMinLoadTime = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  minLoadTimeMs = 1000,
) =>
  lazy(() =>
    Promise.all([
      factory(),
      new Promise((resolve) => setTimeout(resolve, minLoadTimeMs)),
    ]).then(([moduleExports]) => moduleExports),
  );

export const OrderLayout = lazyMinLoadTime(
  () => import("@/layouts/main-menu/order/OrderLayout"),
);

export const UserManagementMain = lazyMinLoadTime(
  () => import("@/layouts/main-menu/user-management/UserLayout"),
);

export const PricePlanLayout = lazyMinLoadTime(
  () => import("@/layouts/main-menu/price-plan/PricePlanLayoutMt"),
);

export const SimNumberBindUnbind = lazyMinLoadTime(
  () =>
    import(
      "@/pages/main-menu/cvbs-sim-number-binding-unbinding/SimNumberBindUnbindPage"
    ),
);

export const WholesaleMonitor = lazyMinLoadTime(
  () => import("@/pages/main-menu/wholesale-monitor/WholesaleMonitor"),
);

export const DirMenuLayout = lazyMinLoadTime(
  () => import("@/layouts/main-menu/directory-menu-management/DirMenuLayoutMt"),
);

export const DashboardHomePage = lazyMinLoadTime(
  () => import("@/pages/dashboards/home/DashboardMt"),
);

export const Payment = lazyMinLoadTime(
  () => import("@/pages/main-menu/payment/Payment"),
);

export const Role = lazyMinLoadTime(
  () => import("@/layouts/main-menu/role-management/RoleLayoutMt"),
);

export const AccountConfig = lazyMinLoadTime(
  () => import("@/layouts/main-menu/account-config/AccountConfigLayoutMt"),
);

export const LifeCycleType = lazyMinLoadTime(
  () => import("@/pages/main-menu/job-schedule/lifecycle/LifeCycle"),
);

export const PreNewConection = lazyMinLoadTime(
  () => import("@/pages/main-menu/preNewConnnection/PreNewConnection"),
);

export const PortalMLayout = lazyMinLoadTime(
  () => import("@/layouts/main-menu/portal-management/PortalLayout"),
);

export const TcelBalanceAdjustment = lazyMinLoadTime(
  () =>
    import("@/pages/main-menu/tcel-balance-management/TcelBalanceAdjustment"),
);

export const ZonePageMain = lazyMinLoadTime(
  () => import("@/pages/main-menu/data-reference/zone/ZonePage"),
);

export const AccmType = lazyMinLoadTime(
  () => import("@/pages/main-menu/data-reference/acm-type/AccmType"),
);

export const TimeSpanPage = lazyMinLoadTime(
  () => import("@/pages/main-menu/data-reference/timespan-detail/TimeSpanPage"),
);

export const RatableEventActionPage = lazyMinLoadTime(
  () =>
    import(
      "@/pages/main-menu/data-reference/ratable-event-action/RatableEventActionPage"
    ),
);

export const EventPageMain = lazyMinLoadTime(
  () => import("@/pages/main-menu/data-reference/event/EventPage"),
);

export const AdviceMonitorMain = lazyMinLoadTime(
  () =>
    import("@/pages/main-menu/data-reference/advice-monitor/AdviceMonitorPage"),
);

export const AdviceTypeMain = lazyMinLoadTime(
  () => import("@/pages/main-menu/data-reference/advice-type/AdviceTypePage"),
);

export const UploadSimCardPage = lazyMinLoadTime(
  () => import("@/pages/main-menu/upload-simcard/UploadSimCardPage"),
);

export const SimcardProfilePage = lazyMinLoadTime(
  () => import("@/pages/main-menu/simcard-profile/SimcardProfilePage"),
);

export const WorkFlowRule = lazyMinLoadTime(
  () =>
    import(
      "@/pages/main-menu/data-reference/workflow-rule-recurring-event/WorkFlowRule"
    ),
);

export const ChannelPage = lazyMinLoadTime(
  () => import("@/pages/main-menu/data-reference/channel/Channel"),
);

export const AllFeaturesPage = lazyMinLoadTime(
  () =>
    import(
      "@/pages/main-menu/data-reference/all-features/all-feature-content/AllFeaturesPage"
    ),
);

export const ReservationPageMain = lazyMinLoadTime(
  () =>
    import("@/pages/main-menu/data-reference/reservation-rule/ReservationPage"),
);

export const BillingWorkflow = lazyMinLoadTime(
  () =>
    import("@/pages/main-menu/data-reference/billing-workflow/BillingWorkflow"),
);

export const PreProcessing = lazyMinLoadTime(
  () =>
    import(
      "@/pages/main-menu/data-reference/billing-workflow/blocks/PreProcessing"
    ),
);

export const ChangeNumberProfile = lazyMinLoadTime(
  () =>
    import("@/pages/main-menu/change-number-profile/ChangeNumberProfilePage"),
);

export const LogManagementMain = lazyMinLoadTime(
  () => import("@/layouts/main-menu/log-management/LogManagementLayout"),
);

export const OfferLayout = lazyMinLoadTime(
  () => import("@/layouts/main-menu/offer/OfferLayout"),
);

export const AccountUserProfilePage = lazyMinLoadTime(
  () => import("@/pages/account/home/user-profile/AccountUserProfilePage"),
);

 export const allTabs = [ 
    {
      id: "home",
      title: "Home",
      component: DashboardHomePage,
      closable: false,
      path: "/dashboards/home/DashboardHomePage",
    },
    {
      id: "Profile",
      closable: true,
      component: AccountUserProfilePage,
      path: "/account/home/user-profile/AccountUserProfilePage",
      title: "Profile",
    },
    {
      id: "Offer",
      title: "Offer",
      component: OfferLayout,
      closable: false,
      path: "/main-menu/offer/OfferLayout",
    },
    {
      id: "Order",
      title: "Order",
      component: OrderLayout,
      closable: false,
      path: "/main-menu/order/OrderLayout",
    },
    {
      id: "Role",
      title: "Role Management",
      component: Role,
      closable: true,
      path: "/main-menu/role-management/RoleLayoutMt",
    },
    {
      id: "User",
      title: "User Management",
      component: UserManagementMain,
      closable: true,
      path: "/main-menu/user-management/UserLayout",
    },
    {
      id: "Log Management",
      title: "Log Management",
      component: LogManagementMain,
      closable: true,
      path: "/main-menu/log-management/LogManagementLayout",
    },
    {
      id: "CVBS SIM & Number Binding/Unbinding",
      title: "CVBS SIM & Number Binding/Unbinding",
      component: SimNumberBindUnbind,
      closable: true,
      path: "/main-menu/cvbs-sim-number-binding-unbinding/SimNumberBindUnbindPage",
    },
    {
      id: "Wholesale Monitor",
      title: "Wholesale Monitor",
      component: WholesaleMonitor,
      closable: true,
      path: "/main-menu/wholesale-monitor/WholesaleMonitor",
    },
    {
      id: "price plan",
      title: "Price Plan",
      component: PricePlanLayout,
      closable: true,
      path: "/main-menu/price-plan/PricePlanLayoutMt",
    },
    {
      id: "Account Config",
      title: "Account Config",
      component: AccountConfig,
      closable: true,
      path: "/main-menu/account-config/AccountConfigLayoutMt",
    },
    {
      id: "Directory Menu",
      title: "Directory Menu Management",
      component: DirMenuLayout,
      closable: true,
      path: "/main-menu/directory-menu-management/DirMenuLayoutMt",
    },

    {
      id: "payment",
      title: "Payment",
      component: Payment,
      closable: true,
      path: "/main-menu/payment/Payment",
    },
    {
      id: "upload sim card file",
      title: "Upload Sim Card File",
      component: UploadSimCardPage,
      closable: true,
      path: "/main-menu/upload-simcard/UploadSimCardPage",
    },
    {
      id: "sim card profile",
      title: "Sim Card Profile",
      component: SimcardProfilePage,
      closable: true,
      path: "/main-menu/simcard-profile/SimcardProfilePage",
    },
    {
      id: "lifeCycle Type",
      title: "LIfeCycle Type",
      component: LifeCycleType,
      closable: true,
      path: "/main-menu/job-schedule/lifecycle/LifeCycle",
    },
    {
      id: "PreNewConnection",
      title: "PreNewConnection",
      component: PreNewConection,
      closable: true,
      path: "/main-menu/preNewConnnection/PreNewConnection",
    },
    {
      id: "Portal Management",
      title: "Portal Management",
      component: PortalMLayout,
      closable: true,
      path: "/main-menu/portal-management/PortalLayout",
    },
    {
      id: "TCEL Balance Adjustment",
      title: "TCEL Balance Adjustment",
      component: TcelBalanceAdjustment,
      closable: true,
      path: "/main-menu/tcel-balance-management/TcelBalanceAdjustment",
    },
    {
      id: "zone",
      title: "Zone",
      component: ZonePageMain,
      closable: true,
      path: "/main-menu/data-reference/zone/ZonePage",
    },
    {
      id: "accm type",
      title: "Accm Type",
      component: AccmType,
      closable: true,
      path: "/main-menu/data-reference/acm-type/AccmType",
    },
    {
      id: "timespan detail",
      title: "TimeSpan Detail",
      component: TimeSpanPage,
      closable: true,
      path: "/main-menu/data-reference/timespan-detail/TimeSpanPage",
    },
    {
      id: "ratable event action",
      title: "Ratable Event Action",
      component: RatableEventActionPage,
      closable: true,
      path: "/main-menu/data-reference/ratable-event-action/RatableEventActionPage",
    },
    {
      id: "event",
      title: "Event",
      component: EventPageMain,
      closable: true,
      path: "/main-menu/data-reference/event/EventPage",
    },
    {
      id: "advice monitor",
      title: "Advice Monitor",
      component: AdviceMonitorMain,
      closable: true,
      path: "/main-menu/data-reference/advice-monitor/AdviceMonitorPage",
    },
    {
      id: "advice type",
      title: "Advice Type",
      component: AdviceTypeMain,
      closable: true,
      path: "/main-menu/data-reference/advice-type/AdviceTypePage",
    },
    {
      id: "workflow rule",
      title: "Workflow Rule",
      component: WorkFlowRule,
      closable: true,
      path: "/main-menu/data-reference/workflow-rule-recurring-event/WorkFlowRule",
    },
    {
      id: "channel",
      title: "Channel",
      component: ChannelPage,
      closable: true,
      path: "/main-menu/data-reference/channel/Channel",
    },
    {
      id: "all features",
      title: "All Features",
      component: AllFeaturesPage,
      closable: true,
      path: "/main-menu/data-reference/all-features/all-feature-content/AllFeaturesPage",
    },
    {
      id: "reservation",
      title: "Reservation",
      component: ReservationPageMain,
      closable: true,
      path: "/main-menu/data-reference/reservation-rule/ReservationPage",
    },
    {
      id: "billing workflow",
      title: "Billing Workflow",
      component: BillingWorkflow,
      closable: true,
      path: "/main-menu/data-reference/billing-workflow/BillingWorkflow",
    },
    {
      id: "pre processing",
      title: "Pre Processing",
      component: PreProcessing,
      closable: true,
      path: "/main-menu/data-reference/billing-workflow/blocks/PreProcessing",
    },
    {
      id: "Change Number Profile",
      title: "Change Number Profile",
      component: ChangeNumberProfile,
      closable: true,
      path: "/pages/main-menu/change-number-profile/ChangeNumberProfilePage",
    },
  ];
import { type TMenuConfig } from "@/components/menu";

export const PORTAL_MENU_SIDEBAR: TMenuConfig = [
  {
    title: "Usage Price",
    path: "/portal/usage-price",
  },
  {
    title: "Recurring Price",
    path: "/portal/recurring-price",
  },
  {
    title: "Subscription-price",
    path: "/portal/subscription-price",
  },
  {
    title: "Discount",
    path: "/portal/discount",
  },
  {
    title: "Trigger",
    path: "/portal/trigger",
  },
  // {
  //   title: "Total Tax",
  //   path: "/portal/total-tax",
  // },
  // {
  //   title: "Parameter",
  //   path: "/portal/parameter",
  // },
  // {
  //   title: "Parameter Version",
  //   path: "/portal/parameter-version",
  // },
];

export const PORTAL_MENU_ROOT: TMenuConfig = [
  {
    title: "Tcel Balance Adjustment",
    icon: "setting-2",
    rootPath: "/tcel-balance-adjustment",
    path: "/tcel-balance-adjustment",
    childrenIndex: 0,
  },
  {
    title: "Order Entry",
    icon: "setting-2",
    rootPath: "/",
    path: "/",
    childrenIndex: 0,
  },
  {
    title: "Directory Menu Management",
    icon: "setting-2",
    rootPath: "/",
    path: "/",
    childrenIndex: 0,
  },
  {
    title: "Price Plan",
    icon: "setting-2",
    rootPath: "/",
    path: "/main/price-plan",
    childrenIndex: 0,
  },
  {
    title: "Role Management",
    icon: "setting-2",
    rootPath: "/",
    path: "/",
    childrenIndex: 0,
  },
  {
    title: "Portal Management",
    icon: "setting-2",
    rootPath: "/",
    path: "/",
    childrenIndex: 0,
  },
  {
    title: "Offer",
    icon: "setting-2",
    rootPath: "/main/offer",
    path: "/main/offer/main-product",
    childrenIndex: 0,
  },
  {
    title: "User Management",
    icon: "setting-2",
    rootPath: "/",
    path: "/",
    childrenIndex: 0,
  },
  {
    title: "Log Management",
    icon: "setting-2",
    rootPath: "/",
    path: "/",
    childrenIndex: 0,
  },
];

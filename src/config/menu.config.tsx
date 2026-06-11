import { type TMenuConfig } from "@/components/menu";
import { useRoleCheck } from "@/pages/main-menu/role-management/hook/useRoleCheck";

export const MENU_DASHBOARD: TMenuConfig = [
  {
    title: "Dashboard",
    path: "/",
  },
];

export const MENU_SIDEBAR: TMenuConfig = [
  {
    title: "Price Plan",
    children: [
      {
        title: "Dashboard",
        path: "/",
      },
      {
        title: "Default",
        path: "/main/price-plan/default",
      },
      {
        title: "Individual",
        path: "/main/price-plan/individual",
      },
      {
        title: "Offer",
        path: "/main/price-plan/offer",
      },
      {
        title: "Discount",
        path: "/main/price-plan/discount",
      },
      {
        title: "System",
        path: "/main/price-plan/system",
      },
      {
        title: "Overlap Discount",
        path: "/main/price-plan/overlap-discount",
      },
      // {
      //   title: "Unified Post Price Plan",
      //   path: "/main/price-plan/unified-post-price-plan",
      // },
    ],
  },
];

const menuRootBuilder = () => {
  const { checkMenus } = useRoleCheck();

  const allPath: TMenuConfig = [
    {
      privName: "TCEL Balance Adjusment",
      title: "naruto and sasuke ",
      icon: "setting-2",
      rootPath: "",
      path: "/tcel-balance-adjustment",
      childrenIndex: 0,
    },
    {
      privName: "Order Entry",
      title: "Order Entry",
      icon: "setting-2",
      rootPath: "/order-entry",
      path: "/order-entry",
      childrenIndex: 0,
    },
    {
      privName: "Directory Menu Management",
      title: "Directory Menu Management",
      icon: "setting-2",
      rootPath: "/directory-menu-management",
      path: "/directory-menu-management",
      childrenIndex: 0,
    },
    {
      privName: "Price Plan",
      title: "Price Plan",
      icon: "setting-2",
      rootPath: "/main/price-plan",
      path: "/main/price-plan",
      childrenIndex: 0,
    },
    {
      privName: "Role Management",
      title: "Role Management",
      icon: "setting-2",
      rootPath: "/role-management",
      path: "/role-management",
      childrenIndex: 0,
    },
    {
      privName: "Portal Management",
      title: "Portal Management",
      icon: "setting-2",
      rootPath: "/portal-management",
      path: "/portal-management",
      childrenIndex: 0,
    },
    {
      privName: "Offer",
      title: "Offer",
      icon: "setting-2",
      rootPath: "/main/offer",
      path: "/main/offer/main-product",
      childrenIndex: 0,
    },
    {
      privName: "User Management",
      title: "User Management",
      icon: "setting-2",
      rootPath: "/user-management",
      path: "/user-management",
      childrenIndex: 0,
    },
    {
      privName: "Log Management",
      title: "Log Management",
      icon: "setting-2",
      rootPath: "/log-management",
      path: "/log-management",
      childrenIndex: 0,
    },
  ];

  const data: TMenuConfig = allPath.filter((item) =>
    checkMenus(item.privName ?? ""),
  );
  // console.log(data);

  if (data.length === 0)
    return [
      {
        privName: "Dashboard",
        title: "Dashboard",
        icon: "setting-2",
        rootPath: "/",
        path: "/",
        childrenIndex: 0,
      },
    ];

  return data;
};

export const MENU_ROOT: TMenuConfig = menuRootBuilder();

// export const MENU_ROOT: TMenuConfig = [
//   {
//     title: "Tcel Balance Adjusment",
//     icon: "setting-2",
//     rootPath: "/",
//     path: "/",
//     childrenIndex: 0,
//   },
//   {
//     title: "Order Entry",
//     icon: "setting-2",
//     rootPath: "/",
//     path: "/",
//     childrenIndex: 0,
//   },
//   {
//     title: "Directory Menu Management",
//     icon: "setting-2",
//     rootPath: "/directory-menu-management",
//     path: "/directory-menu-management",
//     childrenIndex: 0,
//   },
//   {
//     title: "Price Plan",
//     icon: "setting-2",
//     rootPath: "/main/price-plan",
//     path: "/main/price-plan/system",
//     childrenIndex: 0,
//   },
//   {
//     title: "Role Management",
//     icon: "setting-2",
//     rootPath: "/role-management",
//     path: "/role-management",
//     childrenIndex: 0,
//   },
//   {
//     title: "Portal Management",
//     icon: "setting-2",
//     rootPath: "/",
//     path: "/",
//     childrenIndex: 0,
//   },
//   {
//     title: "Offer",
//     icon: "setting-2",
//     rootPath: "/main/offer",
//     path: "/main/offer/main-product",
//     childrenIndex: 0,
//   },
//   {
//     title: "User Management",
//     icon: "setting-2",
//     rootPath: "/user-management",
//     path: "/user-management",
//     childrenIndex: 0,
//   },
//   {
//     title: "Log Management",
//     icon: "setting-2",
//     rootPath: "/",
//     path: "/",
//     childrenIndex: 0,
//   },
// ];

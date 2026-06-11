// hooks/useMenuRoot.ts
import { useMemo } from "react";
import { useRoleCheck } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { type TMenuConfig } from "@/components/menu";

export const useMenuRoot = (): TMenuConfig => {
  const { checkMenusPriv } = useRoleCheck();

  const allPath: TMenuConfig = [
    {
      privName: "",
      title: "Dashboard",
      icon: "home",
      rootPath: "/",
      path: "/",
      childrenIndex: 0,
    },
    {
      privName: "TCEL Balance Adjustment",
      title: "Tcel Balance Adjusment",
      icon: "more-2",
      rootPath: "/tcel-balance-adjustment",
      path: "/tcel-balance-adjustment",
      childrenIndex: 0,
    },
    {
      privName: "Payment",
      title: "Payment",
      icon: "bill",
      rootPath: "/payment",
      path: "/payment",
      childrenIndex: 0,
    },
    {
      privName: "Account Config",
      path: "/account-config/account-balance",
      title: "Account Config",
      icon: "user-edit",
      rootPath: "/account-config",
      childrenIndex: 0,
    },
    {
      privName: "Order Entry",
      title: "Order Entry",
      icon: "handcart",
      rootPath: "/order-entry",
      path: "/order-entry",
      childrenIndex: 0,
    },
    {
      privName: "Directory Menu Management",
      title: "Directory Menu Management",
      icon: "menu",
      rootPath: "/directory-menu-management",
      path: "/directory-menu-management",
      childrenIndex: 0,
    },
    {
      privName: "Price Plan",
      title: "Price Plan",
      icon: "price-tag",
      rootPath: "/main/price-plan",
      path: "/main/price-plan",
      childrenIndex: 0,
    },
    {
      privName: "Role Management",
      title: "Role Management",
      icon: "setting",
      rootPath: "/role-management",
      path: "/role-management",
      childrenIndex: 0,
    },
    {
      privName: "Portal Management",
      title: "Portal Management",
      icon: "setting-3",
      rootPath: "/portal-management",
      path: "/portal-management",
      childrenIndex: 0,
    },
    {
      privName: "Offer",
      title: "Offer",
      icon: "discount",
      rootPath: "/main/offer",
      path: "/main/offer/main-product",
      childrenIndex: 0,
    },
    {
      privName: "User Management",
      title: "User Management",
      icon: "wrench",
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

    {
      privName: "LifeCycle Type",
      title: "LifeCycle Type",
      icon: "watch",
      rootPath: "/lifecycle-type",
      path: "/lifecycle-type",
      childrenIndex: 0,
    },
    {
      privName: "Change Number Profile",
      title: "Change Number Profile",
      icon: "simcard-2",
      rootPath: "/change-number-profile",
      path: "/change-number-profile",
      childrenIndex: 0,
    },
    {
      privName: "PreNewConnection",
      title: "Pre New Connection",
      icon: "abstract-17",
      rootPath: "/pre-new-connection",
      path: "/pre-new-connection",
      childrenIndex: 0,
    },
    {
      privName: "Wholesale Monitor",
      title: "Wholesale Monitor",
      icon: "screen",
      rootPath: "/wholesale-monitor",
      path: "/wholesale-monitor",
      childrenIndex: 0,
    },
    {
      privName: "Upload Sim Card File",

      title: "Upload Simcard File",
      path: "/upload-simcard",
      rootPath: "/upload-simcard",
      childrenIndex: 0,
      icon: "simcard",
    },
    {
      privName: "CVBS SIM & Number Binding/Unbinding",
      title: "CVBS SIM & Number Binding/Unbinding",
      path: "/cvbs-sim-number-binding-unbinding",
      rootPath: "/cvbs-sim-number-binding-unbinding",
      childrenIndex: 0,
      icon: "simcard",
    },
    {
      privName: "TCEL Balance Adjustment",
      title: "Business Common",
      icon: "map",
      rootPath: "/data-reference",
      path: "/data-reference/zone-time",
      childrenIndex: 0,
      children: [
        {
          title: "Zone Time",
          path: "/data-reference/zone-time",
          icon: "map",
        },
        {
          title: "Time Span",
          path: "/data-reference/time-span",
          icon: "time",
        },
        {
          title: "Accm Type",
          path: "/data-reference/accm-type",
          icon: "cube-2",
        },
        {
          title: "Event",
          path: "/data-reference/event",
          icon: "colors-square",
        },
        {
          title: "Ratable Event Action",
          path: "/data-reference/ratable-event-action",
          icon: "abstract-39",
        },
        {
          title: "Advice Type",
          path: "/data-reference/advice-type",
          icon: "abstract-27",
        },
        {
          title: "Advice Monitor",
          path: "/data-reference/advice-monitor",
          icon: "screen",
        },
        {
          title: "WorkFlow Rule",
          path: "/data-reference/workflow-rule-recurring-event",
          icon: "abstract-24",
        },
        {
          title: "Billing Workflow",
          path: "/data-reference/billing-workflow",
          icon: "bill",
        },
        {
          title: "Channel",
          path: "/data-reference/channel",
          icon: "abstract-21",
        },
        {
          title: "All Features",
          path: "/data-reference/all-features",
          icon: "square-brackets",
        },
        {
          title: "Reservation Rule",
          path: "/data-reference/reservation-rule",
          icon: "square-brackets",
        },
      ],
    },
  ];

  const filtered = useMemo(() => {
    const result = allPath.filter((item) =>
      checkMenusPriv(item.privName ?? "", "readStatus"),
    );
    if (result.length === 0) {
      // logout();

      return [
        {
          privName: "",
          title: "Dashboard",
          icon: "setting-2",
          rootPath: "/",
          path: "/",
          childrenIndex: 0,
        },
      ];
    }
    // console.log(result);

    return result;
  }, [checkMenusPriv]);

  return filtered;
};

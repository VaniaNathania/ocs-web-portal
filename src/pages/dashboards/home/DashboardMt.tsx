import { Container, KeenIcon } from "@/components";
import moment from "moment";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  menuAuth,
  useRoleCheck,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { AUTH_LOCAL_STORAGE_KEY, useAuthContext } from "@/auth";
import { get5LastYear } from "@/utils/Date";
import { useLoaders } from "@/providers";
import { getData } from "@/utils";
import useMultiTab from "@/layouts/multiTab/hooks/useContext";
import { tabItem } from "@/layouts/multiTab/models/interfaces";
import { DashboardItem } from "./models/interfaces";

const DashboardHomePageMT = () => {
  const { logout } = useAuthContext();
  const { allTab, openTab } = useMultiTab();

  const [mainMenu, setMainMenu] = useState<DashboardItem[]>([]);
  const [busCom, setBusCom] = useState<DashboardItem[]>([]);

  const authData = getData(AUTH_LOCAL_STORAGE_KEY);
  const menus: menuAuth[] = authData?.menus ?? [];

  const data: DashboardItem[] = [
    {
      privName: "TCEL Balance Adjustment",
      path: "/main-menu/tcel-balance-management/TcelBalanceAdjustment",
      title: "Tcel Balance Adjustment",
      description: "Manage balance adjustments for TCEL accounts.",
      icon: "more-2",
    },
    {
      privName: "Price Plan",
      path: "/main-menu/price-plan/PricePlanLayoutMt",
      title: "Price Plan",
      description: "Handle and manage price plans efficiently.",
      icon: "price-tag",
    },
    {
      privName: "Account Config",
      path: "/main-menu/account-config/AccountConfigLayoutMt",
      title: "Account Config",
      description: "Configure and manage account settings.",
      icon: "user-edit",
    },
    {
      privName: "Offer",
      path: "/main-menu/offer/OfferLayout", // no match
      title: "Offer",
      description: "Manage offers and product configurations.",
      icon: "discount",
    },
    {
      privName: "Order",
      path: "/main-menu/order/OrderLayout", // no match
      title: "Order Entry",
      description: "Process and track customer orders.",
      icon: "handcart",
    },
    {
      privName: "Role Management",
      path: "/main-menu/role-management/RoleLayoutMt",
      title: "Role Management",
      description: "Control user access and roles.",
      icon: "setting",
    },
    {
      privName: "User Management",
      path: "/main-menu/user-management/UserLayout", // no match
      title: "User Management",
      description: "Manage user accounts and permissions.",
      icon: "wrench",
    },
    {
      privName: "Directory Menu Management",
      path: "/main-menu/directory-menu-management/DirMenuLayoutMt",
      title: "Directory Menu Management",
      description: "Manage navigation and directory structure.",
      icon: "menu",
    },
    {
      privName: "Portal Management",
      path: "/main-menu/portal-management/PortalLayout",
      title: "Portal Management",
      description: "Customize and control portal settings.",
      icon: "setting-3",
    },
    {
      privName: "Log Management",
      path: "/main-menu/log-management/LogManagementLayout",
      title: "Log Management",
      description: "Monitor and review system logs.",
      icon: "setting-2",
    },
    {
      privName: "Payment",
      path: "/main-menu/payment/Payment",
      title: "Payment",
      description: "Handle and manage Payment efficiently.",
      icon: "bill",
    },
    {
      privName: "LifeCycle Type",
      path: "/main-menu/job-schedule/lifecycle/LifeCycle",
      title: "LifeCycle Type",
      description: "Manage LifeCycle.",
      icon: "watch",
    },
    {
      privName: "Change Number Profile",
      path: "/pages/main-menu/change-number-profile/ChangeNumberProfilePage",
      title: "Change Number Profile",
      description: "Manage Change Number Profile.",
      icon: "simcard-2",
    },
    {
      privName: "Upload Sim Card File",
      path: "/main-menu/upload-simcard/UploadSimCardPage",
      title: "Upload Simcard File",
      description: "Manage Upload Simcard File for TCEL accounts",
      icon: "simcard",
    },
    {
      privName: "Sim Card Profile",
      path: "/main-menu/simcard-profile/SimcardProfilePage",
      title: "Sim Card Profile",
      description: "Manage Simcard Profile for TCEL accounts",
      icon: "simcard",
    },
    {
      privName: "CVBS SIM & Number Binding/Unbinding",
      path: "/main-menu/cvbs-sim-number-binding-unbinding/SimNumberBindUnbindPage", // no match
      title: "CVBS SIM & Number Binding/Unbinding",
      description: "Manage Sim & Number Binding/Unbinding",
      icon: "simcard",
    },
    {
      privName: "PreNewConnection",
      path: "/main-menu/preNewConnnection/PreNewConnection",
      title: "Pre New Connection",
      description: "Batch subscribe account into the order.",
      icon: "abstract-17",
    },
    {
      privName: "Wholesale Monitor",
      path: "/main-menu/wholesale-monitor/WholesaleMonitor", // no match
      title: "Wholesale Monitor",
      description: "desc",
      icon: "screen",
    },
  ];

  const dataRef: DashboardItem[] = [
    {
      privName: "zone",
      path: "/main-menu/data-reference/zone/ZonePage",
      title: "Zone Time",
      description: "Manage Time Zone for TCEL accounts.",
      icon: "map",
    },
    {
      privName: "time span",
      path: "/main-menu/data-reference/timespan-detail/TimeSpanPage",
      title: "Time Span",
      description: "Manage Time Span for TCEL accounts.",
      icon: "time",
    },
    {
      privName: "accm type",
      path: "/main-menu/data-reference/acm-type/AccmType",
      title: "Accm Type",
      description: "Manage Accm Type for TCEL accounts.",
      icon: "cube-3",
    },
    {
      privName: "event",
      path: "/main-menu/data-reference/event/EventPage",
      title: "Event",
      description: "Manage Event for TCEL accounts.",
      icon: "colors-square",
    },
    {
      privName: "ratable event action",
      path: "/main-menu/data-reference/ratable-event-action/RatableEventActionPage",
      title: "Ratable Event Action",
      description: "Manage Ratable Event Action for TCEL accounts.",
      icon: "abstract-39",
    },
    {
      privName: "advice type",
      path: "/main-menu/data-reference/advice-type/AdviceTypePage",
      title: "Advice Type",
      description: "Manage Advice Type for TCEL accounts",
      icon: "abstract-27",
    },
    {
      privName: "advice monitor",
      path: "/main-menu/data-reference/advice-monitor/AdviceMonitorPage",
      title: "Advice Monitor",
      description: "Manage Advice Monitor for TCEL accounts",
      icon: "screen",
    },
    {
      privName: "WorkFlow Rule & Recurring Event",
      path: "/main-menu/data-reference/workflow-rule-recurring-event/WorkFlowRule",
      title: "WorkFlow Rule",
      description: "Manage WorkFlow Rule for TCEL accounts",
      icon: "abstract-24",
    },
    {
      privName: "Billing WorkFlow",
      path: "/main-menu/data-reference/billing-workflow/BillingWorkflow",
      title: "Billing WorkFlow",
      description: "Manage Billing WorkFlow for TCEL accounts",
      icon: "bill",
    },
    {
      privName: "channel",
      path: "/main-menu/data-reference/channel/Channel",
      title: "Channel",
      description: "Manage Channel for TCEL accounts",
      icon: "abstract-21",
    },
    {
      privName: "all features",
      path: "/main-menu/data-reference/all-features/all-feature-content/AllFeaturesPage",
      title: "All Features",
      description: "Manage All Features for TCEL accounts",
      icon: "square-brackets",
    },
    {
      privName: "reservation rule",
      path: "/main-menu/data-reference/reservation-rule/ReservationPage",
      title: "Reservation Rule",
      description: "Manage All Features for TCEL accounts",
      icon: "square-brackets",
    },
  ];

  const findTabItem = (path: string): tabItem | undefined => {
    const tabItem: tabItem | undefined = allTab.find(
      (Item) => Item.path === path,
    );

    return tabItem;
  };

  const findMenuItem = (menus: DashboardItem[], menu: DashboardItem) => {
    return menus.find((m) => m.path === menu.path);
  };

  useEffect(() => {
    const tempMenu: DashboardItem[] = menus
      .filter((m) => findTabItem(m.url) && m.readStatus === "Y") // keep only matched
      .map((m) => ({
        privName: m.privName,
        description: m.comments,
        icon: m.iconUrl,
        path: m.url,
        title: m.privName,
      }));

    console.log(tempMenu);

    const tempMain: DashboardItem[] = tempMenu
      .filter((m) => findMenuItem(data, m))
      .map((m) => m);
    const tempBus: DashboardItem[] = tempMenu
      .filter((m) => findMenuItem(dataRef, m))
      .map((m) => m);

    setMainMenu(tempMain);
    setBusCom(tempBus);
    // console.log(tempMain, tempBus, tempMenu, menus);
  }, []);

  const handleBackClick = (menu: DashboardItem) => {
    // start();
    const tabItem: tabItem | undefined = findTabItem(menu.path);
    if (tabItem)
      openTab({ ...tabItem, id: menu.privName, title: menu.privName });
    // setScreenLoader(true);

    // navigate(url);
  };

  return (
    <Container>
      <div className="rounded-md">
        {mainMenu.length + busCom.length === 0 ? (
          <div className="text-center py-10 text-gray-600 w-full">
            <p className="text-lg font-semibold mb-2">
              You don't have access to any dashboard menus.
            </p>
            <p className="text-sm">
              Please contact your administrator to assign the necessary
              permissions.
            </p>
            <p className="text-sm mt-2">
              After menus have been assigned, try{" "}
              <span
                className="text-blue-600 font-medium cursor-pointer"
                onClick={logout}
              >
                logging out
              </span>{" "}
              and logging back in to refresh your access.
            </p>
          </div>
        ) : (
          <div className="flex flex-col max-w-7xl p-5 gap-5 mx-auto">
            <h1 className="font-bold text-2xl">Main Menu</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-20 mb-5">
              {mainMenu.map((item) => (
                //   {filteredData.map((item) => (

                <div
                  key={item.privName}
                  onClick={() => handleBackClick(item)}
                  className="bg-white p-6 rounded-xl shadow-md border-2 flex gap-4 hover:shadow-md transition cursor-pointer items-center"
                >
                  <div className=" p-3 rounded-md">
                    <KeenIcon
                      icon={findTabItem(item.path) ? item.icon : "cross"}
                      className=" text-2xl"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p
                      className="text-sm text-gray-600 line-clamp-2"
                      title={item.description}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <hr className="border-2"></hr>
            <h1 className="font-bold text-2xl mt-5">Business Common</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-20">
              {busCom.map((item) => (
                //   {filteredData.map((item) => (

                <div
                  key={item.privName}
                  onClick={() => handleBackClick(item)}
                  className="bg-white p-6 rounded-xl shadow-md border-2 flex items-center gap-4 hover:shadow-md transition cursor-pointer"
                >
                  <div className=" p-3 rounded-md">
                    <KeenIcon
                      icon={findTabItem(item.path) ? item.icon : "cross"}
                      className=" text-2xl"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p
                      className="text-sm text-gray-600 line-clamp-2"
                      title={item.description}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default DashboardHomePageMT;

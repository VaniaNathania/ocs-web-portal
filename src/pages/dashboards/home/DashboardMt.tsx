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

  console.log("AUTH DATA:", authData);
console.log("MENUS:", menus);

  const data: DashboardItem[] = [
    {
      privName: "Price Plan",
      path: "/main-menu/price-plan/PricePlanLayoutMt",
      title: "Price Plan",
      description: "Handle and manage price plans efficiently.",
      icon: "price-tag",
    },
    {
      privName: "User Management",
      path: "/main-menu/user-management/UserLayout", // no match
      title: "User Management",
      description: "Manage user accounts and permissions.",
      icon: "wrench",
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
  const isSuperAdmin = authData?.user?.name === "Administrator";

  if (isSuperAdmin) {
    setMainMenu(data);
  } else {
    setMainMenu([]);
  }
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
          </div>
        )}
      </div>
    </Container>
  );
};

export default DashboardHomePageMT;

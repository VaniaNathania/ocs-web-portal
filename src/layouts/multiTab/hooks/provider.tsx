import React, {
  createContext,
  useContext,
  ReactNode,
  ComponentType,
  lazy,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import { tabItem } from "../models/interfaces";
import { PortalData } from "@/pages/main-menu/role-management/outlet/portal/hook/PortalProvider";
import { useCallApi } from "@/hooks";
import { useAuthContext } from "@/auth";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Party } from "@/pages/main-menu/directory-menu-management/hook/CompProvider";
import UnderConstruction from "@/components/common/UnderConstruction";
import { apiConfigRole } from "@/config/api.config";
import { addLogActivity } from "@/actions/GlobalActions";
import {
  DashboardHomePage,
  AccmType,
  AccountConfig,
  AccountUserProfilePage,
  AdviceMonitorMain,
  AdviceTypeMain,
  AllFeaturesPage,
  BillingWorkflow,
  ChangeNumberProfile,
  ChannelPage,
  DirMenuLayout,
  EventPageMain,
  LifeCycleType,
  LogManagementMain,
  OfferLayout,
  OrderLayout,
  Payment,
  PortalMLayout,
  PreNewConection,
  PreProcessing,
  PricePlanLayout,
  RatableEventActionPage,
  ReservationPageMain,
  Role,
  SimNumberBindUnbind,
  SimcardProfilePage,
  TcelBalanceAdjustment,
  TimeSpanPage,
  UploadSimCardPage,
  UserManagementMain,
  WholesaleMonitor,
  WorkFlowRule,
  ZonePageMain,
  allTabs,
} from "./tabRegistry";
import { MultiTabContext } from "./multiTabContext";

const profile: tabItem = {
  id: "Profile",
  closable: true,
  component: AccountUserProfilePage,
  path: "/account/home/user-profile/AccountUserProfilePage",
  title: "Profile",
};

const API_ROLE = apiConfigRole.role;

// Provider component
interface MultiTabProviderProps {
  children: ReactNode;
}

export const MultiTabProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { userData } = useAuthContext();

  const getInitialHome = (): tabItem => {
  
    const username = userData()?.user?.name;

  console.log("Current User :", username);
  const isSuperAdmin = userData()?.user?.name === "Administrator";
    console.log("Is Super Admin :", isSuperAdmin);

  if (isSuperAdmin) {
    return {
      id: "Home",
      title: "Dashboard",
      component: DashboardHomePage,
      closable: false,
      path: "/dashboards/home/DashboardHomePage",
    };
  }

  return {
    id: "Home",
    title: "Price Plan",
    component: PricePlanLayout,
    closable: false,
    path: "/main-menu/price-plan/PricePlanLayoutMt",
  };
};

  const { GetData } = useCallApi();
  const [popUpProfile, setPopUpProfile] = useState<boolean>(false);
  const [tabs, setTabs] = useState<tabItem[]>([
  getInitialHome(),
]);
  const [activePortal, setActivePortal] = useState<PortalData>();
  // const [allTab, setAllTab] = useState<tabItem[]>(initialAllTab);

  const fetchPortalMenus = async (): Promise<PortalData[]> => {
  try {

    console.log("USER DATA:", userData());
    console.log("USER OBJECT:", userData()?.user);

    const res = await GetData(
      `${API_ROLE}/api/users/${userData()?.user.id}/user/portals`,
      {},
    );

    if (!res?.status || !res?.data) {
      throw new Error(
        res?.message || "Failed to fetch available portal data",
      );
    }


    // ambil data portal dari API dulu
    let portals = res.data;

    setActivePortal(portals[0]);


    return portals;


  } catch (error: any) {
    throw new Error(error.message || "Error fetching available menus");
  }
};

  const userPortalQuery: UseQueryResult<PortalData[]> = useQuery({
    queryKey: ["user-portal-header", userData],
    queryFn: fetchPortalMenus,
    enabled: !!userData,
    refetchOnWindowFocus: false,
  });

  const [activeTab, setActiveTab] = useState("Home");

  const openHome = () => {
  openTab(getInitialHome());
};

  const openByPath = (party: Party) => {
    const tab: tabItem | undefined = allTabs.find(
      (item) => item.path === party.url,
    );

    if (tab) openTab({ ...tab, title: party.partyName, id: party.partyName });
    else
      openTab({
        id: party.partyName,
        title: party.partyName,
        closable: true,
        path: party.url ?? "",
        component: UnderConstruction,
      });
  };
  // open tab from menu
  const openTab = ({ id, title, component, path }: tabItem) => {
    setTabs((prev) => {
      const exists = prev.find((t) => t.id === id);
      addLogActivity("page log", "PAGE_LOG", `Open tab ${title}`, path);
      if (exists) return prev;

      return [...prev, { id, title, component, path, closable: true }];
    });

    setActiveTab(id);
  };

  useEffect(() => {
    console.log("ini user data", userData());

    if (userData()?.forceLogin === "NO") setPopUpProfile(true);
  }, [userData]);

  const openProfile = () => {
    openTab(profile);
  };

  const openPricePlanPortal = (_dataPricePlan: any) => {};

  // close tab
  const closeTab = (tabItem: tabItem) => {
    console.log("close tab ", tabItem);

    addLogActivity(
      "page log",
      "PAGE_LOG",
      `close tab ${tabItem.title}`,
      tabItem.path,
    );
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== tabItem.id);

      if (activeTab === tabItem.id && newTabs.length > 0) {
        setActiveTab(newTabs[newTabs.length - 1].id);
      }

      return newTabs;
    });
  };

  const value = {
    tabs,
    allTab: allTabs,
    openTab,
    closeTab,
    activeTab,
    setActiveTab,
    userPortalQuery,
    activePortal,
    setActivePortal,
    openByPath,
    openHome,
    openPricePlanPortal,
    openProfile,
    popUpProfile,
    setPopUpProfile,
  };

  return (
    <MultiTabContext.Provider value={value}>
      {children}
    </MultiTabContext.Provider>
  );
};

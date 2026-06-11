import {
  createContext,
  Dispatch,
  type PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { MENU_SIDEBAR } from "@/config";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useMenus } from "@/providers";
import { ILayoutConfig, useLayout } from "@/providers";
import { deepMerge } from "@/utils";
import { OfferLayoutConfig } from ".";
import {
  menuAccess,
  useRoleCheck,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { LayoutConfig } from "../config/layoutConfig";
interface moveToSubsPlan {
  catgId?: number;
  offerId?: number;
  subsPlanId?: number;
}

// Interface defining the properties of the layout provider context
export interface IOfferLayoutProviderProps {
  layout: ILayoutConfig; // The layout configuration object
  headerSticky: boolean; // Whether the header should stick to the top on scroll
  mobileSidebarOpen: boolean; // Whether the mobile sidebar is open
  setMobileSidebarOpen: (open: boolean) => void; // Function to toggle the mobile sidebar
  menuPrivAccess?: menuAccess;
  selectedSubSubPlan?: any;
  setSelectedSubSubPlan: SetStateAction<any>;
  selectedVer?: any;
  setSelectedVer: SetStateAction<any>;
  servType?: any;
  setServType: SetStateAction<any>;
  moveToSubsPlan?: moveToSubsPlan;
  setMoveToSubsPlan: React.Dispatch<SetStateAction<moveToSubsPlan | undefined>>;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  hideOfferNavbar: boolean;
  setHideOfferNavbar: Dispatch<SetStateAction<boolean>>;
}

// Initial layout provider properties, using PricePlan layout configuration as the default
const initalLayoutProps: IOfferLayoutProviderProps = {
  layout: OfferLayoutConfig, // Default layout configuration
  headerSticky: false, // Header is not sticky by default
  mobileSidebarOpen: false, // Mobile sidebar is closed by default
  setMobileSidebarOpen: (open: boolean) => {
    // console.log(`${open}`);
  },
  menuPrivAccess: undefined,
  selectedSubSubPlan: undefined,
  setSelectedSubSubPlan: () => {},
  selectedVer: undefined,
  setSelectedVer: () => {},
  servType: undefined,
  setServType: () => {},
  moveToSubsPlan: undefined,
  setMoveToSubsPlan: () => {},
  activeTab: "main",
  setActiveTab: () => {},
  hideOfferNavbar: false,
  setHideOfferNavbar: () => {},
};

// Create a context to manage the layout-related state and logic for PricePlan layout
const OfferLayoutContext =
  createContext<IOfferLayoutProviderProps>(initalLayoutProps);

// Custom hook to access the layout context in other components
const useOfferLayout = () => useContext(OfferLayoutContext);

// Provider component that sets up the layout state and context for PricePlan layout
const OfferLayoutProvider = ({ children }: PropsWithChildren) => {
  const { setMenuConfig } = useMenus(); // Hook to manage menu configurations
  const { getLayout, setCurrentLayout } = useLayout(); // Hook to get and set layout configuration
  const { checkMenusPriv } = useRoleCheck(); //hook to check account menus access
  const [selectedSubSubPlan, setSelectedSubSubPlan] = useState<any>();
  const [selectedVer, setSelectedVer] = useState();
  const [servType, setServType] = useState();
  const [moveToSubsPlan, setMoveToSubsPlan] = useState<moveToSubsPlan>();
  const [activeTab, setActiveTab] = useState<string>("main");
  const [hideOfferNavbar, setHideOfferNavbar] = useState(false);

  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv("/main-menu/offer/OfferLayout", "addStatus"),
    editStatus: checkMenusPriv("/main-menu/offer/OfferLayout", "editStatus"),
    readStatus: checkMenusPriv("/main-menu/offer/OfferLayout", "readStatus"),
    deleteStatus: checkMenusPriv(
      "/main-menu/offer/OfferLayout",
      "deleteStatus",
    ),
  };

  useEffect(() => {
    // console.log(selectedSubSubPlan);
    if (selectedSubSubPlan?.offerVer)
      setSelectedVer(selectedSubSubPlan?.offerVer[0]);
  }, [selectedSubSubPlan]);

  useEffect(() => {
    // console.log("ini servtype", servType);
  }, [servType]);

  // Merge the PricePlan layout configuration with the current layout configuration fetched via getLayout
  const layoutConfig = deepMerge(
    LayoutConfig,
    getLayout(OfferLayoutConfig.name),
  );

  // Set the initial state for layout and mobile sidebar
  const [layout] = useState(layoutConfig); // Layout configuration is stored in state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Manage state for mobile sidebar

  // Get the current scroll position using a custom hook
  const scrollPosition = useScrollPosition();

  // Calculate whether the header should be sticky based on the scroll position and the layout's sticky offset
  const headerSticky: boolean =
    scrollPosition > layout.options.header.stickyOffset;

  // Set the menu configuration for the primary menu using the provided MENU_SIDEBAR configuration
  setMenuConfig("primary", MENU_SIDEBAR);

  // When the layout state changes, set the current layout configuration in the layout provider
  useEffect(() => {
    setCurrentLayout(layout); // Update the current layout in the global layout state
  }, [layout, setCurrentLayout]); // Re-run this effect if layout or setCurrentLayout changes

  // Provide the layout state, sticky header state, and sidebar state to children components via context
  return (
    <OfferLayoutContext.Provider
      value={{
        layout, // The current layout configuration
        headerSticky, // Whether the header should be sticky based on the scroll position
        mobileSidebarOpen, // Whether the mobile sidebar is currently open
        setMobileSidebarOpen, // Function to toggle the mobile sidebar state
        menuPrivAccess,
        selectedSubSubPlan,
        setSelectedSubSubPlan,
        selectedVer,
        setSelectedVer,
        servType,
        setServType,
        moveToSubsPlan,
        setMoveToSubsPlan,
        activeTab,
        setActiveTab,
        hideOfferNavbar,
        setHideOfferNavbar,
      }}
    >
      {children} {/* Render child components that consume this context */}
    </OfferLayoutContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { OfferLayoutProvider, useOfferLayout };

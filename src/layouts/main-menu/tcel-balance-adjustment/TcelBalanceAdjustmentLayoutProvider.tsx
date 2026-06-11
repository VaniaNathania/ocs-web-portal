import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { MENU_SIDEBAR } from "@/config";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useMenus } from "@/providers";
import { ILayoutConfig, useLayout } from "@/providers";
import { deepMerge } from "@/utils";
// import { TcelBalanceAdjustmentLayoutConfig } from ".";
import {
  menuAccess,
  useRoleCheck,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { LayoutConfig } from "../config/layoutConfig";
import { TcelBalanceAdjustmentLayoutConfig } from "./TcelBalanceAdjustmentLayoutConfig";

// Interface defining the properties of the layout provider context
export interface ITcelBalanceAdjustmentLayoutProviderProps {
  layout: ILayoutConfig; // The layout configuration object
  headerSticky: boolean; // Whether the header should stick to the top on scroll
  mobileSidebarOpen: boolean; // Whether the mobile sidebar is open
  setMobileSidebarOpen: (open: boolean) => void; // Function to toggle the mobile sidebar
  menuPrivAccess?: menuAccess;
}

// Initial layout provider properties, using TcelBalanceAdjustment layout configuration as the default
const initalLayoutProps: ITcelBalanceAdjustmentLayoutProviderProps = {
  layout: TcelBalanceAdjustmentLayoutConfig, // Default layout configuration
  headerSticky: false, // Header is not sticky by default
  mobileSidebarOpen: false, // Mobile sidebar is closed by default
  setMobileSidebarOpen: (open: boolean) => {
    //  console.log(`${open}`);
  },
  menuPrivAccess: undefined,
};

// Create a context to manage the layout-related state and logic for TcelBalanceAdjustment layout
const TcelBalanceAdjustmentLayoutContext =
  createContext<ITcelBalanceAdjustmentLayoutProviderProps>(initalLayoutProps);

// Custom hook to access the layout context in other components
const useTcelBalanceAdjustmentLayout = () =>
  useContext(TcelBalanceAdjustmentLayoutContext);

// Provider component that sets up the layout state and context for TcelBalanceAdjustment layout
const TcelBalanceAdjustmentLayoutProvider = ({
  children,
}: PropsWithChildren) => {
  const { setMenuConfig } = useMenus(); // Hook to manage menu configurations
  const { getLayout, setCurrentLayout } = useLayout(); // Hook to get and set layout configuration
  const { checkMenusPriv } = useRoleCheck(); //hook to check account menus access

  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv(
      "/main-menu/tcel-balance-management/TcelBalanceAdjustment",
      "addStatus",
    ),
    editStatus: checkMenusPriv(
      "/main-menu/tcel-balance-management/TcelBalanceAdjustment",
      "editStatus",
    ),
    readStatus: checkMenusPriv(
      "/main-menu/tcel-balance-management/TcelBalanceAdjustment",
      "readStatus",
    ),
    deleteStatus: checkMenusPriv(
      "/main-menu/tcel-balance-management/TcelBalanceAdjustment",
      "deleteStatus",
    ),
  };

  // Merge the TcelBalanceAdjustment layout configuration with the current layout configuration fetched via getLayout
  const layoutConfig = deepMerge(
    LayoutConfig,
    getLayout(TcelBalanceAdjustmentLayoutConfig.name),
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
    <TcelBalanceAdjustmentLayoutContext.Provider
      value={{
        layout, // The current layout configuration
        headerSticky, // Whether the header should be sticky based on the scroll position
        mobileSidebarOpen, // Whether the mobile sidebar is currently open
        setMobileSidebarOpen, // Function to toggle the mobile sidebar state
        menuPrivAccess,
      }}
    >
      {children} {/* Render child components that consume this context */}
    </TcelBalanceAdjustmentLayoutContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { TcelBalanceAdjustmentLayoutProvider, useTcelBalanceAdjustmentLayout };

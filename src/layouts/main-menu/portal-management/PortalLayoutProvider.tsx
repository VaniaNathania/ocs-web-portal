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
import {
  menuAccess,
  useRoleCheck,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { LayoutConfig } from "../config/layoutConfig";
import { Party } from "@/pages/main-menu/portal-management/outlet/component/hook/CompProvider";
import { apiConfigRole } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { DirMenuManagementData } from "@/pages/main-menu/directory-menu-management/hook/CompProvider";

export interface IPortalLayoutProviderProps {
  layout: ILayoutConfig;
  headerSticky: boolean;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;

  // Existing
  selectedRow?: PortalMgrCompData;
  setSelectedRow: React.Dispatch<
    React.SetStateAction<PortalMgrCompData | undefined>
  >;

  //selcteddir
  selectedDir?: Party;
  setSelectedDir: Dispatch<SetStateAction<Party | undefined>>;

  //alldir
  allDir: DirMenuManagementData[];
  setAllDir: Dispatch<SetStateAction<DirMenuManagementData[]>>;

  //show dialog
  showDirMenuSelector: boolean;
  setShowDirMenuSelector: Dispatch<SetStateAction<boolean>>;

  // New delete dialog props
  showDeleteDialog: boolean;
  handleDeleteDialog: (open: boolean, row?: PortalMgrCompData | null) => void;

  selectedTemp?: PortalMgrCompData;
  setSelectedTemp: React.Dispatch<
    React.SetStateAction<PortalMgrCompData | undefined>
  >;
  menuPrivAccess?: menuAccess;
}

const PortalLayoutContext = createContext<IPortalLayoutProviderProps>({
  layout: LayoutConfig,
  headerSticky: false,
  mobileSidebarOpen: false,
  setMobileSidebarOpen: () => {},

  selectedRow: undefined,
  setSelectedRow: () => {},

  allDir: [],
  setAllDir: () => {},

  selectedDir: undefined,
  setSelectedDir: () => {},

  showDirMenuSelector: false,
  setShowDirMenuSelector: () => {},

  showDeleteDialog: false,
  handleDeleteDialog: () => {},

  selectedTemp: undefined,
  setSelectedTemp: () => {},

  menuPrivAccess: undefined,
});

export interface PortalMgrCompData {
  state: string; //"A";
  url: string; //"main.html";
  iconUrl: string; //null;
  stateDate: string; //"2024-01-22";
  portalName: string; //"All Menu";
  extraUrl: string; //null;
  allowExternalAccess: string; //null;
  portalId: number; //1021;
  contactChannelId: string; //null;
}

const API_URL = apiConfigRole.role;

const usePortalLayout = () => useContext(PortalLayoutContext);

const PortalLayoutProvider = ({ children }: PropsWithChildren) => {
  const { setMenuConfig } = useMenus();
  const { GetData } = useCallApi();
  const { getLayout, setCurrentLayout } = useLayout();
  const [selectedRow, setSelectedRow] = useState<
    PortalMgrCompData | undefined
  >();
  const [selectedTemp, setSelectedTemp] = useState<
    PortalMgrCompData | undefined
  >();
  const { checkMenusPriv } = useRoleCheck();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [selectedDir, setSelectedDir] = useState<Party>();
  const [showDirMenuSelector, setShowDirMenuSelector] =
    useState<boolean>(false);

  const [allDir, setAllDir] = useState<DirMenuManagementData[]>([]);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const scrollPosition = useScrollPosition();

  const headerSticky: boolean =
    scrollPosition > LayoutConfig.options.header.stickyOffset;

  const layoutConfig = deepMerge(LayoutConfig, getLayout(LayoutConfig.name));

  const [layout] = useState(layoutConfig);

  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv(
      "/main-menu/portal-management/PortalLayout",
      "addStatus",
    ),
    editStatus: checkMenusPriv(
      "/main-menu/portal-management/PortalLayout",
      "editStatus",
    ),
    readStatus: checkMenusPriv(
      "/main-menu/portal-management/PortalLayout",
      "readStatus",
    ),
    deleteStatus: checkMenusPriv(
      "/main-menu/portal-management/PortalLayout",
      "deleteStatus",
    ),
  };

  const handleDeleteDialog = (
    open: boolean,
    row?: PortalMgrCompData | null,
  ) => {
    setShowDeleteDialog(open);
    if (row === null) {
      setSelectedRow(undefined);
    } else if (row) {
      setSelectedRow(row);
    }
  };

  const fetchAllDirMenu = async () => {
    try {
      const resp = await GetData(`${API_URL}/api/dirs/all-dirs-or-menu`, {});

      if (!resp.status) {
        return toast.error(resp.message);
      }
      // const temp = buildNestedMap(resp.data);
      // console.log(temp);

      setAllDir(resp.data);
    } catch (error) {
      console.error("Failed to fetch All Dir");
    }
  };

  useEffect(() => {
    if (allDir.length === 0) {
      fetchAllDirMenu();
    }
  }, [showDirMenuSelector]);

  useEffect(() => {
    //  console.log(selectedRow);
  }, [selectedRow]);

  useEffect(() => {
    setMenuConfig("primary", MENU_SIDEBAR);
    setCurrentLayout(layout);
  }, [layout, setCurrentLayout, setMenuConfig]);

  return (
    <PortalLayoutContext.Provider
      value={{
        layout,
        headerSticky,
        mobileSidebarOpen,
        setMobileSidebarOpen,

        selectedRow,
        setSelectedRow,

        allDir,
        setAllDir,

        selectedDir,
        setSelectedDir,

        showDirMenuSelector,
        setShowDirMenuSelector,

        showDeleteDialog,
        handleDeleteDialog,

        selectedTemp,
        setSelectedTemp,

        menuPrivAccess,
      }}
    >
      {children}
    </PortalLayoutContext.Provider>
  );
};

export { PortalLayoutProvider, usePortalLayout };

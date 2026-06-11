import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCallApi } from "@/hooks";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { PortalData } from "../../portal/hook/PortalProvider";
import { Directory } from "../block/Directory";
import { apiConfigRole } from "@/config/api.config";

// export interface Portlet {
//   privId: number;
//   privType: string; //"M"
//   privName: string; //"Directory Menu Management",
//   comments: string;
//   //"You can manage directory and menu in this menu, also, you can import or export information about them.",
//   url: string; //"modules/dirmenumgr/views/DirMenuMgr",
//   state: string; //"A",
//   stateDate: string; //"2023-12-25 15:32:38",
//   privCode: string; //"dirmenu-mgrs",
//   privEl: string; //"/dirs|/menus",
//   autoOpenMenu: string; //"N",
// }

export interface Portlet {
  privId: number; //100;
  privEl: string; //"/dirs|/menus",
  url: string; //"modules/portlets/homepage/views/ITCenterHomePage";
  state: string; //"A";
  stateDate: string; //"2023-12-25 15:32:42";
  portletName: string; //"Home Page";
  refreshable: string; //"Y";
  showHeader: string; //"Y";
  collapsable: string; //"Y";
  settable: string; //"Y";
  portletId: number; //100;
  typeId: number; //1;
  type: number; //0;
  defaultTitle: string; //"Home Page";
  maxable: string; //"Y";
  closable: string; //"N";
  icon: string; //"iconfont icon-home";
  viewType: string; //"S";
  isDrawable: string; //"Y";
}

// Context Type
interface PortletListContextType {
  portlets: Portlet[];
  loading: boolean;
  error: string | null;
  availablePortlets: Portlet[];
  setAvailablePortlets: Dispatch<SetStateAction<Portlet[]>>;
  ownedPortlets: Portlet[];
  lastUpdated: any;
  selectedAvailable: Portlet[];
  setSelectedAvailable: Dispatch<SetStateAction<Portlet[]>>;
  selectedOwned: Portlet[];
  setSelectedOwned: Dispatch<SetStateAction<Portlet[]>>;
  showEditDialog: boolean;
  handleEditDialog: (open: boolean) => void;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  fetchAll: () => void;
  portals: PortalData[];
  node?: Party;
  setNode: Dispatch<SetStateAction<Party | undefined>>;
  dir?: Directory;
  setDir: Dispatch<SetStateAction<Directory | undefined>>;
  option?: Boolean;
  setOption: Dispatch<SetStateAction<Boolean>>;
  fetchAvailableMenus: () => void;
}

export interface Party {
  portalId: number;
  partyId: number;
  partyName: string;
  isChild?: boolean;
  parentId?: number;
  level?: number; // To control indentation
  seq?: number;
  type?: string;
}

// Create context
export const PortletListContext = createContext<
  PortletListContextType | undefined
>(undefined);

const API_ROLE = apiConfigRole.role;

export const PortletListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [portlets, setPortlets] = useState<Portlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availablePortlets, setAvailablePortlets] = useState<Portlet[]>([]);
  const [ownedPortlets, setOwnedPortlets] = useState<Portlet[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<Portlet[]>([]);
  const [selectedOwned, setSelectedOwned] = useState<Portlet[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const { GetData } = useCallApi();
  const { selectedRow, selectedTemp, setSelectedTemp } = useRoleLayout();
  const [portals, setPortals] = useState<PortalData[]>([]);
  const [node, setNode] = useState<Party>();
  const [dir, setDir] = useState<Directory>();
  const [option, setOption] = useState<Boolean>(false);

  const hasFetched = useRef(false);

  const fetchAvailableMenus = async () => {
    try {
      //  console.log(node?.partyId);
      const partyId = Number(node?.partyId ?? 0);
      const portalId = Number(node?.portalId ?? 0);

      //  console.log(partyId, portalId);

      const res = await GetData(
        `${API_ROLE}/api/portlets/${selectedRow?.roleId}/portals/${portalId}/portlets`,
        {},
      );
      if (!res?.status || !res?.data) {
        throw new Error(
          res?.message || "Failed to fetch available portal data",
        );
      }
      // console.log(res);
      setAvailablePortlets(res.data);
    } catch (error: any) {
      throw new Error(error.message || "Error fetching available menus");
    }
  };

  const fetchPortalMenus = async (roleId: number | null) => {
    try {
      const res = await GetData(
        `${API_ROLE}/api/common/roles/${roleId}/portals`,
        {},
      );
      if (!res?.status || !res?.data) {
        throw new Error(
          res?.message || "Failed to fetch available portal data",
        );
      }
      //  console.log(res.data);

      return res.data;
    } catch (error: any) {
      throw new Error(error.message || "Error fetching available menus");
    }
  };

  const fetchOwnedMenus = async (roleId: number | null) => {
    try {
      const res = await GetData(`${API_ROLE}/api/roles/${roleId}/portlets`, {});
      if (!res?.status || !res?.data) {
        throw new Error(res?.message || "Failed to fetch owned portal data");
      }
      return res.data;
    } catch (error: any) {
      throw new Error(error.message || "Error fetching owned menus");
    }
  };

  const fetchAll = async () => {
    if (selectedRow != null)
      try {
        setLoading(true);
        // fetchAvailableMenus();

        const [owned, portal] = await Promise.all([
          fetchOwnedMenus(selectedRow.roleId),
          fetchPortalMenus(selectedRow.roleId),
        ]);
        // Replace with `setAvailableMenus(available)` if you want live data
        setOwnedPortlets(owned);
        setPortals(portal);
        setLastUpdated(Date.now());
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
        // console.log();
      }
  };

  const handleEditDialog = (open: boolean) => {
    setShowEditDialog(open);
  };

  useEffect(() => {
    if (selectedRow != null)
      if (!hasFetched.current || selectedTemp != selectedRow) {
        // console.log(!hasFetched.current, selectedTemp != selectedRow);

        hasFetched.current = true;
        setSelectedTemp(selectedRow);
        fetchAll();
      }
  }, [selectedRow]);

  return (
    <PortletListContext.Provider
      value={{
        portlets,
        loading,
        error,
        availablePortlets,
        setAvailablePortlets,
        ownedPortlets,
        lastUpdated,
        selectedAvailable,
        setSelectedAvailable,
        selectedOwned,
        setSelectedOwned,
        showEditDialog,
        handleEditDialog,
        isEditing,
        setIsEditing,
        fetchAll,
        portals,
        node,
        setNode,
        dir,
        setDir,
        option,
        setOption,
        fetchAvailableMenus,
      }}
    >
      {children}
    </PortletListContext.Provider>
  );
};

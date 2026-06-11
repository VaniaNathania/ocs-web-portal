import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCallApi } from "@/hooks";
// import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { PortalData } from "@/pages/main-menu/role-management/outlet/portal/hook/PortalProvider";
import { usePortalLayout } from "@/layouts/main-menu/portal-management";

export interface MenuData {
  privId: number;
  privType: string; //"M"
  privName: string; //"Directory Menu Management",
  comments: string;
  //"You can manage directory and menu in this menu, also, you can import or export information about them.",
  url: string; //"modules/dirmenumgr/views/DirMenuMgr",
  state: string; //"A",
  stateDate: string; //"2023-12-25 15:32:38",
  privCode: string; //"dirmenu-mgrs",
  privEl: string; //"/dirs|/menus",
  autoOpenMenu: string; //"N",
  privLevel: string;
}

// Context Type
interface CompListContextType {
  components: MenuData[];
  loading: boolean;
  error: string | null;
  availableComponents: MenuData[];
  setAvailableComponents: Dispatch<SetStateAction<MenuData[]>>;
  ownedComponents: MenuData[];
  lastUpdated: any;
  selectedAvailable: MenuData[];
  setSelectedAvailable: Dispatch<SetStateAction<MenuData[]>>;
  selectedOwned: MenuData[];
  setSelectedOwned: Dispatch<SetStateAction<MenuData[]>>;
  showEditDialog: boolean;
  handleEditDialog: (open: boolean) => void;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  fetchAll: () => void;
  portals: PortalData[];
  node?: Party;
  setNode: Dispatch<SetStateAction<Party | undefined>>;
  noMenu: MenuData[];
  setNoMenu: Dispatch<SetStateAction<MenuData[]>>;

  showConfirm: boolean;
  setShowConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm: any;
  setOnConfirm: React.Dispatch<React.SetStateAction<any>>;
  desc: string;
  setDesc: React.Dispatch<React.SetStateAction<string>>;
}

export interface Party {
  portalId: number;
  partyId: number;
  partyName: string;
  isChild?: boolean;
  parentId?: number;
  level?: number; // To control indentation
  seq: number;
  type?: string;
  index?: string;
  parentIndex?: string;
}

export interface CompDir {
  index: number; //
  parentIndex: number;
  dirId?: number; //2;
  parentId?: number; //99;
  dirName?: string; //"Privilege Management";
  state?: string; //"A";
  stateDate?: string; //"2023-12-25 15:32:37";
  privId?: number; //111038;
  privName?: string; //"Statistic Type Management";
  url?: string; //"cvbs/modules/billing/ruleconfig/views/StatisticTypeView";
  isChild?: boolean;
  level?: number; // To control indentation
}

// Create context
export const CompListContext = createContext<CompListContextType | undefined>(
  undefined
);

export const CompListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [components, setComponents] = useState<MenuData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableComponents, setAvailableComponents] = useState<MenuData[]>(
    []
  );
  const [ownedComponents, setOwnedComponents] = useState<MenuData[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<MenuData[]>([]);
  const [selectedOwned, setSelectedOwned] = useState<MenuData[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const { GetData } = useCallApi();
  const { selectedRow, selectedTemp, setSelectedTemp } = usePortalLayout();
  const [noMenu, setNoMenu] = useState<MenuData[]>([]);
  const [portals, setPortals] = useState<PortalData[]>([]);
  const [node, setNode] = useState<Party>();

  const [showConfirm, setShowConfirm] = useState(false);
  const [onConfirm, setOnConfirm] = useState();
  const [desc, setDesc] = useState("");

  const hasFetched = useRef(false);

  const fetchAll = async () => {
    if (selectedRow != null)
      try {
        // setLoading(true);
        // fetchAvailableMenus(node?.partyId);
        // const [owned, portal] = await Promise.all([
        //   fetchOwnedMenus(selectedRow.roleId ?? 0),
        //   fetchPortalMenus(selectedRow.roleId ?? 0),
        // ]);
        // // Replace with `setAvailableMenus(available)` if you want live data
        // setOwnedComponents(owned);
        // setPortals(portal);
        // setLastUpdated(Date.now());
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
    // console.log(noMenu);
  }, [selectedRow]);

  return (
    <CompListContext.Provider
      value={{
        components,
        loading,
        error,
        availableComponents,
        setAvailableComponents,
        ownedComponents,
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
        noMenu,
        setNoMenu,

        showConfirm,
        setShowConfirm,
        onConfirm,
        setOnConfirm,
        desc,
        setDesc,
      }}
    >
      {children}
    </CompListContext.Provider>
  );
};

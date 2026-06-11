import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCallApi } from "@/hooks";
import { PortalData } from "@/pages/main-menu/role-management/outlet/portal/hook/PortalProvider";

export interface DirMenuManagementData {
  type: "1" | "0"; // "1" → looks numeric but is actually a string
  // partyId: number; // e.g. 111154
  parentId?: number; // e.g. 111065
  // partyName: string; // e.g. "Credit Limit Check Rule"
  url?: string; // e.g. "cvbs/modules/custinfo/creditlimit/view/CcTypeCheckRuleMgtView"
  iconUrl?: string; // e.g. "icon-gene-man-manager"
  level?: number;
  // seq?: number;
  // portalId?: number;
  id: number;
  name: string;
  isHold?: boolean;
  isAuthorized?: boolean;
  hasChildren: boolean;
  comments?: string;
  privEl?: string;
  privCode?: string;
  code?: string;
  specialCondition?: string;
  state?: string;
  stateDate?: string;
  index?: string;
  parentIndex?: string;
}

// Context Type
interface CompListContextType {
  components: DirMenuManagementData[];
  loading: boolean;
  error: string | null;
  lastUpdated: any;
  showEditDialog: boolean;
  handleEditDialog: (open: boolean) => void;
  showMenuSelector: boolean;
  setShowMenuSelector: Dispatch<SetStateAction<boolean>>;
  showNewDir: boolean;
  setShowNewDir: Dispatch<SetStateAction<boolean>>;
  showMenuManagement: boolean;
  setShowMenuManagement: Dispatch<SetStateAction<boolean>>;
  showBindPortal: boolean;
  setShowBindPortal: Dispatch<SetStateAction<boolean>>;
  showImport: boolean;
  setShowImport: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  portals: PortalData[];
  node?: Party;
  setNode: Dispatch<SetStateAction<Party | undefined>>;
  selectedRow?: DirMenuManagementData;
  setSelectedRow: Dispatch<SetStateAction<DirMenuManagementData | undefined>>;
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
  seq?: number;
  type?: string;
  url?: string;
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
  privCode?: string;
  url?: string; //"cvbs/modules/billing/ruleconfig/views/StatisticTypeView";
  iconUrl?: string;
  isChild?: boolean;
  level?: number; // To control indentation
}

// Create context
export const CompListContext = createContext<CompListContextType | undefined>(
  undefined,
);

// Provider
export const CompListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [components, setComponents] = useState<DirMenuManagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMenuSelector, setShowMenuSelector] = useState(false);
  const [showNewDir, setShowNewDir] = useState(false);
  const [showMenuManagement, setShowMenuManagement] = useState(false);
  const [showBindPortal, setShowBindPortal] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const { GetData } = useCallApi();
  const [portals, setPortals] = useState<PortalData[]>([]);
  const [node, setNode] = useState<Party>();
  const [selectedRow, setSelectedRow] = useState<DirMenuManagementData>();

  const [showConfirm, setShowConfirm] = useState(false);
  const [onConfirm, setOnConfirm] = useState();
  const [desc, setDesc] = useState("");

  const hasFetched = useRef(false);

  const handleEditDialog = (open: boolean) => {
    setShowEditDialog(open);
  };

  return (
    <CompListContext.Provider
      value={{
        components,
        loading,
        error,
        lastUpdated,
        showEditDialog,
        handleEditDialog,
        showMenuSelector,
        setShowMenuSelector,
        showNewDir,
        setShowNewDir,
        showMenuManagement,
        setShowMenuManagement,
        showBindPortal,
        setShowBindPortal,
        showImport,
        setShowImport,
        isEditing,
        setIsEditing,
        portals,
        node,
        setNode,
        selectedRow,
        setSelectedRow,
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

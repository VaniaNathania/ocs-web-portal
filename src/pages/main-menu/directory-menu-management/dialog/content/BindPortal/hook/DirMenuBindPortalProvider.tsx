import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useCallApi } from "@/hooks";
import { PortalData } from "@/pages/main-menu/role-management/outlet/portal/hook/PortalProvider";
import { toast } from "sonner";
import { useCompList } from "@/pages/main-menu/directory-menu-management/hook/useComp";
import { apiConfigRole } from "@/config/api.config";

interface DirMenuBindPortalContextType {
  rows: PortalData[];
  loading: boolean;
  error: string | null;
  availablerows: PortalData[];
  setAvailablerows: Dispatch<SetStateAction<PortalData[] | []>>;
  ownedrows: PortalData[];
  setOwnedrows: Dispatch<SetStateAction<PortalData[] | []>>;
  lastUpdated: any;
  selectedAvailable: PortalData[];
  setSelectedAvailable: Dispatch<SetStateAction<PortalData[]>>;
  selectedOwned: PortalData[];
  setSelectedOwned: Dispatch<SetStateAction<PortalData[]>>;

  adding: PortalData[];
  setAdding: Dispatch<SetStateAction<PortalData[]>>;
  deleting: PortalData[];
  setDeleting: Dispatch<SetStateAction<PortalData[]>>;
  showEditDialog: boolean;
  handleEditDialog: (open: boolean) => void;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  countAva: number;
  setCountAva: Dispatch<SetStateAction<number>>;
  countOwned: number;
  setCountOwned: Dispatch<SetStateAction<number>>;
  fetchAll: () => void;
  fetchrows: () => any;
  fetchUserrows: () => any;

  recOwned: number[];
  setRecOwned: Dispatch<SetStateAction<number[]>>;
}

export const DirMenuBindPortalContext = createContext<
  DirMenuBindPortalContextType | undefined
>(undefined);

const API_URL = apiConfigRole.role;

export const DirMenuBindPortalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [rows, setrows] = useState<PortalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availablerows, setAvailablerows] = useState<PortalData[]>([]);
  const [ownedrows, setOwnedrows] = useState<PortalData[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<PortalData[]>([]);
  const [selectedOwned, setSelectedOwned] = useState<PortalData[]>([]);
  const [adding, setAdding] = useState<PortalData[]>([]);
  const [deleting, setDeleting] = useState<PortalData[]>([]);

  const [recOwned, setRecOwned] = useState<number[]>([]);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [countAva, setCountAva] = useState<number>(0);
  const [countOwned, setCountOwned] = useState<number>(0);
  const { GetData } = useCallApi();

  const { selectedRow } = useCompList();

  const handleEditDialog = (open: boolean) => {
    setShowEditDialog(open);
  };

  const fetchrows = async () => {
    try {
      setError(null);
      const response = await GetData(`${API_URL}/api/portals/portals`, {});

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch portals data");
      }
      // setAvailableroles(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.message || "Unknown error");
      toast.error(err.message || "Failed to fetch portals");
      return [];
    }
  };

  const fetchUserrows = async () => {
    try {
      setError(null);
      //  console.log(selectedRow);

      const response = await GetData(
        `${API_URL}/api/portals/qry-portal-list-by-menu-id`,
        {
          search: "",
          page: 1,
          size: 100,
          sortBy: "portalId",
          sortDirection: "asc",
          partyId: selectedRow?.id,
          type: "0",
          spId: 0,
        },
      );

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch offer data");
      }
      // setAvailableroles(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.message || "Unknown error");
      toast.error(err.message || "Failed to fetch roles");
      return [];
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const avarows = await fetchrows();
      const ownrows = await fetchUserrows();

      // const userRoles = await fetchRolePortals();

      // console.log(ownrows);

      // Assuming rows have a unique identifier (e.g. roleId)
      const ownedIds = new Set(ownrows.map((r: PortalData) => r.portalId));

      setRecOwned(ownrows.map((r: PortalData) => r.portalId));

      const filteredAvailable = avarows.filter(
        (portal: any) => !ownedIds.has(portal.portalId),
      );

      // setrows(userRoles);
      setAvailablerows(filteredAvailable);
      setOwnedrows(ownrows);
      setAdding(ownrows);
      setLastUpdated(Date.now());
    } catch (error) {
      toast.error("Failed to fetch user rows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <DirMenuBindPortalContext.Provider
      value={{
        rows,
        loading,
        error,
        availablerows,
        setAvailablerows,
        ownedrows,
        setOwnedrows,
        lastUpdated,
        selectedAvailable,
        setSelectedAvailable,
        selectedOwned,
        setSelectedOwned,
        showEditDialog,
        handleEditDialog,
        isEditing,
        setIsEditing,
        countAva,
        setCountAva,
        countOwned,
        setCountOwned,
        fetchAll,
        fetchrows,
        fetchUserrows,

        adding,
        setAdding,
        deleting,
        setDeleting,
        recOwned,
        setRecOwned,
      }}
    >
      {children}
    </DirMenuBindPortalContext.Provider>
  );
};

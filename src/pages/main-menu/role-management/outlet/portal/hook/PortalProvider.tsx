import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCallApi } from "@/hooks";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { toast } from "sonner";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { RoleSPID } from "../../../component/sideBarListContextTable";
import { apiConfigRole } from "@/config/api.config";

interface PortalListContextType {
  portals: PortalData[];
  loading: boolean;
  error: string | null;
  availablePortal: PortalData[];
  ownedPortal: PortalData[];
  lastUpdated: any;
  selectedAvailable: PortalData[];
  setSelectedAvailable: Dispatch<SetStateAction<PortalData[]>>;
  selectedOwned: PortalData[];
  setSelectedOwned: Dispatch<SetStateAction<PortalData[]>>;
  showEditDialog: boolean;
  handleEditDialog: (open: boolean) => void;
  isEditing: boolean;
  setIsEditing: any;
  fetchAll: any;
}

export interface PortalData {
  portalId: number;
  portalName: string;
  state: string;
  stateDate: string;
  url: string;
  type: number;
  partyId: number | null;
  partyName: string;
  roleId?: number;
  userId?: number;
  roleName?: string;
}

export const PortalListContext = createContext<
  PortalListContextType | undefined
>(undefined);

const API_URL = apiConfigRole.role;

export const PortalListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { GetData } = useCallApi();
  const [portals, setPortals] = useState<PortalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availablePortal, setAvailablePortal] = useState<PortalData[]>([]);
  const [ownedPortal, setOwnedPortal] = useState<PortalData[]>([]);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [selectedAvailable, setSelectedAvailable] = useState<PortalData[]>([]);
  const [selectedOwned, setSelectedOwned] = useState<PortalData[]>([]);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const hasFetched = useRef(false);
  const [tempRow, setTempRow] = useState<RoleSPID>();

  const { selectedRow, selectedTemp, setSelectedTemp } = useRoleLayout();

  const fetchAll = async () => {
    // console.log(selectedRow);
    if (selectedRow != null)
      try {
        setLoading(true);
        if (portals.length === 0) {
          const [availableRes, ownedRes] = await Promise.all([
            GetData(`${API_URL}/api/portals/portals`, {}),
            GetData(
              `${API_URL}/api/common/roles/${selectedRow?.roleId}/portals`,
              {},
            ),
          ]);

          if (!availableRes?.status || !availableRes?.data) {
            throw new Error(
              availableRes?.message || "Failed to fetch available portal data",
            );
          }

          if (!ownedRes?.status || !ownedRes?.data) {
            throw new Error(
              ownedRes?.message || "Failed to fetch owned portal data",
            );
          }

          const available = availableRes.data;
          const owned = ownedRes.data;

          // Filter: only keep available items that are NOT in owned
          const ownedIds = new Set(owned.map((item: any) => item.portalId));
          const filteredAvailable = available.filter(
            (item: any) => !ownedIds.has(item.portalId),
          );

          setAvailablePortal(filteredAvailable);
          setOwnedPortal(owned);
          setPortals(available);
          setLastUpdated(Date.now());
        } else {
          const [ownedRes] = await Promise.all([
            GetData(
              `${API_URL}/api/common/roles/${selectedRow?.roleId}/portals`,
              {},
            ),
          ]);

          if (!ownedRes?.status || !ownedRes?.data) {
            throw new Error(
              ownedRes?.message || "Failed to fetch owned portal data",
            );
          }

          const available = portals;
          const owned = ownedRes.data;

          // Filter: only keep available items that are NOT in owned
          const ownedIds = new Set(owned.map((item: any) => item.portalId));
          const filteredAvailable = available.filter(
            (item: any) => !ownedIds.has(item.portalId),
          );

          setAvailablePortal(filteredAvailable);
          setOwnedPortal(owned);
          // setPortals(available);
          setLastUpdated(Date.now());
        }
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
  };

  // const handlePutAllAvalaibleToOwned = async () => {
  //   try {
  //   //  console.log("🚀 Editing role with data:", availablePortal);

  //     const response = await PutData(
  //       "${API_URL}/api/roles/prod/roles",
  //       availablePortal
  //     );

  //   //  console.log("📦 API Response:", response);

  //     if (response?.status) {
  //       toast.success("Role portals edited successfully!");

  //       const createActivity = {
  //         module: "Manage Role Management",
  //         description: `Edit Role Portals=> ${selectedRow?.roleName}`,
  //         action: "E",
  //       };
  //       doSaveLogActivity(createActivity);

  //     //  console.log("✅ Role portals edited successfully");
  //     } else {
  //       const errorMessage =
  //         response?.message || "Failed to create role. Please try again.";
  //       toast.error(errorMessage);
  //       console.error("❌ API returned error:", response);
  //     }
  //   } catch (error: any) {
  //     const errorMessage =
  //       error?.message || "Something went wrong. Please try again.";
  //     toast.error(errorMessage);
  //     console.error("❌ Error creating role:", error);
  //   } finally {
  //     fetchAll();
  //   }
  // };

  const handleEditDialog = (open: boolean) => {
    setShowEditDialog(open);
  };

  useEffect(() => {
    fetchAll();
  }, [selectedRow]);

  return (
    <PortalListContext.Provider
      value={{
        portals,
        loading,
        error,
        availablePortal,
        ownedPortal,
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
      }}
    >
      {children}
    </PortalListContext.Provider>
  );
};

import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useCallApi } from "@/hooks";
import { PageDto } from "@/pages/main-menu/user-management/main";
import { apiConfigRole } from "@/config/api.config";
import {
  PrivData,
  PrivGetDto,
} from "../../MenuManagement/hook/DirMenuManagementProvider";
import { useDirMenuManagement } from "../../MenuManagement/hook/useDirMenuManagement";
import { useCompList } from "@/pages/main-menu/directory-menu-management/hook/useComp";
import { Menu } from "@/auth/models/interfaces";
import { MenuData } from "../models/interfaces";

interface DirMenuSelectorContextType {
  rows: PrivData[];
  loading: boolean;
  error: string | null;
  availablerows: PrivData[];
  setAvailablerows: Dispatch<SetStateAction<PrivData[] | []>>;
  ownedrows: PrivData[];
  setOwnedrows: Dispatch<SetStateAction<PrivData[] | []>>;
  lastUpdated: any;
  selectedAvailable: PrivData[];
  setSelectedAvailable: Dispatch<SetStateAction<PrivData[]>>;
  selectedOwned: PrivData[];
  setSelectedOwned: Dispatch<SetStateAction<PrivData[]>>;
  showEditDialog: boolean;
  handleEditDialog: (open: boolean) => void;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  countAva: number;
  setCountAva: Dispatch<SetStateAction<number>>;
  countOwned: number;
  setCountOwned: Dispatch<SetStateAction<number>>;
  fetchAll: () => void;
  fetchrows: () => Promise<PrivData[]>;
  fetchUserrows: (DTO: Partial<PageDto>) => any;
}

export const DirMenuSelectorContext = createContext<
  DirMenuSelectorContextType | undefined
>(undefined);

const API_URL = apiConfigRole.role;

export const DirMenuSelectorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [rows, setrows] = useState<PrivData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availablerows, setAvailablerows] = useState<PrivData[]>([]);
  const [ownedrows, setOwnedrows] = useState<PrivData[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<PrivData[]>([]);
  const [selectedOwned, setSelectedOwned] = useState<PrivData[]>([]);
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

  const fetchrows = async (DTO: Partial<PageDto> = {}): Promise<PrivData[]> => {
    const {
      search = "",
      page = 0,
      size = 5,
      sortBy = "",
      sortDirection = "desc",
    } = DTO;

    const payload = {
      search,
      page,
      size,
      sortBy,
      sortDirection,
    };
    try {
      // console.log(DTO);

      // const response = {
      //   status: 200,
      //   data: {
      //     list: Mockrows,
      //     totalCount: Mockrows.length,
      //     message: "succes",
      //   },
      // };

      const response = await GetData(
        // `${API_URL}/api/roles/dirs/${selectedRow?.id}/menus`,
        `${API_URL}/api/dirs/dirs/${selectedRow?.id}/menus`,

        {},
      );

      const temp: MenuData[] = response.data;

      const result: PrivData[] = temp.map((item) => ({
        privId: item.menuId,
        privType: "M",
        privName: item.menuName,
        type: "1",
        id: item.menuId,
        name: item.menuName,
        hasChildren: false,
      }));

      return result;
    } catch (error) {
      //  console.log(error);

      return [];
    }
  };

  const fetchUserrows = async (DTO: Partial<PrivGetDto> = {}) => {
    setLoading(true);

    const {
      search = "",
      page = 0,
      size = 5,
      sortBy = "menuName",
      sortDirection = "desc",
      privName = "",
      url = "",
    } = DTO;

    const payload = {
      search,
      page,
      size,
      sortBy,
      sortDirection,
      privName,
      url,
      state: "A",
    };
    try {
      // console.log(DTO);

      const response = await GetData(
        `${API_URL}/api/dirs/qry-all-menu-list`,
        payload,
      );

      return response;
    } catch (error) {
      const response = {
        status: 400,
        data: {
          list: [],
          totalCount: [],
          message: "error",
        },
      };
      return response;
    } finally {
      setLoading(false);
    }
  };
  const fetchAll = () => {
    setLoading(true);
    try {
      fetchrows();
      fetchUserrows();
    } catch (error) {
      //  console.log("error somehow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DirMenuSelectorContext.Provider
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
      }}
    >
      {children}
    </DirMenuSelectorContext.Provider>
  );
};

import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useCallApi } from "@/hooks";
import { DirMenuManagementData } from "@/pages/main-menu/directory-menu-management/hook/CompProvider";
import { apiConfigRole } from "@/config/api.config";
import { PageDto } from "@/pages/main-menu/user-management/main";

interface PrivObj {
  privId: number; //1083;
  privType: string; //"M";
  privCode?: string; //"AccNbrRecycle";
  privName: string; //"Acc Nbr Recycle";
  comments?: string; //null;
  url?: string; //"cvbs/png/modules/resource/number/views/AccNbrRecycleView";
  privEl?: string; //null;
  cdnUrl?: string; //null;
  jsFile?: string; //null;
  cssFile?: string; //null;
  spId?: number; //null;
  appId?: number; //null;
}

export interface PrivData extends PrivObj, DirMenuManagementData {}
export interface PrivGetDto extends PageDto {
  privName?: string;
  url?: string;
}

interface DirMenuManagementContextType {
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
  fetchrows: () => any;
  fetchUserrows: (DTO: Partial<PrivGetDto>) => any;
  selectedRow?: PrivData;
  setSelectedRow: Dispatch<SetStateAction<PrivData | undefined>>;
}

export const DirMenuManagementContext = createContext<
  DirMenuManagementContextType | undefined
>(undefined);

const API_URL = apiConfigRole.role;

export const DirMenuManagementProvider = ({
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
  const [selectedRow, setSelectedRow] = useState<PrivData>();

  const { GetData } = useCallApi();

  const handleEditDialog = (open: boolean) => {
    setShowEditDialog(open);
  };

  const fetchrows = (DTO: Partial<PrivGetDto> = {}) => {
    const {
      search = "",
      page = 0,
      size = 5,
      sortBy = "",
      sortDirection = "desc",
    } = DTO;

    // console.log(DTO);

    const response = {
      status: 200,
      data: {
        list: [],
        totalCount: [].length,
        message: "succes",
      },
    };

    return response;
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
      //  console.log("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DirMenuManagementContext.Provider
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
        selectedRow,
        setSelectedRow,
      }}
    >
      {children}
    </DirMenuManagementContext.Provider>
  );
};

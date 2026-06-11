import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useCallApi } from "@/hooks";
import { PageDto } from "@/pages/main-menu/user-management/main";

export interface IPLimit {
  iPLimitId: number;
  startIP: string;
  endIP: string;
}

interface UserGrantIPLimitContextType {
  rows: IPLimit[];
  loading: boolean;
  error: string | null;
  availablerows: IPLimit[];
  setAvailablerows: Dispatch<SetStateAction<IPLimit[] | []>>;
  ownedrows: IPLimit[];
  setOwnedrows: Dispatch<SetStateAction<IPLimit[] | []>>;
  lastUpdated: any;
  selectedAvailable: IPLimit[];
  setSelectedAvailable: Dispatch<SetStateAction<IPLimit[]>>;
  selectedOwned: IPLimit[];
  setSelectedOwned: Dispatch<SetStateAction<IPLimit[]>>;
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
  addIP: any;
  setAddIP: Dispatch<SetStateAction<any>>;
  removeIP: any;
  setRemoveIP: Dispatch<SetStateAction<any>>;
}

export const UserGrantIPLimitContext = createContext<
  UserGrantIPLimitContextType | undefined
>(undefined);

export const UserGrantIPLimitProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [rows, setrows] = useState<IPLimit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availablerows, setAvailablerows] = useState<IPLimit[]>([]);
  const [ownedrows, setOwnedrows] = useState<IPLimit[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<IPLimit[]>([]);
  const [selectedOwned, setSelectedOwned] = useState<IPLimit[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [countAva, setCountAva] = useState<number>(0);
  const [countOwned, setCountOwned] = useState<number>(0);
  const [addIP, setAddIP] = useState<any>();
  const [removeIP, setRemoveIP] = useState<any>();
  const { GetData } = useCallApi();

  const handleEditDialog = (open: boolean) => {
    setShowEditDialog(open);
  };

  const fetchrows = (DTO: Partial<PageDto> = {}) => {
    const {
      search = "",
      page = 0,
      size = 5,
      sortBy = "",
      sortDirection = "desc",
    } = DTO;

    const Mockrows: IPLimit[] = [
      {
        iPLimitId: 1,
        startIP: "0.0.0.0",
        endIP: "0.0.0.0",
      },
      {
        iPLimitId: 2,
        startIP: "0.0.0.0",
        endIP: "0.0.0.0",
      },
      {
        iPLimitId: 3,
        startIP: "0.0.0.0",
        endIP: "0.0.0.0",
      },
      {
        iPLimitId: 4,
        startIP: "0.0.0.0",
        endIP: "0.0.0.0",
      },
    ];

    // console.log(DTO);

    const response = {
      status: 200,
      data: {
        list: Mockrows,
        totalCount: Mockrows.length,
        message: "succes",
      },
    };

    return response;
  };

  const fetchUserrows = (DTO: Partial<PageDto> = {}) => {
    const {
      search = "",
      page = 0,
      size = 5,
      sortBy = "",
      sortDirection = "desc",
    } = DTO;

    const Mockrows: IPLimit[] = [
      {
        iPLimitId: 1,
        startIP: "0.0.0.0",
        endIP: "0.0.0.0",
      },
      {
        iPLimitId: 2,
        startIP: "0.0.0.0",
        endIP: "0.0.0.0",
      },
      {
        iPLimitId: 3,
        startIP: "0.0.0.0",
        endIP: "0.0.0.0",
      },
      {
        iPLimitId: 4,
        startIP: "0.0.0.0",
        endIP: "0.0.0.0",
      },
      {
        iPLimitId: 1,
        startIP: "0.0.0.0",
        endIP: "0.0.0.0",
      },
      {
        iPLimitId: 2,
        startIP: "0.0.0.0",
        endIP: "0.0.0.0",
      },
      {
        iPLimitId: 3,
        startIP: "0.0.0.0",
        endIP: "0.0.0.0",
      },
      {
        iPLimitId: 4,
        startIP: "0.0.0.0",
        endIP: "0.0.0.0",
      },
    ];

    // console.log(DTO);

    const response = {
      status: 200,
      data: {
        list: Mockrows,
        totalCount: Mockrows.length,
        message: "succes",
      },
    };

    return response;
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
    <UserGrantIPLimitContext.Provider
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
        addIP,
        setAddIP,
        removeIP,
        setRemoveIP,
      }}
    >
      {children}
    </UserGrantIPLimitContext.Provider>
  );
};

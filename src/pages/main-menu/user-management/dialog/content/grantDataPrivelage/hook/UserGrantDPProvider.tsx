import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useCallApi } from "@/hooks";
import { PageDto } from "@/pages/main-menu/user-management/main";

export interface UserDataPriv {
  privId: number;
  privName: string;
  privCode: string;
  type: string;
  comments: string;
}

interface UserGrantDPContextType {
  rows: UserDataPriv[];
  loading: boolean;
  error: string | null;
  availablerows: UserDataPriv[];
  setAvailablerows: Dispatch<SetStateAction<UserDataPriv[] | []>>;
  ownedrows: UserDataPriv[];
  setOwnedrows: Dispatch<SetStateAction<UserDataPriv[] | []>>;
  lastUpdated: any;
  selectedAvailable: UserDataPriv[];
  setSelectedAvailable: Dispatch<SetStateAction<UserDataPriv[]>>;
  selectedOwned: UserDataPriv[];
  setSelectedOwned: Dispatch<SetStateAction<UserDataPriv[]>>;
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
}

export const UserGrantDPContext = createContext<
  UserGrantDPContextType | undefined
>(undefined);

export const UserGrantDPProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [rows, setrows] = useState<UserDataPriv[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availablerows, setAvailablerows] = useState<UserDataPriv[]>([]);
  const [ownedrows, setOwnedrows] = useState<UserDataPriv[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<UserDataPriv[]>(
    []
  );
  const [selectedOwned, setSelectedOwned] = useState<UserDataPriv[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [countAva, setCountAva] = useState<number>(0);
  const [countOwned, setCountOwned] = useState<number>(0);
  const { GetData } = useCallApi();

  const handleEditDialog = (open: boolean) => {
    setShowEditDialog(open);
  };

  const Mockrows: UserDataPriv[] = [
    {
      privId: 1,
      privName: "string1",
      privCode: "string1",
      type: "string1",
      comments: "string1",
    },
    {
      privId: 2,
      privName: "string2",
      privCode: "string2",
      type: "string2",
      comments: "string2",
    },
    {
      privId: 3,
      privName: "string3",
      privCode: "string3",
      type: "string3",
      comments: "string3",
    },
  ];

  const fetchrows = (DTO: Partial<PageDto> = {}) => {
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

    // console.log(DTO);

    const response = {
      status: 200,
      data: {
        list: [
          ...Mockrows,
          ...Mockrows,
          ...Mockrows,
          ...Mockrows,
          ...Mockrows,
          ...Mockrows,
        ],
        totalCount: Mockrows.length * 6,
        // list: Mockrows,
        // totalCount: Mockrows.length,
        message: "succes",
      },
    };

    return response;
  };

  const fetchAll = () => {
    fetchrows();
    fetchUserrows();
  };

  return (
    <UserGrantDPContext.Provider
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
    </UserGrantDPContext.Provider>
  );
};

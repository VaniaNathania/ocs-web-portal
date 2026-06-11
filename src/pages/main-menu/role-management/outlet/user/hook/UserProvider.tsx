import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { doSaveLogActivity } from "@/actions/GlobalActions";

export interface UserData {
  userId: number;
  userName: string;
  userCode: string;
  pwd: string;
  userEffDate: string;
  createdDate: string;
  state: string;
  stateDate: string;
  isLocked: string;
  loginFail: number;
  unlockDate: string;
  portalId: number;
  updateDate: string;
  roleId: number;
  exist: boolean;
  passwordExist: boolean;
  phone: string;
  email: string;
  address: string;
}

interface UserListContextType {
  users: UserData[];
  loading: boolean;
  error: string | null;
  availableUsers: UserData[];
  setAvailableUsers: Dispatch<SetStateAction<UserData[] | []>>;
  ownedUsers: UserData[];
  setOwnedUsers: Dispatch<SetStateAction<UserData[] | []>>;
  lastUpdated: any;
  selectedAvailable: UserData[];
  setSelectedAvailable: Dispatch<SetStateAction<UserData[]>>;
  selectedOwned: UserData[];
  setSelectedOwned: Dispatch<SetStateAction<UserData[]>>;
  showEditDialog: boolean;
  handleEditDialog: (open: boolean) => void;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  fetchAll: () => void;
  countAva: number;
  setCountAva: Dispatch<SetStateAction<number>>;
  countOwned: number;
  setCountOwned: Dispatch<SetStateAction<number>>;
}

export const UserListContext = createContext<UserListContextType | undefined>(
  undefined
);

export const UserListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<UserData[]>([]);
  const [ownedUsers, setOwnedUsers] = useState<UserData[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<UserData[]>([]);
  const [selectedOwned, setSelectedOwned] = useState<UserData[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [countAva, setCountAva] = useState<number>(0);
  const [countOwned, setCountOwned] = useState<number>(0);

  const fetchAll = () => {
    setLoading(true);
    try {
      setLastUpdated(Date.now());
    } catch (e: any) {
      setError(e.message || "Unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditDialog = (open: boolean) => {
    setShowEditDialog(open);
  };

  // useEffect(() => {
  //   fetchAll();
  // }, []);

  return (
    <UserListContext.Provider
      value={{
        users,
        loading,
        error,
        availableUsers,
        setAvailableUsers,
        ownedUsers,
        setOwnedUsers,
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
        countAva,
        setCountAva,
        countOwned,
        setCountOwned,
      }}
    >
      {children}
    </UserListContext.Provider>
  );
};

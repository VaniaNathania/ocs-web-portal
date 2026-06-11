import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCallApi } from "@/hooks";
import { useUserManagement } from "@/pages/main-menu/user-management/hook/useUserManagemet";
import { apiConfigRole } from "@/config/api.config";

export interface HistoryData {
  recId: number; //1161;
  userId: number; //1002;
  userName: string; //"LinkTEST";
  userCode: string; //"Link_T";
  userEffDate: string; //"2024-12-02 14:17:43";
  createdDate: string; //"2024-12-02 14:17:43";
  state: string; // "A";
  stateDate: string; //"2024-12-02 14:17:43";
  isLocked: string; //"N";
  loginFail: number; //0;
  recUserId: number; //1;
  recCreateDate: string; //"2024-12-11 11:16:59";
  ipAddress: string; //"10.210.0.177";
  comments: string; //"Modify User Information";
  unlockDate: string; //"2024-12-02 14:28:37";
  recUserName: string; // "admin";
  recUserCode: string; //"admin";
}

export interface HistoryQuery {
  startDate: string;
  endDate: string;
  search: null;
  page: number;
  size: number;
  sortBy: string;
  sortDirection: "desc" | "asc";
}

interface UserGrantHistoryDataContextType {
  rows: HistoryData[];
  loading: boolean;
  error: string | null;
  availablerows: HistoryData[];
  setAvailablerows: Dispatch<SetStateAction<HistoryData[] | []>>;
  ownedrows: HistoryData[];
  setOwnedrows: Dispatch<SetStateAction<HistoryData[] | []>>;
  lastUpdated: any;
  selectedAvailable: HistoryData[];
  setSelectedAvailable: Dispatch<SetStateAction<HistoryData[]>>;
  selectedOwned: HistoryData[];
  setSelectedOwned: Dispatch<SetStateAction<HistoryData[]>>;
  countAva: number;
  setCountAva: Dispatch<SetStateAction<number>>;
  countOwned: number;
  setCountOwned: Dispatch<SetStateAction<number>>;
  fetchAll: () => void;
  fetchrows: () => any;
  historyFilter: HistoryQuery;
  setHistoryFilter: Dispatch<SetStateAction<HistoryQuery>>;
}

const API_ROLE = apiConfigRole.role;

export const UserGrantHistoryDataContext = createContext<
  UserGrantHistoryDataContextType | undefined
>(undefined);

export const UserGrantHistoryDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [rows, setrows] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availablerows, setAvailablerows] = useState<HistoryData[]>([]);
  const [ownedrows, setOwnedrows] = useState<HistoryData[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<HistoryData[]>([]);
  const [selectedOwned, setSelectedOwned] = useState<HistoryData[]>([]);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [countAva, setCountAva] = useState<number>(0);
  const [countOwned, setCountOwned] = useState<number>(0);
  const { GetData } = useCallApi();
  const [historyFilter, setHistoryFilter] = useState<HistoryQuery>({
    startDate: "",
    endDate: "",
    search: null,
    page: 1,
    size: 5,
    sortBy: "userName",
    sortDirection: "asc",
  });
  const { selectedRow } = useUserManagement();

  const fetchrows = async (data: Partial<HistoryQuery> = {}) => {
    setLoading(true);

    const payload: any = {
      ...historyFilter,
      ...data,
      userName: selectedRow?.userName,
    };
    try {
      const response = await GetData(
        `${API_ROLE}/api/prod/users/history`,
        payload,
      );

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch user data");
      }

      const responseData = response?.data;
      // console.log(responseData);

      let list = [];
      let totalCount = 0;

      if (responseData) {
        // Coba berbagai kemungkinan struktur data
        list =
          responseData.list ||
          responseData.data ||
          responseData.content ||
          responseData ||
          [];
        totalCount =
          responseData.totalElements ||
          response.totalRows ||
          responseData.totalCount ||
          responseData.total ||
          responseData.count ||
          (Array.isArray(list) ? list.length : 0);
      }
      // setUser(MockUserMData);
      setAvailablerows(list);
      setCountAva(totalCount);
    } catch (error) {
      //  console.log("error fetching user");
    } finally {
      setLoading(false);
    }
  };

  // const fetchUserrows = (DTO: Partial<PageDto> = {}) => {
  //   const {
  //     search = "",
  //     page = 0,
  //     size = 5,
  //     sortBy = "",
  //     sortDirection = "desc",
  //   } = DTO;

  //   // console.log(DTO);

  //   const response = {
  //     status: 200,
  //     data: {
  //       list: Mockrows,
  //       totalCount: Mockrows.length,
  //       message: "succes",
  //     },
  //   };

  //   return response;
  // };

  const fetchAll = () => {
    setLoading(true);
    try {
      fetchrows();
      // fetchUserrows();
    } catch (error) {
      //  console.log("error somehow");
    } finally {
      setLoading(false);
    }
  };

  const hasFetch = useRef(false);
  const queryChange = useRef(false);

  useEffect(() => {
    if (hasFetch.current) {
      if (queryChange.current) fetchrows();
      else queryChange.current = true;
    }
  }, [historyFilter]);
  useEffect(() => {
    if (!hasFetch.current) {
      fetchrows();
      hasFetch.current = true;
    }
  }, []);

  return (
    <UserGrantHistoryDataContext.Provider
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
        countAva,
        setCountAva,
        countOwned,
        setCountOwned,
        fetchAll,
        fetchrows,
        historyFilter,
        setHistoryFilter,
      }}
    >
      {children}
    </UserGrantHistoryDataContext.Provider>
  );
};

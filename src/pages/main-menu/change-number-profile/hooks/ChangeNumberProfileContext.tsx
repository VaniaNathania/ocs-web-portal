import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { PrimaryNeProps } from "../../upload-simcard/hooks/UploadSimCardContext";
import { toast } from "sonner";
import {
  menuAccess,
  useRoleCheck,
} from "../../role-management/hook/useRoleCheck";

export interface NumberTypeList {
  id: number;
  accNbrTypeName: string;
  comments: string;
  spId: number;
  accNbrTypeCode: string;
}

export interface NumberStateProps {
  accNbrState: string;
  accNbrStateName: string;
  comments: string;
}

export interface AreaDetailProps {
  areaId: number;
  parentId: number;
  areaName: string;
  comments: string;
  areaCode: string;
}

export type AccNbrDetailsProps = PaginationParams & {
  serviceNumber?: string;
  accNbrId?: number;
  prefix?: string;
  accNbr?: string;
  staffId?: number;
  orgId?: number;
  accNbrClassId?: number;
  accNbrClassName?: string;
  accNbrTypeId?: number;
  accNbrTypeName?: string;
  accNbrState?: string;
  hlrId?: number;
  neInfo?: string;
  areaId?: number;
  nbrClassJudgeId?: number;
  stateDate?: string;
  comments?: string;
  ppsPwd?: string;
  preCharging?: string;
  peerOperatorCode?: string;
  npAuthCode?: string;
  isBindingFlag?: string;
  spId?: number;
  orgName?: string;
  accNbrStateName?: string;
  simNbrId?: number;
  iccid?: string;
  accNbrBegin?: string | null;
  accNbrEnd?: string | null;
};

type mode = "view" | "edit";

interface ContextProps {
  fetchPrimaryNe: () => Promise<PrimaryNeProps[] | undefined>;
  fetchNbrTypeList: () => Promise<NumberTypeList[] | undefined>;
  fetchAreaDetail: () => Promise<AreaDetailProps[] | undefined>;
  fetchAccNbrState: () => Promise<NumberStateProps[] | undefined>;
  fetchAccNbrDetails: (
    params: AccNbrDetailsProps,
  ) => Promise<{ data: AccNbrDetailsProps[]; totalCount: number }>;
  primaryNe: PrimaryNeProps[];
  numberTypeList: NumberTypeList[];
  areaDetail: AreaDetailProps[];
  query: AccNbrDetailsProps | {};
  setQuery: Dispatch<SetStateAction<AccNbrDetailsProps>>;
  accNbrDetails: AccNbrDetailsProps[];
  numberStateList: NumberStateProps[];
  selectedItem: AccNbrDetailsProps | null;
  setSelectedItem: Dispatch<SetStateAction<AccNbrDetailsProps | null>>;
  queryTrigger: number;
  setQueryTrigger: Dispatch<SetStateAction<number>>;
  refreshTrigger: number;
  setRefreshTrigger: Dispatch<SetStateAction<number>>;
  setMode: Dispatch<SetStateAction<mode>>;
  mode: mode;
  isReset: boolean;
  setIsReset: Dispatch<SetStateAction<boolean>>;
  currentPage: number | null;
  setCurrentPage: Dispatch<SetStateAction<number | null>>;
  setLastEditedId: Dispatch<SetStateAction<number | null>>;
  accNbrClassList: any[];
  menuPrivAccess: menuAccess;
}

const ChangeNumberProfileListContext = createContext<ContextProps | undefined>(
  undefined,
);

const API_URL_REF = apiConfigRef.ref;

const ChangeNumberProfileContextListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { GetData } = useCallApi();
  const [primaryNe, setPrimaryNe] = useState<PrimaryNeProps[]>([]);
  const [numberTypeList, setNumberTypeList] = useState<NumberTypeList[]>([]);
  const [areaDetail, setAreaDetail] = useState<AreaDetailProps[]>([]);
  const [numberStateList, setNumberStateList] = useState<NumberStateProps[]>(
    [],
  );

  const [query, setQuery] = useState<AccNbrDetailsProps | {}>({
    prefix: "670",
    spId: 0,
  });
  const [accNbrDetails, setAccNbrDetails] = useState<AccNbrDetailsProps[]>([]);
  const [selectedItem, setSelectedItem] = useState<AccNbrDetailsProps | null>(
    null,
  );
  const { checkMenusPriv } = useRoleCheck();
  const [queryTrigger, setQueryTrigger] = useState<number>(0);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [mode, setMode] = useState<mode>("view");
  const [isReset, setIsReset] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const [lastEditedId, setLastEditedId] = useState<number | null>(null);
  const [accNbrClassList, setAccNbrClassList] = useState([]);
  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv(
      "/pages/main-menu/change-number-profile/ChangeNumberProfilePage",
      "addStatus",
    ),
    editStatus: checkMenusPriv(
      "/pages/main-menu/change-number-profile/ChangeNumberProfilePage",
      "editStatus",
    ),
    readStatus: checkMenusPriv(
      "/pages/main-menu/change-number-profile/ChangeNumberProfilePage",
      "readStatus",
    ),
    deleteStatus: checkMenusPriv(
      "/pages/main-menu/change-number-profile/ChangeNumberProfilePage",
      "deleteStatus",
    ),
  };

  const fetchPrimaryNe = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/upload-sim-file/qry-hlr-area-id`,
        {
          areaId: 1,
          isLogicFlag: "N",
        },
      );

      if (response.status) {
        setPrimaryNe(response.data);

        return response.data;
      }
    } catch (err) {
      //  console.log(err);
    }
  };

  const fetchNbrTypeList = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/change-number-profile/qry-acc-nbr-type-list`,
        {},
      );

      if (response.status) {
        setNumberTypeList(response.data);

        return response.data;
      }
    } catch (err) {
      //  console.log(err);
    }
  };

  const fetchAreaDetail = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/change-number-profile/qry-area-detail`,
        {
          areaId: 1,
          spId: 0,
        },
      );

      if (response.status) {
        setAreaDetail(response.data);

        return response.data;
      }
    } catch (err) {
      //  console.log(err);
    }
  };

  const fetchAccNbrState = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/change-number-profile/qry-acc-nbr-state`,
        {},
      );

      if (response.status) {
        setNumberStateList(response.data);

        return response.data;
      }
    } catch (err) {
      //  console.log(err);
    }
  };

  const fetchAccNbrDetails = async ({
    page,
    size,
    sortBy,
    sortDirection,
    search,
    prefix,
    spId,
  }: AccNbrDetailsProps) => {
    const response = await GetData(
      `${API_URL_REF}/change-number-profile/qry-acc-nbr-details`,
      {
        page,
        size,
        sortBy,
        sortDirection,
        search,
        prefix,
        spId,
        ...query,
      },
    );

    if (response.status) {
      setAccNbrDetails(response?.data);

      if (response.data.length === 0) {
        toast.info("No Result Found");
      }

      setSelectedItem(() => {
        // page berubah → select item pertama
        if (currentPage !== null && currentPage !== page) {
          return response.data[0] ?? null;
        }

        // edit → select item edit
        if (lastEditedId) {
          const edited = response.data.find(
            (item: AccNbrDetailsProps) => item.accNbrId === lastEditedId,
          );
          if (edited) return edited;
        }

        // fallback
        return response.data[0] ?? null;
      });

      setLastEditedId(null);
    } else {
      toast.error("Failed Get Data");
    }

    return {
      data: response?.data || [],
      totalCount: response?.totalRows || 0,
    };
  };

  const fetchAccNbrClassList = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/change-number-profile/qry-acc-nbr-class-list`,
        {
          accNbrClassId: null,
          spId: 0,
        },
      );

      if (response?.status) {
        setAccNbrClassList(response?.data);

        return response?.data;
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAreaDetail();
    fetchAccNbrState();
    fetchNbrTypeList();
    fetchPrimaryNe();
    fetchAccNbrClassList();
  }, []);

  return (
    <ChangeNumberProfileListContext.Provider
      value={{
        fetchAccNbrDetails,
        fetchAreaDetail,
        fetchNbrTypeList,
        fetchPrimaryNe,
        fetchAccNbrState,
        primaryNe,
        numberTypeList,
        query,
        setQuery,
        selectedItem,
        accNbrDetails,
        areaDetail,
        numberStateList,
        setSelectedItem,
        queryTrigger,
        setQueryTrigger,
        mode,
        setMode,
        isReset,
        setIsReset,
        refreshTrigger,
        setRefreshTrigger,
        currentPage,
        setCurrentPage,
        setLastEditedId,
        accNbrClassList,
        menuPrivAccess,
      }}
    >
      {children}
    </ChangeNumberProfileListContext.Provider>
  );
};

export {
  ChangeNumberProfileListContext,
  ChangeNumberProfileContextListProvider,
};

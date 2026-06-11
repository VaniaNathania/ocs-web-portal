import { createContext, SetStateAction, useEffect, useMemo, useState } from "react";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";

export interface TimeSpanDatasProps {
  timeSpanId: number;
  timeSpanName: string;
  comments: string;
  spId: number;
}

export interface TimeSpanDetailDatasProps {
  id: {
    timeSpanId: number;
    seq: number;
  };
  cycleBeginDate: string;
  cycleUnit: number;
  timeUnit: string;
  duration: number;
  spId: number;
  splitCdrFlag: string;
  refReAttrFlag: string;
  cycleBeginTimeReAttr: string;
  timeUnitReAttr: string;
  cycleUnitReAttr: number;
  durationReAttr: number;
  adjustBeginDateMode: string;
  beginDateOffset: string;
}

interface ContextProps {
  fetchTimeSpan: () => Promise<TimeSpanDatasProps[] | undefined>;
  fetchTimeSpanDetail: () => Promise<TimeSpanDetailDatasProps[] | undefined>;
  timeSpanDatas: TimeSpanDatasProps[];
  timeSpanDetailDatas: TimeSpanDetailDatasProps[];
  selectedItemSidebar: TimeSpanDatasProps | null;
  setSelectedItemSidebar: (item: TimeSpanDatasProps) => void;
  selectedItemContent: TimeSpanDetailDatasProps | null;
  setSelectedItemContent: (item: TimeSpanDetailDatasProps) => void;
  handleItemSidebarClick: (item: TimeSpanDatasProps) => void;
  handleItemContentClick: (item: TimeSpanDetailDatasProps) => void;
  triggerEditMode: (item: any) => void;
  editTrigger: number;
  triggerDeleteMode: (item: any) => void;
  deleteTrigger: number;
}

const initialProps: ContextProps = {
  fetchTimeSpan: async () => [],
  fetchTimeSpanDetail: async () => [],
  timeSpanDatas: [],
  timeSpanDetailDatas: [],
  selectedItemSidebar: null,
  setSelectedItemSidebar: () => {},
  selectedItemContent: null,
  setSelectedItemContent: () => {},
  handleItemSidebarClick: () => {},
  handleItemContentClick: () => {},
  triggerEditMode: () => {},
  editTrigger: 0,
  triggerDeleteMode: () => {},
  deleteTrigger: 0,
};

const API_URL_REF = apiConfigRef.ref;
// console.log(apiConfigRef);

const TimeSpanContext = createContext<ContextProps>(initialProps);

const TimeSpanContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { GetData } = useCallApi();
  const [selectedItemSidebar, setSelectedItemSidebar] = useState<TimeSpanDatasProps | null>(null);
  const [selectedItemContent, setSelectedItemContent] = useState<TimeSpanDetailDatasProps | null>(null);
  const [timeSpanDatas, setTimeSpanDatas] = useState<TimeSpanDatasProps[]>([]);
  const [timeSpanDetailDatas, setTimeSpanDetailDatas] = useState<TimeSpanDetailDatasProps[]>([]);
  const [editTrigger, setEditTrigger] = useState<number>(0);
  const [deleteTrigger, setDeleteTrigger] = useState<number>(0);

  const fetchTimeSpan = async () => {
    try {
      const response = await GetData(`${API_URL_REF}/api/time-span/qry-time-span`, {});
      if (response?.data) {
        setTimeSpanDatas(response.data);
        return response.data;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTimeSpanDetail = async () => {
    try {
      const response = await GetData(`${API_URL_REF}/api/time-span/qry-time-span-detail`, {
        timeSpanId: selectedItemSidebar?.timeSpanId,
        spId: 0,
      });

      if (response?.data) {
        setTimeSpanDetailDatas(response.data);
        setSelectedItemContent(response.data[0] ?? null);
        return response.data;
      }
    } catch (err) {
      console.error("fetchTimeSpanDetail error:", err);
    }
  };

  useEffect(() => {
    fetchTimeSpan();
  }, []);

  useEffect(() => {
    if (selectedItemSidebar?.timeSpanId) {
      fetchTimeSpanDetail();
    }
  }, [selectedItemSidebar]);

  const handleItemSidebarClick = (item: TimeSpanDatasProps) => {
    setSelectedItemSidebar(item);
  };

  const handleItemContentClick = (item: TimeSpanDetailDatasProps) => {
    setSelectedItemContent(item);
  };

  const triggerEditMode = (item: any) => {
    setSelectedItemContent(item);
    setEditTrigger((prev) => prev + 1);
  };

  const triggerDeleteMode = (item: any) => {
    setSelectedItemContent(item);
    setDeleteTrigger((prev) => prev + 1);
  };

  return (
    <TimeSpanContext.Provider
      value={{
        timeSpanDatas,
        timeSpanDetailDatas,
        fetchTimeSpan,
        fetchTimeSpanDetail,
        selectedItemSidebar,
        setSelectedItemSidebar,
        handleItemSidebarClick,
        selectedItemContent,
        setSelectedItemContent,
        handleItemContentClick,
        triggerEditMode,
        editTrigger,
        triggerDeleteMode,
        deleteTrigger,
      }}
    >
      {children}
    </TimeSpanContext.Provider>
  );
};

export { TimeSpanContext, TimeSpanContextProvider };

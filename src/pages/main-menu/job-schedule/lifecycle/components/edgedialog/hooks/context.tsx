import React, {
  createContext,
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { apiConfigRef } from "@/config/api.config";
import { Edge } from "@xyflow/react";
import { useLifeCycle } from "../../../hooks/context";
import {
  edgeData,
  EventList,
  LifeCycleBc,
  LifeCycleFuncBc,
  UserData,
} from "../../../interface";
import { adviceTypeContentProps } from "@/pages/main-menu/data-reference/advice-type/hooks/AdviceTypeContext";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { SubsEventList } from "@/pages/main-menu/data-reference/event/hooks/EventContext";
import {
  Control,
  FieldErrors,
  useForm,
  UseFormRegister,
  UseFormSetValue,
  UseFormTrigger,
  UseFormWatch,
} from "react-hook-form";
import { EventListSchema, EventListZod } from "../../../types/zodTypes";
import { zodResolver } from "@hookform/resolvers/zod";

interface EdgeDialogContextType {
  edge?: Edge;
  setEdge: Dispatch<SetStateAction<Edge | undefined>>;

  eventList: EventList[];
  setEventList: Dispatch<SetStateAction<EventList[]>>;
  adviceTypes: adviceTypeContentProps[];
  setAdviceTypes: Dispatch<SetStateAction<adviceTypeContentProps[]>>;
  recAdvice: adviceTypeContentProps[];
  setRecAdvice: Dispatch<SetStateAction<adviceTypeContentProps[]>>;
  subsEvent: SubsEventList[];
  setSubsEvent: Dispatch<SetStateAction<SubsEventList[]>>;
  lcBc: LifeCycleBc[];
  setLcBc: Dispatch<SetStateAction<LifeCycleBc[]>>;
  lcBcFunc: LifeCycleFuncBc[];
  setLcBcFunc: Dispatch<SetStateAction<LifeCycleFuncBc[]>>;

  selectedEvent?: EventList;
  setSelectedEvent: Dispatch<SetStateAction<EventList | undefined>>;
  eventDetail?: EventList;
  setEventDetail: Dispatch<SetStateAction<EventList | undefined>>;
  recordEvent: RefObject<Record<string | number, string>>;

  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  register: UseFormRegister<EventListZod>;
  control: Control<EventListZod>;
  errors: FieldErrors<EventListZod>;
  setValue: UseFormSetValue<EventListZod>;
  trigger: UseFormTrigger<EventListZod>;
  watch: UseFormWatch<EventListZod>;

  FormValid: () => Promise<boolean>;
  updateEventList: (evn: EventList) => void;

  addEvent: () => void;
  delEvent: (evn: EventList) => void;
  moveEvent: (evn: EventList) => void;
}

// Create the context with proper typing
export const EdgeDialogContext = createContext<
  EdgeDialogContextType | undefined
>(undefined);

const API_URL = apiConfigRef.ref;

export const EdgeDialogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { selectedEdge } = useLifeCycle();
  const { GetData } = useCallApi();
  const [edge, setEdge] = useState<Edge>();
  const [eventList, setEventList] = useState<EventList[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventList>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [userData, setUserData] = useState<UserData>();
  const [adviceTypes, setAdviceTypes] = useState<adviceTypeContentProps[]>([]);
  const [subsEvent, setSubsEvent] = useState<SubsEventList[]>([]);
  const [lcBc, setLcBc] = useState<LifeCycleBc[]>([]);
  const [lcBcFunc, setLcBcFunc] = useState<LifeCycleFuncBc[]>([]);

  const [recAdvice, setRecAdvice] = useState<adviceTypeContentProps[]>([]);
  const [eventDetail, setEventDetail] = useState<EventList>();
  const fetchRef = useRef(false);
  const recordEvent = useRef<Record<string | number, string>>({});

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<EventListZod>({
    resolver: zodResolver(EventListSchema),
    defaultValues: selectedEvent,
  });

  const formVal = watch();
  const isSwitchingRef = useRef(false);

  useEffect(() => {
    // console.log("ini selected event", selectedEvent);
    if (!selectedEvent) return setEventDetail(undefined);
    const temp: EventList = {
      ...selectedEvent,
      subsEventId: selectedEvent?.subsEventId,
    };

    setEventDetail(temp);
    reset(temp);
    // console.log(adviceTypes, selectedEvent.adviceType);

    const tempAdviceTypes = adviceTypes.filter((item) =>
      selectedEvent.adviceType?.includes(item.adviceType.toString()),
    );
    subsEvent.forEach(
      (item) => (recordEvent.current[item.subsEventId] = item.eventName),
    );
    // console.log(tempAdviceTypes, selectedEvent.adviceType);
    setRecAdvice(tempAdviceTypes);
  }, [selectedEvent, adviceTypes]);

  const fetchAdvicetypes = async () => {
    setIsLoading(true);
    try {
      const [adviceResp, subsEventResp, lcBcResp, lcBcFuncResp] =
        await Promise.all([
          GetData(`${API_URL}/api/advice-type/qry-advice-type`, {
            sortBy: "ADVICE_TYPE",
            sortDirection: "asc",
          }),
          GetData(`${API_URL}/api/event/qry-subs-event-list`, {
            sortBy: "SUBS_EVENT_ID",
            sortDirection: "asc",
          }),
          GetData(`${API_URL}/api/lifecycle-type/qry-lifecycle-bc`, {}),
          GetData(`${API_URL}/api/lifecycle-type/QryFuncLifeCycleBC`, {}),
        ]);

      if (adviceResp.status) {
        setAdviceTypes(adviceResp.data);
      }

      if (subsEventResp.status) {
        setSubsEvent(subsEventResp.data);
      }

      if (lcBcResp.status) {
        setLcBc(lcBcResp.data);
      }

      if (lcBcFuncResp.status) {
        setLcBcFunc(lcBcFuncResp.data);
      }

      setEdge(selectedEdge);
    } catch (error) {
      toast.error("error fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!edge?.data) return;
    const data: any = edge?.data;
    const { jsonData } = data as edgeData;

    setUserData(jsonData.userData);

    const tempList: EventList[] = jsonData.userData.eventList ?? [];

    setEventList(tempList);
    setSelectedEvent(tempList[0]);
  }, [edge]);

  // useEffect(() => {
  //   setSelectedEvent(eventList[0]);
  // }, [eventList]);

  const addEvent = () => {
    const isThereNewEvent = eventList.find((evn) => evn.subsEventId == "0");
    if (isThereNewEvent) {
      return setSelectedEvent(isThereNewEvent);
    }
    const event: EventList = {
      subsEventId: "0",
      srcProdState: userData?.startState?.prodState ?? "",
      objProdState: userData?.endState?.prodState ?? "",
      timer: 0,
      adviceType: [],
      eventProcess: [],
      bcId: "",
    };
    setEventList((el) => [...el, event]);
    setSelectedEvent(event);
  };

  const delEvent = (evn: EventList) => {
    const tempList: EventList[] = eventList.filter(
      (ch) => ch.subsEventId != evn.subsEventId,
    );
    // console.log(tempList[0]);

    if (tempList.length > 0) setSelectedEvent(tempList[0]);
    else setSelectedEvent(undefined);
    return setEventList(tempList);
  };

  const onSubmit = (data: EventListZod): boolean => {
    console.log("ini data");

    return true;
  };

  const updateEventList = (evn: EventList) => {
    if (!selectedEvent) return;

    // console.log(selectedEvent);

    const index = eventList.findIndex(
      (item) => item.subsEventId == selectedEvent.subsEventId,
    );

    //  console.log(recAdvice);

    if (index === -1) return;

    const updatedEvent: EventList = {
      ...formVal,
      subsEventId: evn.subsEventId,
      adviceType: recAdvice.map((item) => item.adviceType.toString()),
    };

    //  console.log(updatedEvent);

    const tempList = [...eventList];
    tempList[index] = updatedEvent;

    setEventList(tempList);
    setSelectedEvent(updatedEvent);
  };
  useEffect(() => {
    if (isSwitchingRef.current) return;

    if (formVal.subsEventId !== eventDetail?.subsEventId) {
      updateEventList(formVal);
    }
  }, [formVal]);

  const FormValid = async (): Promise<boolean> => {
    const valid = await trigger();

    console.log("check from valid", valid, errors, formVal);

    return valid;
  };

  const moveEvent = async (evn: EventList) => {
    isSwitchingRef.current = true;

    await handleSubmit(onSubmit)();

    //  console.log(isValid, errors);

    if (!isValid) {
      isSwitchingRef.current = false;
      return;
    }

    updateEventList(selectedEvent!);
    setSelectedEvent(evn);

    isSwitchingRef.current = false;
  };

  useEffect(() => {
    if (!fetchRef.current) {
      fetchRef.current = true;
      fetchAdvicetypes();
    }
  }, []);

  const value: EdgeDialogContextType = {
    edge,
    setEdge,
    register,
    control,
    errors,
    setValue,
    trigger,
    watch,

    eventList,
    setEventList,
    subsEvent,
    setSubsEvent,
    adviceTypes,
    setAdviceTypes,
    recAdvice,
    setRecAdvice,
    lcBc,
    setLcBc,
    lcBcFunc,
    setLcBcFunc,

    selectedEvent,
    setSelectedEvent,
    eventDetail,
    setEventDetail,
    recordEvent,
    isLoading,
    setIsLoading,

    FormValid,

    updateEventList,
    addEvent,
    delEvent,
    moveEvent,
  };

  return (
    <EdgeDialogContext.Provider value={value}>
      {children}
    </EdgeDialogContext.Provider>
  );
};

// Custom hook to use the context
export const useEdgeDialog = () => {
  const context = useContext(EdgeDialogContext);
  if (context === undefined) {
    throw new Error("useEdgeDialog must be used within an EdgeDialogProvider");
  }
  return context;
};

export default EdgeDialogContext;

import { DataGridProvider } from "@/components";
import { createContext, useState } from "react";
import WorkFlowRule from "../WorkFlowRule";
import {
  initialFormWorkFlow,
  DetailWorkFlowList,
  RatableEventName,
  InitWorkFlowByType,
  loadingDatas,
} from "../types/type";
import DialogWorkFlowRule from "../block/DialogWorkFlowRule";
import { toast } from "sonner";
import { useConfirmDialog } from "@/providers/ConfirmDialogProvider";
import { useWorkFlowRuleApi } from "../apiList/useWorkFlowRuleApi";
import { menuAccess, useRoleCheck } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface ContextProps {
  showDialog: { show: boolean; mode: "create" | "update" };
  selectedDatas: DetailWorkFlowList | null;
  isSubmitting: boolean;
  tabDetail: string;
  isDeleting: boolean;
  ratable: RatableEventName[];
  reloads: number;
  recurringOptions: InitWorkFlowByType[];
  postOptions: InitWorkFlowByType[];
  searchValue: string;
  dataSearch: DetailWorkFlowList[];
  placeHolder: string;
  loading: loadingDatas;
  preProcc: InitWorkFlowByType[];

  setSelectedDatas: (user: DetailWorkFlowList) => void;
  setIsSubmitting: (value: boolean) => void;
  setTabDetail: (value: string) => void;
  setIsDeleting: (value: boolean) => void;
  setRatable: (value: RatableEventName[]) => void;
  setReloads: (value: number) => void;
  setRecurringOptions: (value: InitWorkFlowByType[]) => void;
  setPostOptions: (value: InitWorkFlowByType[]) => void;
  setSearchValue: (value: string) => void;
  setDataSearch: (value: DetailWorkFlowList[]) => void;
  setPlaceHolder: (value: string) => void;
  setLoading: React.Dispatch<React.SetStateAction<loadingDatas>>;
  setPreProcc: (value: InitWorkFlowByType[]) => void;

  openDialog: (mode: "create" | "update", user?: DetailWorkFlowList) => void;
  closeDialog: () => void;
  onSubmit: (data: DetailWorkFlowList) => Promise<void>;
  handleDeleteDatas: (id: number) => void;
  fetchRatableName: (spId: number) => void;
  fetchWorkFlowOptions: (spId: number) => void;
  triggerReload: () => void;
  // fetchDataSearch: () => void;
  // filterDataSearch: DetailWorkFlowList[];
  menuPrivAccess?: menuAccess
}

const InitialProps: ContextProps = {
  showDialog: { show: false, mode: "create" },
  selectedDatas: null,
  isSubmitting: false,
  tabDetail: "",
  isDeleting: false,
  ratable: [],
  reloads: 0,
  recurringOptions: [],
  postOptions: [],
  searchValue: "",
  dataSearch: [],
  placeHolder: "",
  loading: { option: false, table: false },
  preProcc: [],

  setIsSubmitting: () => {},
  setSelectedDatas: () => {},
  setReloads: () => {},
  setTabDetail: () => {},
  triggerReload: () => {},
  onSubmit: async () => {},
  setIsDeleting: () => {},
  setDataSearch: () => {},
  setPlaceHolder: () => {},
  setSearchValue: () => {},
  handleDeleteDatas: () => {},
  setRatable: () => {},
  fetchRatableName: () => {},
  openDialog: () => {},
  closeDialog: () => {},
  setPostOptions: () => {},
  setRecurringOptions: () => {},
  fetchWorkFlowOptions: () => {},
  setLoading: () => {},
  setPreProcc: () => {},
  // fetchDataSearch: async () => {},
  // filterDataSearch: [],
  menuPrivAccess: undefined
};

const WorkFlowRuleModuleContext = createContext<ContextProps>(InitialProps);

const WorkFlowRuleContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    createWorkFlowRule,
    deleteWorkFlowType,
    getDetailRecurringProc,
    getRatableEventName,
    updateWorkFlowRule,
    getWorkFlowTypeD,
    getWorkFlowTypeE,
    getWorkFlowByType,
    getWorkFlowTypeC,
  } = useWorkFlowRuleApi();

  const {checkMenusPriv} = useRoleCheck()

  const menuPrivAccess:menuAccess = {
    addStatus: checkMenusPriv("/main-menu/data-reference/workflow-rule-recurring-event/WorkFlowRule", "addStatus"),
    deleteStatus: checkMenusPriv("/main-menu/data-reference/workflow-rule-recurring-event/WorkFlowRule", "deleteStatus"),
    editStatus: checkMenusPriv("/main-menu/data-reference/workflow-rule-recurring-event/WorkFlowRule", "editStatus"),
    readStatus: checkMenusPriv("/main-menu/data-reference/workflow-rule-recurring-event/WorkFlowRule", "readStatus"),
  }

  const [showDialog, setShowDialog] = useState<{
    show: boolean;
    mode: "create" | "update";
  }>({
    show: false,
    mode: "create",
  });

  const isEdit = showDialog.mode === "update";

  const [selectedDatas, setSelectedDatas] = useState<DetailWorkFlowList | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabDetail, setTabDetail] = useState("Detail");
  const [isDeleting, setIsDeleting] = useState(false);
  const [ratable, setRatable] = useState<RatableEventName[]>([]);
  const [reloads, setReloads] = useState(0);
  const [recurringOptions, setRecurringOptions] = useState<
    InitWorkFlowByType[]
  >([]);
  const [postOptions, setPostOptions] = useState<InitWorkFlowByType[]>([]);
  const [preProcc, setPreProcc] = useState<InitWorkFlowByType[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [placeHolder, setPlaceHolder] = useState("");
  const [dataSearch, setDataSearch] = useState<DetailWorkFlowList[]>([]);
  const [loading, setLoading] = useState<loadingDatas>({
    option: false,
    table: false,
  });
  const { confirm } = useConfirmDialog();

  const onSubmit = async (data: DetailWorkFlowList) => {
    setIsSubmitting(true);

    const payload: createWorkFlow = {
      id: data.reId || 0,
      workflowId: data.workflowId || 0,
      preWorkflowId: data.preWorkflowId || null,
      postWorkflowId: data.postWorkflowId || null,
      spId: data.spId || 0,
    };

    try {
      // Update
      if (isEdit && selectedDatas) {
        const response = await updateWorkFlowRule(payload);

        if (response?.status) {
          toast.success("Success");
          closeDialog();
          triggerReload();
        } else {
          toast.error("Name same please Check field");
        }
      } else {
        // create
        const response = await createWorkFlowRule(payload);
        if (response?.status) {
          toast.success("Success");
          closeDialog();
          triggerReload();
        } else {
          toast.error("Name same please Check field");
        }
      }
    } catch (error) {
      toast.error("Please Check field");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerReload = () => {
    setReloads((prev) => prev + 1);
  };

  const openDialog = (mode: "create" | "update", user?: DetailWorkFlowList) => {
    setShowDialog({ show: true, mode });
    setSelectedDatas(user ?? null);
  };

  const closeDialog = () => {
    setShowDialog({ show: false, mode: "create" });
    setSelectedDatas(null);
  };

  const fetchRatableName = async (spId: number) => {
    try {
      const response = await getRatableEventName(spId);
      if (response?.data) {
        setRatable(response.data);
      }
    } catch (error) {
      toast.error("Error Get Type Data");
    }
  };

  const fetchWorkFlowOptions = async (spId: number) => {
    try {
      // TYPE D
      const responseD = await getWorkFlowTypeD(spId);
      if (responseD?.data) {
        setRecurringOptions(responseD.data);
      }
      // TYPE E
      const responseE = await getWorkFlowTypeE(spId);
      if (responseE?.data) {
        setPostOptions(responseE.data);
      }
      // C
      const responseC = await getWorkFlowTypeC(spId);

      if (responseC?.data) {
        setPreProcc(responseC.data);
      }
    } catch (error) {
      toast.error("Error Loading WorkFlow Options");
    }
  };

  // const fetchDataSearch = async () => {
  //   try {
  //     const response = await getDetailRecurringProc({
  //       page: 1,
  //       size: 999,
  //       sortBy: "RE_ID",
  //       sortDirection: "ASC",
  //       spId: 0,
  //     });

  //     if (response?.data) {
  //       setDataSearch(response.data);
  //     }
  //     return response;
  //   } catch (error) {
  //     toast.error("Error Loading Search Data");
  //   }
  // };

  // const filterDataSearch = dataSearch.filter((item) => {
  //   if (!searchValue) return true;

  //   const searchLower = searchValue.toLowerCase();
  //   const reIdMatch = item.reId?.toString().toLowerCase().includes(searchLower);
  //   const reNameMatch = item.reName?.toLocaleLowerCase().includes(searchLower);

  //   return reIdMatch || reNameMatch;
  // });

  const handleDeleteDatas = (id: number) => {
    confirm({
      title: "Delete Ratable Resource Name ",
      message:
        "Are you sure want to delete this Ratable Resource Name? This action cannot be undone",
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const success = await deleteWorkFlowType(id);
          if (success?.status) {
            toast.success("Delete Success");
            triggerReload();
          }
        } catch (error) {
          toast.error("Error Deleting Data. Please check Yourr Connection!!");
        } finally {
          setIsDeleting(false);
        }
      },
      isDeleting,
    });
  };

  return (
    <WorkFlowRuleModuleContext.Provider
      value={{
        showDialog,
        selectedDatas,
        isSubmitting,
        tabDetail,
        isDeleting,
        ratable,
        reloads,
        postOptions,
        recurringOptions,
        searchValue,
        dataSearch,
        placeHolder,
        loading,
        preProcc,
        setPreProcc,
        setLoading,
        setPlaceHolder,
        setDataSearch,
        setSearchValue,
        setPostOptions,
        setRecurringOptions,
        setReloads,
        setRatable,
        setIsDeleting,
        setIsSubmitting,
        setSelectedDatas,
        setTabDetail,
        openDialog,
        closeDialog,
        onSubmit,
        handleDeleteDatas,
        fetchRatableName,
        triggerReload,
        fetchWorkFlowOptions,
        menuPrivAccess,
        // fetchDataSearch,
        // filterDataSearch,
      }}
    >
      {children}
    </WorkFlowRuleModuleContext.Provider>
  );
};

export { WorkFlowRuleModuleContext, WorkFlowRuleContextProvider };
